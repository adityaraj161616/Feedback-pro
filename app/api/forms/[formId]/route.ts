import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params
    console.log("API: Fetching form with ID:", formId)

    const client = await clientPromise
    const db = client.db("feedbackpro")
    const forms = db.collection("forms")

    const form = await forms.findOne({ id: formId, isActive: true })
    console.log("API: Found form:", form)

    if (!form) {
      console.log("API: Form not found or inactive")
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Include userId in the response for feedback submission
    const publicForm = {
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.fields,
      settings: form.settings || {},
      userId: form.userId, // Include this for feedback submission
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    }

    console.log("API: Returning form data:", publicForm)
    return NextResponse.json(publicForm)
  } catch (error) {
    console.error("API: Error fetching form:", error)
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { formId } = await params
    const client = await clientPromise
    const db = client.db("feedbackpro")
    const forms = db.collection("forms")

    const result = await forms.deleteOne({
      id: formId,
      userId: session.user.id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Form deleted successfully" })
  } catch (error) {
    console.error("Error deleting form:", error)
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { formId } = await params
    const formData = await request.json()

    const client = await clientPromise
    const db = client.db("feedbackpro")
    const forms = db.collection("forms")

    const result = await forms.updateOne(
      { id: formId, userId: session.user.id },
      {
        $set: {
          ...formData,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Form updated successfully",
      formId,
    })
  } catch (error) {
    console.error("Error updating form:", error)
    return NextResponse.json({ error: "Failed to update form" }, { status: 500 })
  }
}
