import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { formId } = params
    const { isActive } = await request.json()

    const db = (await clientPromise).db("feedbackpro")
    const forms = db.collection("forms")

    const result = await forms.updateOne(
      { id: formId, userId: session.user.id },
      {
        $set: {
          isActive,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Form ${isActive ? "activated" : "deactivated"} successfully`,
    })
  } catch (error) {
    console.error("Error toggling form status:", error)
    return NextResponse.json({ error: "Failed to update form status" }, { status: 500 })
  }
}
