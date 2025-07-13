import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const formId = searchParams.get("formId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    const query: any = {}

    if (formId) {
      query.formId = formId
    }

    if (userId) {
      // If userId is provided, get forms created by this user first
      const userForms = await db.collection("forms").find({ userId }).toArray()
      const userFormIds = userForms.map((form) => form._id.toString())

      if (userFormIds.length > 0) {
        query.formId = { $in: userFormIds }
      } else {
        // User has no forms, return empty result
        return NextResponse.json({
          feedback: [],
          total: 0,
          page,
          totalPages: 0,
          count: 0,
        })
      }
    }

    const [feedback, total] = await Promise.all([
      db.collection("feedback").find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection("feedback").countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      feedback: feedback.map((item) => ({
        ...item,
        id: item._id.toString(),
        _id: undefined,
      })),
      total,
      page,
      totalPages,
      count: total,
    })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const { formId, responses, userInfo } = body

    if (!formId || !responses) {
      return NextResponse.json({ error: "Form ID and responses are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verify form exists and is active
    const form = await db.collection("forms").findOne({
      _id: formId,
      isActive: true,
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 })
    }

    // Create feedback document
    const feedback = {
      formId,
      responses,
      userInfo: userInfo || {},
      userId: session?.user?.id || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("feedback").insertOne(feedback)

    return NextResponse.json({
      id: result.insertedId.toString(),
      message: "Feedback submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}
