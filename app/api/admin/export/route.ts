import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = (await clientPromise).db("feedbackpro")
    const feedback = db.collection("feedback")

    // Get all feedback
    const allFeedback = await feedback.find({}).sort({ createdAt: -1 }).toArray()

    // Convert to CSV
    const csvHeaders = [
      "Feedback ID",
      "Form Title",
      "User ID",
      "Sentiment Score",
      "Sentiment Label",
      "Confidence",
      "Emotions",
      "Summary",
      "Created At",
      "IP Address",
    ]

    const csvRows = allFeedback.map((item) => [
      item.id,
      item.formTitle,
      item.userId,
      item.sentiment?.score || 0,
      item.sentiment?.label || "neutral",
      item.sentiment?.confidence || 0,
      item.sentiment?.emotions?.join("; ") || "",
      item.sentiment?.summary || "",
      item.createdAt.toISOString(),
      item.ipAddress,
    ])

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="feedback-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
