/**
 * Entry point for automation rules. Call sites build events with
 * lib/automations/events.ts and pass them to fireAutomations() after their
 * write has committed. The rules run after the response with after(), so a
 * rule never slows down or fails the request.
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */
import { after } from "next/server";

import { prisma } from "@/lib/db";
import {
  runAutomationEvent,
  scheduleAutomationEvents,
  type EngineDeps,
} from "@/lib/automations/engine";
import type { AutomationEvent } from "@/lib/automations/events";
import { createPrismaAutomationStore } from "@/lib/automations/prisma-store";
import { processUnassignedFor } from "@/lib/automations/unassigned";
import { changeConversationStatus, type StatusChangeInput } from "@/lib/conversations/status";
import { prismaStatusDeps } from "@/lib/conversations/status-prisma";
import { safeTrigger } from "@/lib/pusher-server";
import { postSlackWebhook } from "@/lib/slack";
import { dispatchWebhooks } from "@/lib/webhooks";

export function automationDeps() {
  return {
    store: createPrismaAutomationStore(prisma),
    effects: {
      async trigger(channel: string, event: string, data: unknown, label: string) {
        await safeTrigger(channel, event, data, label);
      },
      webhook: dispatchWebhooks,
      postSlack: postSlackWebhook,
      changeStatus: (input: StatusChangeInput) => changeConversationStatus(input, prismaStatusDeps()),
    },
  } satisfies EngineDeps;
}

/** Runs the events in order after the response. Never throws. */
export function fireAutomations(events: AutomationEvent | AutomationEvent[]): void {
  scheduleAutomationEvents(Array.isArray(events) ? events : [events], {
    after,
    run: (event) => runAutomationEvent(event, automationDeps()),
  });
}

/** The "unassigned for" check, for one workspace or all of them. */
export function runUnassignedAutomations(workspaceId?: string) {
  return processUnassignedFor(automationDeps(), workspaceId);
}
