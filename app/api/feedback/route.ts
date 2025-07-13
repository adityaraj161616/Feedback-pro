import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const feedbackData = await request.json()
    const db = (await clientPromise).db("feedbackpro")
    const feedbackCollection = db.collection("feedback")

    const feedback = {
      ...feedbackData,
      id: `feedback_${Date.now()}`,
      submittedAt: new Date(),
    }

    await feedbackCollection.insertOne(feedback)

    return NextResponse.json({ success: true, id: feedback.id })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const formId = searchParams.get("formId")

    const db = (await clientPromise).db("feedbackpro")
    const feedbackCollection = db.collection("feedback")

    const query: any = {}

    // If formId is provided, filter by formId
    if (formId) {
      query.formId = formId
    }

    // If userId is provided, get forms owned by this user first
    if (userId) {
      const formsCollection = db.collection("forms")
      const userForms = await formsCollection.find({ userId }).toArray()
      const userFormIds = userForms.map((form) => form.id)

      if (formId) {
        // Check if the requested form belongs to the user
        if (!userFormIds.includes(formId)) {
          return NextResponse.json({ error: "Form not found or access denied" }, { status: 404 })
        }
      } else {
        // Get feedback for all user's forms
        query.formId = { $in: userFormIds }
      }
    }

    const feedback = await feedbackCollection.find(query).sort({ submittedAt: -1 }).toArray()
    const count = await feedbackCollection.countDocuments(query)

    return NextResponse.json({
      feedback,
      count,
      total: count,
    })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}
