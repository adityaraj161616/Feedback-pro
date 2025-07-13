import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { analyzeSentiment } from "@/lib/ai-sentiment"
import { logAudit } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get("formId")
    const userId = searchParams.get("userId") // Assuming userId is passed for authorization

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: User ID required" }, { status: 401 })
    }

    const db = (await clientPromise).db("feedbackpro")
    const feedbackCollection = db.collection("feedback")
    const formsCollection = db.collection("forms")

    // Verify form ownership (basic check)
    if (formId) {
      const form = await formsCollection.findOne({ id: formId })
      if (!form || form.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized: Form not found or not owned by user" }, { status: 403 })
      }
    }

    const query: any = { userId: userId }
    if (formId) {
      query.formId = formId
    }

    const feedbackEntries = await feedbackCollection.find(query).sort({ createdAt: -1 }).limit(100).toArray()

    if (feedbackEntries.length === 0) {
      return NextResponse.json({
        aiInsights: {
          recommendations: ["Submit more feedback to generate insights!"],
          topKeywords: [],
          emergingTrends: [],
          emotionAnalysis: {},
          actionableInsights: [],
        },
      })
    }

    // Combine all text responses for comprehensive analysis
    const allFeedbackText = feedbackEntries
      .flatMap((entry) =>
        Object.values(entry.responses || {}).filter((val) => typeof val === "string" && val.length > 0),
      )
      .join(". ")

    let aiAnalysis = {
      label: "Neutral",
      score: 0.5,
      emoji: "😐",
      keywords: [],
      emotions: [],
    }

    if (allFeedbackText) {
      aiAnalysis = await analyzeSentiment(allFeedbackText)
    }

    // Aggregate sentiment distribution
    const sentimentDistribution: Record<string, number> = {
      Positive: 0,
      Neutral: 0,
      Negative: 0,
    }
    feedbackEntries.forEach((entry) => {
      const label = entry.sentiment?.label || "Neutral"
      sentimentDistribution[label] = (sentimentDistribution[label] || 0) + 1
    })

    // Generate simple recommendations and trends based on aggregated sentiment and keywords
    const recommendations: string[] = []
    const emergingTrends: string[] = []
    const actionableInsights: string[] = []

    if (aiAnalysis.label === "Negative" && aiAnalysis.score > 0.6) {
      recommendations.push("Focus on addressing negative feedback immediately.")
      actionableInsights.push("Investigate common pain points identified by negative sentiment.")
    } else if (aiAnalysis.label === "Positive" && aiAnalysis.score > 0.6) {
      recommendations.push("Leverage positive feedback for marketing and testimonials.")
      actionableInsights.push("Identify and double down on features or aspects that users love.")
    } else {
      recommendations.push("Continue monitoring feedback for emerging patterns.")
    }

    if (aiAnalysis.keywords.length > 0) {
      recommendations.push(`Consider these key themes: ${aiAnalysis.keywords.slice(0, 3).join(", ")}.`)
    }

    // Simple trend detection (e.g., if a keyword appears frequently in recent feedback)
    const recentFeedbackKeywords = feedbackEntries
      .slice(0, 10)
      .flatMap((entry) => entry.sentiment?.keywords || [])
      .map((k: string) => k.toLowerCase())
    const keywordCounts: Record<string, number> = {}
    recentFeedbackKeywords.forEach((k: string) => {
      keywordCounts[k] = (keywordCounts[k] || 0) + 1
    })
    for (const keyword in keywordCounts) {
      if (keywordCounts[keyword] > 2) {
        // Arbitrary threshold
        emergingTrends.push(`Increased mentions of "${keyword}".`)
      }
    }

    // Emotion analysis aggregation
    const emotionAnalysis: Record<string, number> = {}
    feedbackEntries.forEach((entry) => {
      if (entry.sentiment?.emotions) {
        entry.sentiment.emotions.forEach((emotion: string) => {
          emotionAnalysis[emotion] = (emotionAnalysis[emotion] || 0) + 1
        })
      }
    })

    await logAudit({
      action: "AI Insights Generated",
      userId: userId,
      resourceType: "analytics",
      resourceId: formId || "all",
      details: { formId, feedbackCount: feedbackEntries.length },
    })

    return NextResponse.json({
      aiInsights: {
        recommendations,
        topKeywords: aiAnalysis.keywords,
        emergingTrends,
        emotionAnalysis,
        actionableInsights,
      },
      sentimentDistribution,
    })
  } catch (error) {
    console.error("Error generating AI insights:", error)
    await logAudit({
      action: "AI Insights Generation Failed",
      userId: request.searchParams.get("userId") || "unknown",
      details: { error: error.message, formId: request.searchParams.get("formId") },
      severity: "high",
    })
    return NextResponse.json({ error: "Failed to generate AI insights" }, { status: 500 })
  }
}
