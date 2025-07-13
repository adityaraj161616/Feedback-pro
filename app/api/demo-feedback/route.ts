import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const feedbackData = await request.json()

    const db = (await clientPromise).db("feedbackpro")
    const demoFeedback = db.collection("demo_feedback")

    const feedbackRecord = {
      id: `demo_${Date.now()}`,
      rating: feedbackData.rating,
      feedback: feedbackData.feedback,
      email: feedbackData.email,
      timestamp: new Date(feedbackData.timestamp),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    }

    await demoFeedback.insertOne(feedbackRecord)

    return NextResponse.json({
      success: true,
      message: "Demo feedback submitted successfully",
      id: feedbackRecord.id,
    })
  } catch (error) {
    console.error("Error submitting demo feedback:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}
