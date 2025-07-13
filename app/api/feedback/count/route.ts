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

    const { searchParams } = new URL(request.url)
    const formId = searchParams.get("formId")

    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 })
    }

    const db = (await clientPromise).db("feedbackpro")
    const feedbackCollection = db.collection("feedback")

    // Count feedback entries for the specific form
    const count = await feedbackCollection.countDocuments({ formId: formId })

    console.log(`Feedback count for form ${formId}:`, count)

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching feedback count:", error)
    return NextResponse.json({ error: "Failed to fetch feedback count" }, { status: 500 })
  }
}
