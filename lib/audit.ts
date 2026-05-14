import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AuditDb = PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export type AuditSeverity = "INFO" | "NOTICE" | "WARNING" | "CRITICAL";

export type AuditLogInput = {
  actorRole: string;
  actorName: string;
  type: string;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
  severity?: AuditSeverity;
  mockIp?: string;
};

export async function writeAuditLog(input: AuditLogInput, db: AuditDb = prisma) {
  return db.eventLog.create({
    data: {
      actorRole: input.actorRole,
      actorName: input.actorName,
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      title: input.title,
      description: input.description,
      metadata: JSON.stringify({
        sandbox: true,
        severity: input.severity ?? "INFO",
        reason: input.reason ?? null,
        before: input.before ?? null,
        after: input.after ?? null,
        mockIp: input.mockIp ?? "127.0.0.1"
      })
    }
  });
}
