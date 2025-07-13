import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { analyzeSentiment } from "@/lib/ai-sentiment"
import { logAudit } from "@/lib/audit"
import type { AnalyticsData } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const formId = searchParams.get("formId")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: User ID required" }, { status: 401 })
    }

    const db = (await clientPromise).db("feedbackpro")
    const feedbackCollection = db.collection("feedback")
    const formsCollection = db.collection("forms")

    // Base query for feedback and forms
    const feedbackQuery: any = { userId: userId }
    const formsQuery: any = { userId: userId }

    if (formId && formId !== "all") {
      feedbackQuery.formId = formId
      formsQuery.id = formId // Filter forms by ID if a specific form is selected
    }

    // Fetch feedback entries
    const feedbackEntries = await feedbackCollection.find(feedbackQuery).sort({ createdAt: 1 }).toArray()

    // Fetch forms
    const userForms = await formsCollection.find(formsQuery).toArray()

    // Initialize analytics data structure with defaults
    const analytics: AnalyticsData = {
      overview: {
        totalFeedback: 0,
        averageSentimentScore: 0,
        formsCreated: userForms.length,
        activeForms: userForms.filter((form) => form.isActive).length,
      },
      feedbackTrends: [],
      sentimentTrends: [],
      formPerformance: [],
      aiInsights: {
        recommendations: [],
        topKeywords: [],
        emergingTrends: [],
        emotionAnalysis: {},
        actionableInsights: [],
      },
      sentimentDistribution: {
        Positive: 0,
        Neutral: 0,
        Negative: 0,
      },
    }

    // --- Calculate Overview Stats ---
    analytics.overview.totalFeedback = feedbackEntries.length

    let totalSentimentScore = 0
    feedbackEntries.forEach((entry) => {
      if (entry.sentiment && typeof entry.sentiment.score === "number") {
        totalSentimentScore += entry.sentiment.score
        const label = entry.sentiment.label || "Neutral"
        analytics.sentimentDistribution[label] = (analytics.sentimentDistribution[label] || 0) + 1
      }
    })
    analytics.overview.averageSentimentScore =
      feedbackEntries.length > 0 ? totalSentimentScore / feedbackEntries.length : 0

    // --- Calculate Feedback Trends (Daily) ---
    const feedbackCountByDate: { [key: string]: number } = {}
    feedbackEntries.forEach((entry) => {
      const date = new Date(entry.createdAt).toISOString().split("T")[0]
      feedbackCountByDate[date] = (feedbackCountByDate[date] || 0) + 1
    })
    analytics.feedbackTrends = Object.entries(feedbackCountByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // --- Calculate Sentiment Trends (Daily Average) ---
    const sentimentByDate: { [key: string]: { sum: number; count: number } } = {}
    feedbackEntries.forEach((entry) => {
      const date = new Date(entry.createdAt).toISOString().split("T")[0]
      if (entry.sentiment && typeof entry.sentiment.score === "number") {
        sentimentByDate[date] = sentimentByDate[date] || { sum: 0, count: 0 }
        sentimentByDate[date].sum += entry.sentiment.score
        sentimentByDate[date].count += 1
      }
    })
    analytics.sentimentTrends = Object.entries(sentimentByDate)
      .map(([date, data]) => ({ date, averageScore: data.sum / data.count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // --- Calculate Sentiment Heatmap Data (Hourly) ---
    const sentimentHeatmapData: {
      date: string
      hourlySentiment: { [hour: string]: number[] }
    }[] = []
    const dailyHourlySentiment: {
      [date: string]: { [hour: string]: { sum: number; count: number } }
    } = {}

    feedbackEntries.forEach((entry) => {
      const date = new Date(entry.createdAt).toISOString().split("T")[0]
      const hour = new Date(entry.createdAt).getHours().toString()
      if (entry.sentiment && typeof entry.sentiment.score === "number") {
        dailyHourlySentiment[date] = dailyHourlySentiment[date] || {}
        dailyHourlySentiment[date][hour] = dailyHourlySentiment[date][hour] || { sum: 0, count: 0 }
        dailyHourlySentiment[date][hour].sum += entry.sentiment.score
        dailyHourlySentiment[date][hour].count += 1
      }
    })

    for (const date in dailyHourlySentiment) {
      const hourlySentiment: { [hour: string]: number } = {}
      for (const hour in dailyHourlySentiment[date]) {
        const data = dailyHourlySentiment[date][hour]
        hourlySentiment[hour] = data.sum / data.count
      }
      sentimentHeatmapData.push({ date, hourlySentiment })
    }
    analytics.sentimentTrends = sentimentHeatmapData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    // --- Calculate Form Performance ---
    const formFeedbackCounts: { [formId: string]: { total: number; sentimentSum: number; count: number } } = {}
    feedbackEntries.forEach((entry) => {
      formFeedbackCounts[entry.formId] = formFeedbackCounts[entry.formId] || { total: 0, sentimentSum: 0, count: 0 }
      formFeedbackCounts[entry.formId].total += 1
      if (entry.sentiment && typeof entry.sentiment.score === "number") {
        formFeedbackCounts[entry.formId].sentimentSum += entry.sentiment.score
        formFeedbackCounts[entry.formId].count += 1
      }
    })

    analytics.formPerformance = userForms.map((form) => {
      const stats = formFeedbackCounts[form.id] || { total: 0, sentimentSum: 0, count: 0 }
      return {
        id: form.id,
        title: form.title,
        totalFeedback: stats.total,
        averageSentimentScore: stats.count > 0 ? stats.sentimentSum / stats.count : 0,
      }
    })

    // --- AI Insights (only if a specific form or overall insights are requested) ---
    // This part can be resource-intensive, consider caching or running less frequently
    const allFeedbackTextForAI = feedbackEntries
      .flatMap((entry) =>
        Object.values(entry.responses || {}).filter((val) => typeof val === "string" && val.length > 0),
      )
      .join(". ")

    if (allFeedbackTextForAI) {
      const aiAnalysisResult = await analyzeSentiment(allFeedbackTextForAI)
      analytics.aiInsights.topKeywords = aiAnalysisResult.keywords
      analytics.aiInsights.emotionAnalysis = aiAnalysisResult.emotions.reduce((acc: any, emotion: string) => {
        acc[emotion] = (acc[emotion] || 0) + 1
        return acc
      }, {})

      // Simple recommendations based on overall sentiment
      if (aiAnalysisResult.label === "Negative" && aiAnalysisResult.score < 0.4) {
        analytics.aiInsights.recommendations.push(
          "High negative sentiment detected. Prioritize reviewing recent feedback for critical issues.",
        )
        analytics.aiInsights.actionableInsights.push(
          "Conduct a deep dive into common themes in negative feedback to identify root causes.",
        )
      } else if (aiAnalysisResult.label === "Positive" && aiAnalysisResult.score > 0.6) {
        analytics.aiInsights.recommendations.push(
          "Strong positive sentiment! Identify what's working well and consider promoting these aspects.",
        )
        analytics.aiInsights.actionableInsights.push(
          "Gather testimonials from positive feedback and use them in marketing materials.",
        )
      } else {
        analytics.aiInsights.recommendations.push(
          "Sentiment is neutral or mixed. Look for specific keywords and emotions to find areas for improvement.",
        )
      }

      // Basic emerging trends (e.g., keywords appearing more frequently recently)
      const recentKeywords = feedbackEntries
        .slice(0, Math.min(10, feedbackEntries.length)) // Last 10 feedbacks
        .flatMap((entry) => entry.sentiment?.keywords || [])
        .reduce((acc: any, keyword: string) => {
          acc[keyword] = (acc[keyword] || 0) + 1
          return acc
        }, {})

      for (const keyword in recentKeywords) {
        if (recentKeywords[keyword] > 1 && !analytics.aiInsights.topKeywords.includes(keyword)) {
          // If appears more than once recently and not already a top keyword
          analytics.aiInsights.emergingTrends.push(`Increased mentions of "${keyword}" in recent feedback.`)
        }
      }
    }

    await logAudit({
      action: "Analytics Viewed",
      userId: userId,
      resourceType: "analytics",
      resourceId: formId || "all",
      details: { formId, feedbackCount: feedbackEntries.length },
    })

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    await logAudit({
      action: "Analytics Fetch Failed",
      userId: request.searchParams.get("userId") || "unknown",
      details: { error: error.message, formId: request.searchParams.get("formId") },
      severity: "high",
    })
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
