import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  identifyCacheStorageKey,
  rememberIdentify,
  shouldSendIdentify,
  type IdentifyCacheStorage,
} from "./identify-cache";

function memoryStorage(): IdentifyCacheStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

const visitor = {
  visitorId: "vis_1",
  name: "Jane",
  email: "jane@acme.test",
};

describe("identify cache", () => {
  it("sends the first identify and skips an unchanged repeat", () => {
    const storage = memoryStorage();
    assert.equal(shouldSendIdentify(storage, "app_1", visitor), true);
    rememberIdentify(storage, "app_1", visitor);
    assert.equal(shouldSendIdentify(storage, "app_1", { ...visitor }), false);
  });

  it("sends again when name, email, or userId change", () => {
    const storage = memoryStorage();
    rememberIdentify(storage, "app_1", visitor);
    assert.equal(
      shouldSendIdentify(storage, "app_1", { ...visitor, name: "Jane D" }),
      true,
    );
    assert.equal(
      shouldSendIdentify(storage, "app_1", {
        ...visitor,
        email: "j@acme.test",
      }),
      true,
    );
    assert.equal(
      shouldSendIdentify(storage, "app_1", { ...visitor, userId: "u_1" }),
      true,
    );
  });

  it("sends again for a different visitor", () => {
    const storage = memoryStorage();
    rememberIdentify(storage, "app_1", visitor);
    assert.equal(
      shouldSendIdentify(storage, "app_1", { ...visitor, visitorId: "vis_2" }),
      true,
    );
  });

  it("keeps a separate entry per appId", () => {
    const storage = memoryStorage();
    rememberIdentify(storage, "app_1", visitor);
    assert.equal(shouldSendIdentify(storage, "app_2", visitor), true);
    assert.ok(storage.data.has(identifyCacheStorageKey("app_1")));
    assert.ok(!storage.data.has(identifyCacheStorageKey("app_2")));
  });

  it("does not confuse field boundaries", () => {
    const storage = memoryStorage();
    rememberIdentify(storage, "app_1", { name: "a|b", email: "c" });
    assert.equal(
      shouldSendIdentify(storage, "app_1", { name: "a", email: "b|c" }),
      true,
    );
  });

  it("always sends when storage is missing or throws", () => {
    assert.equal(shouldSendIdentify(null, "app_1", visitor), true);
    const broken: IdentifyCacheStorage = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    };
    assert.doesNotThrow(() => rememberIdentify(broken, "app_1", visitor));
    assert.equal(shouldSendIdentify(broken, "app_1", visitor), true);
  });
});
