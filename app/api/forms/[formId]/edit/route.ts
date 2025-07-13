import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { formId } = params
    const db = (await clientPromise).db("feedbackpro")
    const forms = db.collection("forms")

    const form = await forms.findOne({
      id: formId,
      userId: session.user.id,
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Return the full form for editing
    return NextResponse.json(form)
  } catch (error) {
    console.error("Error fetching form for editing:", error)
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 })
  }
}
