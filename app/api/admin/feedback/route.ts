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

    // Get all feedback with pagination
    const page = Number.parseInt(request.nextUrl.searchParams.get("page") || "1")
    const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const allFeedback = await feedback.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()

    const total = await feedback.countDocuments()

    return NextResponse.json({
      feedback: allFeedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching admin feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}
