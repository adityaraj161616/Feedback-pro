import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log("API /api/forms POST - Server Session:", session)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.json()
    const db = (await clientPromise).db("feedbackpro")
    const formsCollection = db.collection("forms")

    const { id, ...restFormData } = formData

    let formIdToReturn: string
    let message: string

    // Check if it's an existing form (id is provided and not empty)
    if (id && id !== "") {
      // Attempt to update an existing form
      const existingForm = await formsCollection.findOne({ id: id, userId: session.user.id })

      if (existingForm) {
        await formsCollection.updateOne(
          { id: id, userId: session.user.id },
          {
            $set: {
              ...restFormData,
              updatedAt: new Date(),
            },
          },
        )
        formIdToReturn = id
        message = "Form updated successfully"
      } else {
        // If ID is provided but form doesn't exist for this user, treat as new
        const newFormId = `form_${Date.now()}`
        const newForm = {
          ...formData,
          id: newFormId,
          userId: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          responses: 0,
          isActive: true,
          userEmail: session.user.email,
        }
        await formsCollection.insertOne(newForm)
        formIdToReturn = newFormId
        message = "Form created successfully (with new ID as original was not found)"
      }
    } else {
      // Create a new form
      const newFormId = `form_${Date.now()}`
      const newForm = {
        ...formData,
        id: newFormId,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        responses: 0,
        isActive: true,
        userEmail: session.user.email,
      }
      await formsCollection.insertOne(newForm)
      formIdToReturn = newFormId
      message = "Form created successfully"
    }

    return NextResponse.json({
      success: true,
      formId: formIdToReturn,
      message: message,
    })
  } catch (error) {
    console.error("Error creating/updating form:", error)
    return NextResponse.json({ error: "Failed to create/update form" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = (await clientPromise).db("feedbackpro")
    const forms = db.collection("forms")

    const userForms = await forms.find({ userId: session.user.id }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(userForms)
  } catch (error) {
    console.error("Error fetching forms:", error)
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 })
  }
}
