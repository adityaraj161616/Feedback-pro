import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = (await clientPromise).db("feedbackpro")
    const feedback = db.collection("feedback")
    const forms = db.collection("forms")

    // Get user's forms
    const userForms = await forms.find({ userId: session.user.id }).toArray()
    const formIds = userForms.map((form) => form.id)

    // Get feedback for user's forms
    const userFeedback = await feedback.find({ formId: { $in: formIds } }).toArray()

    // Convert to CSV
    const csvHeaders = [
      "Feedback ID",
      "Form Title",
      "Form ID",
      "Sentiment Score",
      "Sentiment Label",
      "Confidence",
      "Created At",
      "Responses",
    ]

    const csvRows = userFeedback.map((item) => {
      const form = userForms.find((f) => f.id === item.formId)
      const responsesText = Object.entries(item.responses || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join("; ")

      return [
        item.id,
        form?.title || "Unknown Form",
        item.formId,
        item.sentiment?.score || 0,
        item.sentiment?.label || "neutral",
        item.sentiment?.confidence || 0,
        item.createdAt.toISOString(),
        responsesText,
      ]
    })

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting analytics:", error)
    return NextResponse.json({ error: "Failed to export analytics" }, { status: 500 })
  }
}
