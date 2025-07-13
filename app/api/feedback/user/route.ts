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

    const db = (await clientPromise).db("feedbackpro")
    const feedback = db.collection("feedback")

    // Get feedback for user's forms
    const userFeedback = await feedback.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(50).toArray()

    // Generate chart data
    const chartData = generateChartData(userFeedback)

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}

function generateChartData(feedback: any[]) {
  // Group feedback by month
  const monthlyData = feedback.reduce((acc, item) => {
    const month = new Date(item.createdAt).toLocaleDateString("en-US", { month: "short" })
    if (!acc[month]) {
      acc[month] = { month, feedback: 0, sentiment: 0, total: 0 }
    }
    acc[month].feedback += 1
    acc[month].sentiment += item.rating || 0
    acc[month].total += 1
    return acc
  }, {})

  // Calculate average sentiment
  return Object.values(monthlyData).map((data: any) => ({
    ...data,
    sentiment: data.total > 0 ? (data.sentiment / data.total).toFixed(1) : 0,
  }))
}
