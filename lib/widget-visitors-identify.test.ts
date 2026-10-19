import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";

import {
  identifyWidgetVisitor,
  type StoredVisitor,
  type WidgetIdentifyDeps,
} from "./widget-visitors-identify";

type Call = unknown[];

function harness(options: { identitySecret?: string | null } = {}) {
  const visitors = new Map<string, StoredVisitor & { metadata?: unknown }>();
  const tracked: Call[] = [];
  const assigned: Call[] = [];
  let nextId = 1;

  const deps: WidgetIdentifyDeps = {
    db: {
      async findWorkspaceIdByAppId(appId) {
        return appId === "app_1" ? "ws_1" : null;
      },
      async findIdentitySecret() {
        return options.identitySecret ?? null;
      },
      async findVisitorByExternalId(_workspaceId, externalId) {
        for (const visitor of visitors.values()) {
          if (visitor.externalId === externalId) return { ...visitor };
        }
        return null;
      },
      async findVisitorById(id) {
        const visitor = visitors.get(id);
        return visitor ? { ...visitor } : null;
      },
      async updateVisitor(id, data) {
        const visitor = visitors.get(id);
        if (!visitor) throw new Error("not found");
        if (data.externalId !== undefined) visitor.externalId = data.externalId;
        if (data.name !== undefined) visitor.name = data.name as string | null;
        if (data.email !== undefined)
          visitor.email = data.email as string | null;
        if (data.metadata !== undefined) visitor.metadata = data.metadata;
      },
      async createVisitor(data) {
        const id = `vis_${nextId++}`;
        visitors.set(id, {
          id,
          externalId: data.externalId ?? null,
          name: (data.name as string | null) ?? null,
          email: (data.email as string | null) ?? null,
          metadata: data.metadata,
        });
        return { id };
      },
    },
    async autoAssignCompany(...args) {
      assigned.push(args);
    },
    async trackCustomerEvent(...args) {
      tracked.push(args);
    },
    createVisitorToken: (visitorId, workspaceId) =>
      `token:${visitorId}:${workspaceId}`,
    verifyVisitorToken: (token) => {
      const [prefix, visitorId, workspaceId] = token.split(":");
      return prefix === "token" && visitorId && workspaceId
        ? { visitorId, workspaceId }
        : null;
    },
  };

  return { deps, visitors, tracked, assigned };
}

