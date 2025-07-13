import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const formId = searchParams.get("formId")

    const { db } = await connectToDatabase()

    const query: any = {}

    if (formId) {
      query.formId = formId
    }

    if (userId) {
      // If userId is provided, get forms created by this user first
      const forms = await db.collection("forms").find({ userId }).toArray()
      const formIds = forms.map((form) => form._id.toString())
      query.formId = { $in: formIds }
    }

    const feedback = await db.collection("feedback").find(query).sort({ createdAt: -1 }).toArray()

    // If requesting count specifically
    if (searchParams.get("count") === "true") {
      return NextResponse.json({ count: feedback.length })
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, responses, userAgent, ipAddress } = body

    if (!formId || !responses) {
      return NextResponse.json({ error: "Form ID and responses are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if form exists and is active
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
      userAgent: userAgent || "",
      ipAddress: ipAddress || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("feedback").insertOne(feedback)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating feedback:", error)
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 })
  }
}
