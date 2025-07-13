import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { convertToCsv, generatePdf } from "@/lib/export"
import { logAudit } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get("formId")
    const userId = searchParams.get("userId") // User requesting the export
    const format = searchParams.get("format") // 'csv' or 'pdf'

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: User ID required" }, { status: 401 })
    }

    const db = (await clientPromise).db("feedbackpro")
    const feedbackCollection = db.collection("feedback")
    const formsCollection = db.collection("forms")

    // Verify form ownership if formId is provided
    let formTitle = "All Forms"
    const query: any = { userId: userId }
    if (formId) {
      const form = await formsCollection.findOne({ id: formId })
      if (!form || form.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized: Form not found or not owned by user" }, { status: 403 })
      }
      query.formId = formId
      formTitle = form.title
    }

    const feedbackData = await feedbackCollection.find(query).sort({ createdAt: -1 }).toArray()

    if (feedbackData.length === 0) {
      return NextResponse.json({ message: "No feedback data to export." }, { status: 204 })
    }

    await logAudit({
      action: `Export Data (${format})`,
      userId: userId,
      resourceType: "feedback",
      resourceId: formId || "all",
      details: { formId, format, count: feedbackData.length },
    })

    if (format === "csv") {
      const csv = convertToCsv(feedbackData)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="feedback_export_${formId || "all"}.csv"`,
        },
      })
    } else if (format === "pdf") {
      const doc = generatePdf(feedbackData, formTitle)
      const pdfBuffer = doc.output("arraybuffer")
      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="feedback_report_${formId || "all"}.pdf"`,
        },
      })
    } else {
      return NextResponse.json({ error: "Invalid format specified. Use 'csv' or 'pdf'." }, { status: 400 })
    }
  } catch (error) {
    console.error("Error exporting feedback:", error)
    await logAudit({
      action: "Export Data Failed",
      userId: request.searchParams.get("userId") || "unknown",
      details: {
        error: error.message,
        formId: request.searchParams.get("formId"),
        format: request.searchParams.get("format"),
      },
      severity: "high",
    })
    return NextResponse.json({ error: "Failed to export feedback" }, { status: 500 })
  }
}
