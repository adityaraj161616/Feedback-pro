import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { sanitizeObject } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Feedback API: Received data:", body)

    const { formId, responses, userId, timestamp } = body

    // Validate required fields
    if (!formId || !responses || !userId) {
      console.error("Feedback API: Missing required fields:", { formId, responses, userId })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Sanitize the input data
    const sanitizedResponses = sanitizeObject(responses)
    console.log("Feedback API: Sanitized responses:", sanitizedResponses)

    const client = await clientPromise
    const db = client.db("feedbackpro")
    const feedback = db.collection("feedback")

    // Create feedback document
    const feedbackDoc = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      formId,
      responses: sanitizedResponses,
      userId, // This is the form owner's userId
      submittedAt: new Date(timestamp || new Date()),
      createdAt: new Date(),
      ipAddress: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    }

    console.log("Feedback API: Inserting feedback:", feedbackDoc)

    const result = await feedback.insertOne(feedbackDoc)
    console.log("Feedback API: Insert result:", result)

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: "Feedback submitted successfully",
        feedbackId: feedbackDoc.id,
      })
    } else {
      throw new Error("Failed to insert feedback")
    }
  } catch (error) {
    console.error("Feedback API: Error submitting feedback:", error)
    return NextResponse.json({ error: "Failed to submit feedback. Please try again." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const formId = searchParams.get("formId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("feedbackpro")
    const feedback = db.collection("feedback")

    const query: any = { userId }
    if (formId) {
      query.formId = formId
    }

    const feedbackList = await feedback.find(query).sort({ createdAt: -1 }).limit(100).toArray()

    return NextResponse.json({
      success: true,
      feedback: feedbackList,
      count: feedbackList.length,
    })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}
