import { z } from "zod";

export const automationRuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  trigger: z.enum([
    "CONVERSATION_CREATED",
    "CONVERSATION_CLOSED",
    "MESSAGE_RECEIVED",
    "CONVERSATION_UNASSIGNED_FOR",
    "TAG_ADDED",
  ]),
  conditions: z
    .object({
      tags_contain: z.string().optional(),
      tags_not_contain: z.string().optional(),
      status: z.enum(["OPEN", "SNOOZED", "CLOSED"]).optional(),
      visitor_email_contains: z.string().optional(),
      message_contains: z.string().optional(),
      unassigned_minutes: z.number().min(1).optional(),
    })
    .optional(),
  action: z.enum([
    "ASSIGN_TO",
    "ADD_TAG",
    "REMOVE_TAG",
    "CHANGE_STATUS",
    "SEND_MESSAGE",
    "NOTIFY_SLACK",
  ]),
  actionConfig: z.object({
    assigneeId: z.string().optional(),
    tag: z.string().optional(),
    status: z.enum(["OPEN", "SNOOZED", "CLOSED"]).optional(),
    message: z.string().optional(),
  }),
});

export type AutomationRuleInput = z.infer<typeof automationRuleSchema>;
