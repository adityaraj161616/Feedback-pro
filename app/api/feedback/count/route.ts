import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get("formId")

    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Count feedback documents for the specific form
    const count = await db.collection("feedback").countDocuments({
      formId: formId,
    })

    console.log(`Feedback count for form ${formId}:`, count)

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error counting feedback:", error)
    return NextResponse.json({ error: "Failed to count feedback" }, { status: 500 })
  }
}
