import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("feedbackpro")

    // Test connection
    await db.admin().ping()

    // List collections
    const collections = await db.listCollections().toArray()

    // Count documents in each collection
    const stats = {}
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments()
      stats[collection.name] = count
    }

    return NextResponse.json({
      success: true,
      message: "MongoDB connected successfully",
      collections: collections.map((c) => c.name),
      documentCounts: stats,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
