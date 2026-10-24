import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createReplyingSignal, type ReplyingEvent, type ReplyingPayload } from "./replying-signal";

function fakeChannel() {
  const sent: Array<[ReplyingEvent, ReplyingPayload]> = [];
  return { sent, trigger: (event: ReplyingEvent, payload: ReplyingPayload) => sent.push([event, payload]) };
}

describe("replying signal", () => {
  it("sends the first 'is replying' once the channel subscribes (autofocus case)", () => {
    const signal = createReplyingSignal();
    const channel = fakeChannel();

    // The reply box autofocuses before the collision effect runs.
    signal.start("u_a", "Agent A");
    signal.attach(channel.trigger);
    assert.deepEqual(channel.sent, []);

    signal.markSubscribed();
    assert.deepEqual(channel.sent, [["client-replying-start", { userId: "u_a", name: "Agent A" }]]);
  });

  it("sends straight away once subscribed", () => {
    const signal = createReplyingSignal();
    const channel = fakeChannel();
    signal.attach(channel.trigger);
    signal.markSubscribed();
    signal.start("u_a", "Agent A");
    signal.stop("u_a");
    assert.deepEqual(channel.sent, [
      ["client-replying-start", { userId: "u_a", name: "Agent A" }],
      ["client-replying-stop", { userId: "u_a" }],
    ]);
  });

  it("sends nothing if the agent left the box before the channel subscribed", () => {
    const signal = createReplyingSignal();
    const channel = fakeChannel();
    signal.attach(channel.trigger);
    signal.start("u_a", "Agent A");
    signal.stop("u_a");
    signal.markSubscribed();
    assert.deepEqual(channel.sent, []);
  });

  it("resends the current state on the next conversation's channel", () => {
    const signal = createReplyingSignal();
    const first = fakeChannel();
    signal.attach(first.trigger);
    signal.markSubscribed();
    signal.start("u_a", "Agent A");

    // Conversation changes while the reply box keeps focus.
    signal.detach();
    const second = fakeChannel();
    signal.attach(second.trigger);
    assert.deepEqual(second.sent, []);
    signal.markSubscribed();
    assert.deepEqual(second.sent, [["client-replying-start", { userId: "u_a", name: "Agent A" }]]);
    assert.equal(first.sent.length, 1);
  });

  it("does not trigger after detach or send twice on a repeated subscription_succeeded", () => {
    const signal = createReplyingSignal();
    const channel = fakeChannel();
    signal.attach(channel.trigger);
    signal.start("u_a", "Agent A");
    signal.markSubscribed();
    signal.markSubscribed();
    assert.equal(channel.sent.length, 1);

    signal.detach();
    signal.stop("u_a");
    signal.start("u_a", "Agent A");
    signal.markSubscribed();
    assert.equal(channel.sent.length, 1);
  });
});
