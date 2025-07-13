import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { getAuditLogs, logAudit } from "@/lib/audit"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  // Only allow authenticated users to view audit logs
  if (!session) {
    await logAudit({
      action: "Audit Log Access Attempt",
      details: { status: "Unauthorized", ip: request.ip },
    })
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // For simplicity, let's assume only admins can view all audit logs.
  // For regular users, they can only view their own actions.
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "50")
  const skip = Number.parseInt(searchParams.get("skip") || "0")
  const requestedUserId = searchParams.get("userId")

  let userIdFilter: string | undefined = undefined

  // If a specific userId is requested, ensure it's the current user's ID
  // or if the current user is an admin (not implemented in this example, but good practice)
  if (requestedUserId && requestedUserId !== session.user.id) {
    // In a real app, check if session.user.role === 'admin'
    // For now, restrict to own user's logs
    await logAudit({
      action: "Audit Log Access Attempt",
      userId: session.user.id,
      details: { status: "Forbidden", requestedUserId, ip: request.ip },
    })
    return NextResponse.json({ error: "Forbidden: Cannot access other users' audit logs" }, { status: 403 })
  } else {
    userIdFilter = session.user.id // Users can only see their own logs
  }

  try {
    const logs = await getAuditLogs(userIdFilter, limit, skip)

    await logAudit({
      action: "Viewed Audit Logs",
      userId: session.user.id,
      details: {
        limit,
        skip,
        filter: userIdFilter ? `userId:${userIdFilter}` : "all",
        numLogs: logs.length,
        ip: request.ip,
      },
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    await logAudit({
      action: "Audit Log Fetch Failed",
      userId: session.user.id,
      details: { error: error.message, ip: request.ip },
    })
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
