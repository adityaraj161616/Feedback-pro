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
    const forms = db.collection("forms")
    const users = db.collection("users")

    // Get stats
    const [totalFeedback, totalForms, totalUsers, sentimentStats] = await Promise.all([
      feedback.countDocuments(),
      forms.countDocuments(),
      users.countDocuments(),
      feedback
        .aggregate([
          {
            $group: {
              _id: null,
              avgSentiment: { $avg: "$sentiment.score" },
              positiveCount: {
                $sum: { $cond: [{ $eq: ["$sentiment.label", "positive"] }, 1, 0] },
              },
              neutralCount: {
                $sum: { $cond: [{ $eq: ["$sentiment.label", "neutral"] }, 1, 0] },
              },
              negativeCount: {
                $sum: { $cond: [{ $eq: ["$sentiment.label", "negative"] }, 1, 0] },
              },
            },
          },
        ])
        .toArray(),
    ])

    const sentiment = sentimentStats[0] || {
      avgSentiment: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0,
    }

    // Calculate response rate (simplified)
    const responseRate = totalForms > 0 ? Math.round((totalFeedback / totalForms) * 100) : 0

    return NextResponse.json({
      totalFeedback,
      totalForms,
      totalUsers,
      avgSentiment: Math.round(sentiment.avgSentiment || 0),
      responseRate,
      sentimentBreakdown: {
        positive: sentiment.positiveCount,
        neutral: sentiment.neutralCount,
        negative: sentiment.negativeCount,
      },
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