describe("POST /api/widget/visitors identify (route core)", () => {
  it("creates a visitor, then skips the event and company match on an unchanged repeat", async () => {
    const h = harness();
    const first = await identifyWidgetVisitor(
      { appId: "gd_pub_app_1", name: "Jane", email: "jane@acme.test" },
      h.deps,
    );
    assert.equal(first.status, 200);
    assert.equal(h.tracked.length, 1);
    assert.equal(h.assigned.length, 1);

    const token = first.body.visitorToken as string;
    const repeat = await identifyWidgetVisitor(
      {
        appId: "app_1",
        visitorToken: token,
        name: "Jane",
        email: "jane@acme.test",
      },
      h.deps,
    );
    assert.equal(repeat.status, 200);
    assert.equal(repeat.body.visitorId, first.body.visitorId);
    assert.equal(h.tracked.length, 1, "no second customer.identified event");
    assert.equal(h.assigned.length, 1, "no second autoAssignCompany call");
  });

  it("tracks and reassigns when the email changes on the token path", async () => {
    const h = harness();
    const first = await identifyWidgetVisitor(
      { appId: "app_1", name: "Jane", email: "jane@acme.test" },
      h.deps,
    );
    await identifyWidgetVisitor(
      {
        appId: "app_1",
        visitorToken: first.body.visitorToken,
        name: "Jane",
        email: "jane@newco.test",
      },
      h.deps,
    );
    assert.equal(h.tracked.length, 2);
    assert.equal(h.tracked[1]?.[2], "customer.identified");
    assert.equal(h.assigned.length, 2);
    assert.equal(h.assigned[1]?.[2], "jane@newco.test");
  });

  it("skips the event and company match for an unchanged verified externalId repeat", async () => {
    const secret = "s3cret";
    const userHash = createHmac("sha256", secret)
      .update("user_1")
      .digest("hex");
    const h = harness({ identitySecret: secret });
    const body = {
      appId: "app_1",
      externalId: "user_1",
      userHash,
      name: "Jane",
      email: "jane@acme.test",
    };

    await identifyWidgetVisitor(body, h.deps);
    assert.equal(h.tracked.length, 1);
    assert.equal(h.assigned.length, 1);

    const repeat = await identifyWidgetVisitor(
      { ...body, metadata: { plan: "pro" } },
      h.deps,
    );
    assert.equal(repeat.status, 200);
    assert.equal(h.tracked.length, 1);
    assert.equal(h.assigned.length, 1);
    assert.deepEqual(h.visitors.get("vis_1")?.metadata, { plan: "pro" });

    await identifyWidgetVisitor({ ...body, name: "Jane D" }, h.deps);
    assert.equal(h.tracked.length, 2);
    assert.equal(h.assigned.length, 2);
  });

  it("keeps the BUG-001 rules: 403 on a bad hash, 401 on an unknown app, 400 without appId", async () => {
    const h = harness({ identitySecret: "s3cret" });
    const bad = await identifyWidgetVisitor(
      { appId: "app_1", externalId: "user_1", userHash: "nope" },
      h.deps,
    );
    assert.equal(bad.status, 403);
    assert.equal(
      (await identifyWidgetVisitor({ appId: "other" }, h.deps)).status,
      401,
    );
    assert.equal((await identifyWidgetVisitor({}, h.deps)).status, 400);
    assert.equal(h.visitors.size, 0);
    assert.equal(h.tracked.length, 0);
  });

  it("returns 403 when a secret is set and userHash is missing, without touching the stored visitor", async () => {
    const h = harness({ identitySecret: "s3cret" });
    h.visitors.set("vis_known", {
      id: "vis_known",
      externalId: "user_1",
      name: "Jane",
      email: "jane@acme.test",
    });
    let lookups = 0;
    const findByExternalId = h.deps.db.findVisitorByExternalId;
    h.deps.db.findVisitorByExternalId = async (...args) => {
      lookups += 1;
      return findByExternalId(...args);
    };

    for (const userHash of [undefined, "", null]) {
      const result = await identifyWidgetVisitor(
        {
          appId: "app_1",
          externalId: "user_1",
          userHash,
          name: "Mallory",
          email: "mallory@evil.test",
        },
        h.deps,
      );
      assert.equal(result.status, 403, `userHash ${String(userHash)}`);
      assert.equal(typeof result.body.error, "string");
      assert.equal(result.body.visitorToken, undefined);
    }

    assert.equal(lookups, 0, "no lookup by externalId without a valid hash");
    assert.equal(h.visitors.size, 1);
    assert.deepEqual(h.visitors.get("vis_known"), {
      id: "vis_known",
      externalId: "user_1",
      name: "Jane",
      email: "jane@acme.test",
    });
    assert.equal(h.tracked.length, 0);
    assert.equal(h.assigned.length, 0);
  });

  it("drops the userId when no secret is set, so the visitor stays anonymous", async () => {
    const h = harness({ identitySecret: null });
    h.visitors.set("vis_known", {
      id: "vis_known",
      externalId: "user_1",
      name: "Jane",
      email: "jane@acme.test",
    });

    const result = await identifyWidgetVisitor(
      { appId: "app_1", externalId: "user_1", name: "Guest" },
      h.deps,
    );

    assert.equal(result.status, 200);
    assert.notEqual(result.body.visitorId, "vis_known", "not merged");
    const created = h.visitors.get(result.body.visitorId as string);
    assert.equal(created?.externalId, null);
    assert.equal(created?.name, "Guest");
    assert.deepEqual(h.visitors.get("vis_known"), {
      id: "vis_known",
      externalId: "user_1",
      name: "Jane",
      email: "jane@acme.test",
    });
    assert.equal(h.tracked.length, 1);
    assert.equal(
      (h.tracked[0]?.[4] as { externalId: unknown }).externalId,
      null,
    );

    // A token for the anonymous visitor plus a userId still does not set it.
    await identifyWidgetVisitor(
      {
        appId: "app_1",
        visitorToken: result.body.visitorToken,
        externalId: "user_1",
      },
      h.deps,
    );
    assert.equal(
      h.visitors.get(result.body.visitorId as string)?.externalId,
      null,
    );
  });
});
