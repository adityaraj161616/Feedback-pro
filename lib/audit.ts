import clientPromise from "@/lib/mongodb"
import type { ObjectId } from "mongodb"

export interface AuditLogEntry {
  _id?: ObjectId
  timestamp: Date
  action: string
  userId?: string // User who performed the action
  resourceType?: string // e.g., "form", "feedback", "user"
  resourceId?: string // ID of the resource affected
  details: Record<string, any> // Additional context
  ipAddress?: string
  userAgent?: string
  severity?: "low" | "medium" | "high"
}

export async function logAudit(entry: Omit<AuditLogEntry, "_id" | "timestamp">) {
  try {
    const db = (await clientPromise).db("feedbackpro")
    const auditCollection = db.collection("auditLogs")

    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
      severity: entry.severity || "low",
    }

    await auditCollection.insertOne(fullEntry)
    // console.log("Audit log recorded:", fullEntry.action);
  } catch (error) {
    console.error("Failed to write audit log:", error)
  }
}

// Optional: Function to retrieve audit logs
export async function getAuditLogs(filter: Record<string, any> = {}, limit = 50, skip = 0): Promise<AuditLogEntry[]> {
  try {
    const db = (await clientPromise).db("feedbackpro")
    const auditCollection = db.collection("auditLogs")

    const logs = await auditCollection.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).toArray()
    return logs as AuditLogEntry[]
  } catch (error) {
    console.error("Failed to retrieve audit logs:", error)
    return []
  }
}
