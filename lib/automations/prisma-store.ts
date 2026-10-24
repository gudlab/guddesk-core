/**
 * Prisma implementation of the automation store.
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */
import type { AutomationTrigger, PrismaClient } from "@prisma/client";

import {
  BOT_SENDER_NAME,
  type AutomationStore,
  type BotMessage,
  type RuleRecord,
} from "@/lib/automations/engine";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002";
}

const RULE_SELECT = {
  id: true,
  workspaceId: true,
  name: true,
  trigger: true,
  conditions: true,
  action: true,
  actionConfig: true,
  order: true,
  createdAt: true,
} as const;

export interface UnassignedCandidate {
  conversationId: string;
  since: Date;
}

export interface UnassignedStore {
  /** Enabled "unassigned for" rules, in one workspace or all of them. */
  listUnassignedRules(workspaceId?: string): Promise<RuleRecord[]>;
  /**
   * OPEN, unassigned conversations in the rule's workspace that have been
   * unassigned since `cutoff` or earlier and have no run for this rule
   * since they became unassigned. Oldest first.
   */
  findUnassignedCandidates(
    rule: { id: string; workspaceId: string },
    cutoff: Date,
    limit: number,
  ): Promise<UnassignedCandidate[]>;
}

export function createPrismaAutomationStore(db: PrismaClient): AutomationStore & UnassignedStore {
  return {
    async getConversation(conversationId) {
      const c = await db.conversation.findUnique({
        where: { id: conversationId },
        select: {
          id: true,
          workspaceId: true,
          status: true,
          tags: true,
          visitor: { select: { name: true, email: true } },
        },
      });
      if (!c) return null;
      return {
        id: c.id,
        workspaceId: c.workspaceId,
        status: c.status,
        tags: c.tags,
        visitorName: c.visitor?.name ?? null,
        visitorEmail: c.visitor?.email ?? null,
      };
    },

    listRules(workspaceId, trigger: AutomationTrigger) {
      return db.automationRule.findMany({
        where: { workspaceId, trigger, isEnabled: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        select: RULE_SELECT,
      });
    },

    countConversationRuns(conversationId, since) {
      return db.automationRun.count({ where: { conversationId, createdAt: { gte: since } } });
    },

    countWorkspaceRuns(workspaceId, since) {
      return db.automationRun.count({ where: { workspaceId, createdAt: { gte: since } } });
    },

    async createRun(data) {
      try {
        return await db.automationRun.create({
          data: { ...data, status: "running" },
          select: { id: true },
        });
      } catch (error) {
        if (isUniqueViolation(error)) return null;
        throw error;
      }
    },

    async finishRun(runId, status, error, at) {
      await db.automationRun.update({
        where: { id: runId },
        data: { status, error, finishedAt: at },
      });
    },

    async markRuleTriggered(ruleId, at) {
      await db.automationRule.update({
        where: { id: ruleId },
        data: { lastTriggeredAt: at, triggerCount: { increment: 1 } },
      });
    },

    async assign(conversationId, workspaceId, memberId) {
      const member = await db.workspaceMember.findFirst({
        where: { id: memberId, workspaceId },
        select: { id: true },
      });
      if (!member) return false;
      await db.conversation.update({ where: { id: conversationId }, data: { assigneeId: memberId } });
      return true;
    },

    async addTag(conversationId, tag) {
      // One conditional write, so two runs can't both add the tag. Raw SQL
      // because rows created without tags hold NULL, which a Prisma
      // `NOT: { tags: { has } }` filter never matches.
      const count = await db.$executeRaw`
        UPDATE "conversations"
        SET "tags" = array_append(COALESCE("tags", '{}'), ${tag}), "updated_at" = NOW()
        WHERE "id" = ${conversationId} AND NOT (${tag} = ANY(COALESCE("tags", '{}')))
      `;
      return count > 0;
    },

    async removeTag(conversationId, tag) {
      const c = await db.conversation.findUnique({ where: { id: conversationId }, select: { tags: true } });
      if (!c || !c.tags.includes(tag)) return false;
      await db.conversation.update({
        where: { id: conversationId },
        data: { tags: c.tags.filter((t) => t !== tag) },
      });
      return true;
    },

    async setStatus(conversationId, status, at) {
      if (status === "CLOSED") {
        const { count } = await db.conversation.updateMany({
          where: { id: conversationId, status: { not: "CLOSED" } },
          data: { status, closedAt: at },
        });
        return { closedNow: count > 0 };
      }
      await db.conversation.update({ where: { id: conversationId }, data: { status, closedAt: null } });
      return { closedNow: false };
    },

    async addSystemMessage(conversationId, body) {
      await db.message.create({ data: { conversationId, type: "SYSTEM", body } });
    },

    async addBotMessage(conversationId, body, at): Promise<BotMessage> {
      const message = await db.message.create({
        data: { conversationId, type: "BOT", body, senderName: BOT_SENDER_NAME },
        select: { id: true, body: true, createdAt: true },
      });
      await db.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: at,
          lastMessagePreview: body.length > 100 ? `${body.slice(0, 100)}...` : body,
        },
      });
      return { id: message.id, type: "BOT", body: message.body, senderName: BOT_SENDER_NAME, createdAt: message.createdAt };
    },

    async findCannedResponse(workspaceId, id) {
      return db.cannedResponse.findFirst({ where: { id, workspaceId }, select: { body: true } });
    },

    async slackWebhookUrl(workspaceId) {
      const slack = await db.slackIntegration.findUnique({
        where: { workspaceId },
        select: { webhookUrl: true },
      });
      return slack?.webhookUrl || null;
    },

    listUnassignedRules(workspaceId) {
      return db.automationRule.findMany({
        where: { trigger: "CONVERSATION_UNASSIGNED_FOR", isEnabled: true, ...(workspaceId ? { workspaceId } : {}) },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        select: RULE_SELECT,
      });
    },

    async findUnassignedCandidates(rule, cutoff, limit) {
      // The NOT EXISTS matches unassignedEventKey() in events.ts:
      // "unassigned:<conversationId>:<since in epoch ms>".
      const rows = await db.$queryRaw<{ id: string; since: Date }[]>`
        SELECT c."id", COALESCE(c."unassignedAt", c."created_at") AS "since"
        FROM "conversations" c
        WHERE c."workspaceId" = ${rule.workspaceId}
          AND c."status" = 'OPEN'
          AND c."assigneeId" IS NULL
          AND COALESCE(c."unassignedAt", c."created_at") <= ${cutoff}
          AND NOT EXISTS (
            SELECT 1 FROM "automation_runs" r
            WHERE r."ruleId" = ${rule.id}
              AND r."eventKey" = 'unassigned:' || c."id" || ':' ||
                (EXTRACT(EPOCH FROM COALESCE(c."unassignedAt", c."created_at")) * 1000)::bigint::text
          )
        ORDER BY 2 ASC
        LIMIT ${limit}
      `;
      return rows.map((row) => ({ conversationId: row.id, since: new Date(row.since) }));
    },
  };
}
