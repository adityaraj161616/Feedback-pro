import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { analyzeSentimentWithAI } from "@/lib/ai-sentiment"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const formId = searchParams.get("formId")

    console.log("Analytics request:", { userId, formId, sessionUserId: session.user.id })

    const { db } = await connectToDatabase()

    // Build query for feedback
    const feedbackQuery: any = { userId: session.user.id }
    if (formId && formId !== "all") {
      feedbackQuery.formId = formId
    }

    console.log("Feedback query:", feedbackQuery)

    // Get all feedback for this user
    const feedback = await db.collection("feedback").find(feedbackQuery).toArray()
    console.log(`Found ${feedback.length} feedback entries`)

    // Get all forms for this user
    const formsQuery = { userId: session.user.id }
    const forms = await db.collection("forms").find(formsQuery).toArray()
    console.log(`Found ${forms.length} forms`)

    // Process feedback and analyze sentiment
    const processedFeedback = []
    let sentimentAnalysisCount = 0

    for (const item of feedback) {
      let sentimentData = item.sentiment

      // If no sentiment data exists, analyze it
      if (!sentimentData) {
        console.log(`Analyzing sentiment for feedback ${item._id}`)
        sentimentAnalysisCount++

        // Extract text and rating from responses
        const responses = item.responses || {}
        let textContent = ""
        let rating = null

        console.log("Raw responses:", responses)

        // Extract all text content
        Object.entries(responses).forEach(([key, value]: [string, any]) => {
          if (typeof value === "string" && value.trim().length > 0) {
            textContent += value.trim() + " "
          }
        })

        // Extract rating (look for numeric values that could be ratings)
        Object.entries(responses).forEach(([key, value]: [string, any]) => {
          const keyLower = key.toLowerCase()
          if (keyLower.includes("rating") || keyLower.includes("star") || keyLower.includes("score")) {
            const numValue = Number.parseInt(value)
            if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
              rating = numValue
            }
          }
          // Also check if the value itself looks like a rating
          if (typeof value === "number" && value >= 1 && value <= 5) {
            rating = value
          }
          if (typeof value === "string") {
            const numValue = Number.parseInt(value)
            if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
              rating = numValue
            }
          }
        })

        console.log("Extracted content:", {
          textContent: textContent.trim(),
          rating,
          responseKeys: Object.keys(responses),
        })

        try {
          sentimentData = await analyzeSentimentWithAI(textContent.trim(), rating)
          console.log("Generated sentiment:", sentimentData)

          // Update database with sentiment
          await db.collection("feedback").updateOne({ _id: item._id }, { $set: { sentiment: sentimentData } })
        } catch (error) {
          console.error("Error analyzing sentiment:", error)
          // Use fallback sentiment
          sentimentData = {
            label: "Neutral",
            score: 0.5,
            emoji: "😐",
            keywords: [],
            emotions: [],
            confidence: 0.3,
          }
        }
      }

      processedFeedback.push({
        ...item,
        sentiment: sentimentData,
      })
    }

    console.log(
      `Processed ${processedFeedback.length} feedback entries, analyzed ${sentimentAnalysisCount} new entries`,
    )

    // Calculate analytics
    const analytics = calculateAnalytics(processedFeedback, forms)
    console.log("Final analytics:", JSON.stringify(analytics, null, 2))

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function calculateAnalytics(feedback: any[], forms: any[]) {
  const totalFeedback = feedback.length
  const activeForms = forms.filter((form) => form.isActive !== false).length
  const formsCreated = forms.length

  console.log("Calculating analytics for:", { totalFeedback, activeForms, formsCreated })

  // Calculate sentiment distribution
  const sentimentCounts = {
    Positive: 0,
    Neutral: 0,
    Negative: 0,
  }

  let totalSentimentScore = 0
  const allKeywords: string[] = []
  const allEmotions: string[] = []
  const confidenceScores: number[] = []

  feedback.forEach((item) => {
    if (item.sentiment) {
      sentimentCounts[item.sentiment.label]++
      totalSentimentScore += item.sentiment.score

      if (item.sentiment.keywords && Array.isArray(item.sentiment.keywords)) {
        allKeywords.push(...item.sentiment.keywords)
      }
      if (item.sentiment.emotions && Array.isArray(item.sentiment.emotions)) {
        allEmotions.push(...item.sentiment.emotions)
      }
      if (typeof item.sentiment.confidence === "number") {
        confidenceScores.push(item.sentiment.confidence)
      }
    }
  })

  const averageSentimentScore = totalFeedback > 0 ? totalSentimentScore / totalFeedback : 0
  const averageConfidence =
    confidenceScores.length > 0 ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length : 0

  console.log("Sentiment analysis:", {
    sentimentCounts,
    averageSentimentScore,
    averageConfidence,
    totalKeywords: allKeywords.length,
    totalEmotions: allEmotions.length,
  })

  // Calculate trends
  const feedbackTrends = calculateFeedbackTrends(feedback)
  const sentimentTrends = calculateSentimentTrends(feedback)

  // Form performance
  const formPerformance = forms.map((form) => {
    const formFeedback = feedback.filter((f) => f.formId === form._id.toString())
    const formSentimentScore =
      formFeedback.length > 0
        ? formFeedback.reduce((sum, f) => sum + (f.sentiment?.score || 0.5), 0) / formFeedback.length
        : 0

    return {
      id: form._id.toString(),
      title: form.title || "Untitled Form",
      totalFeedback: formFeedback.length,
      averageSentimentScore: formSentimentScore,
    }
  })

  // AI Insights
  const topKeywords = getTopItems(allKeywords, 10)
  const topEmotions = getTopItems(allEmotions, 8)
  const recommendations = generateRecommendations(sentimentCounts, averageSentimentScore, totalFeedback)

  // Create emotion analysis object
  const emotionAnalysis: { [key: string]: number } = {}
  topEmotions.forEach((emotion, index) => {
    // Calculate percentage based on frequency and position
    const frequency = allEmotions.filter((e) => e === emotion).length
    const percentage = totalFeedback > 0 ? (frequency / totalFeedback) * 100 : 0
    emotionAnalysis[emotion] = Math.min(100, percentage * (1 + (topEmotions.length - index) * 0.1))
  })

  const analytics = {
    overview: {
      totalFeedback,
      averageSentimentScore,
      formsCreated,
      activeForms,
    },
    feedbackTrends,
    sentimentTrends,
    formPerformance,
    sentimentDistribution: sentimentCounts,
    aiInsights: {
      recommendations,
      topKeywords,
      emergingTrends: generateEmergingTrends(feedback),
      emotionAnalysis,
      actionableInsights: generateActionableInsights(sentimentCounts, averageSentimentScore, topKeywords),
      averageConfidence,
      totalAnalyzed: feedback.filter((f) => f.sentiment).length,
    },
  }

  return analytics
}

function calculateFeedbackTrends(feedback: any[]) {
  const trends: { [date: string]: number } = {}

  feedback.forEach((item) => {
    const date = new Date(item.createdAt || item.submittedAt || Date.now()).toISOString().split("T")[0]
    trends[date] = (trends[date] || 0) + 1
  })

  return Object.entries(trends)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

function calculateSentimentTrends(feedback: any[]) {
  const trends: { [date: string]: { total: number; sum: number } } = {}

  feedback.forEach((item) => {
    if (item.sentiment) {
      const date = new Date(item.createdAt || item.submittedAt || Date.now()).toISOString().split("T")[0]
      if (!trends[date]) {
        trends[date] = { total: 0, sum: 0 }
      }
      trends[date].total++
      trends[date].sum += item.sentiment.score
    }
  })

  return Object.entries(trends)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      averageScore: data.total > 0 ? data.sum / data.total : 0,
    }))
}

function getTopItems(items: string[], limit: number): string[] {
  const counts: { [key: string]: number } = {}
  items.forEach((item) => {
    if (item && typeof item === "string") {
      counts[item] = (counts[item] || 0) + 1
    }
  })

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item)
}

function generateRecommendations(sentimentCounts: any, averageScore: number, totalFeedback: number): string[] {
  const recommendations = []

  if (totalFeedback === 0) {
    recommendations.push("Start collecting feedback to get meaningful insights and improve your services.")
    return recommendations
  }

  const negativePercentage = (sentimentCounts.Negative / totalFeedback) * 100
  const positivePercentage = (sentimentCounts.Positive / totalFeedback) * 100
  const neutralPercentage = (sentimentCounts.Neutral / totalFeedback) * 100

  if (negativePercentage > 40) {
    recommendations.push("⚠️ High negative feedback detected. Immediate action required to address customer concerns.")
  } else if (negativePercentage > 20) {
    recommendations.push(
      "📊 Moderate negative feedback present. Consider reviewing recent changes and customer pain points.",
    )
  }

  if (positivePercentage > 70) {
    recommendations.push(
      "🎉 Excellent! High positive sentiment. Consider leveraging satisfied customers for testimonials and referrals.",
    )
  } else if (positivePercentage > 50) {
    recommendations.push("👍 Good positive sentiment. Focus on maintaining quality and addressing neutral feedback.")
  }

  if (neutralPercentage > 50) {
    recommendations.push(
      "🔍 High neutral sentiment suggests room for improvement. Engage customers to understand their needs better.",
    )
  }

  if (averageScore < 0.3) {
    recommendations.push("🚨 Critical: Very low sentiment score. Urgent review of products/services needed.")
  } else if (averageScore < 0.5) {
    recommendations.push("📉 Below average sentiment. Focus on identifying and resolving key issues.")
  } else if (averageScore > 0.8) {
    recommendations.push(
      "⭐ Outstanding sentiment score! This is an excellent time to expand or promote your offerings.",
    )
  }

  if (totalFeedback < 10) {
    recommendations.push(
      "📈 Increase feedback collection through surveys, follow-ups, and incentives to get more reliable insights.",
    )
  }

  return recommendations
}

function generateEmergingTrends(feedback: any[]): string[] {
  const trends = []

  if (feedback.length === 0) return trends

  // Analyze recent vs older feedback
  const now = new Date()
  const recentFeedback = feedback.filter((f) => {
    const feedbackDate = new Date(f.createdAt || f.submittedAt || now)
    const daysDiff = (now.getTime() - feedbackDate.getTime()) / (1000 * 3600 * 24)
    return daysDiff <= 7
  })

  if (recentFeedback.length > 0) {
    const recentPositive = recentFeedback.filter((f) => f.sentiment?.label === "Positive").length
    const recentPositivePercentage = (recentPositive / recentFeedback.length) * 100

    if (recentPositivePercentage > 70) {
      trends.push("📈 Recent feedback shows improving sentiment")
    } else if (recentPositivePercentage < 30) {
      trends.push("📉 Recent feedback shows declining sentiment")
    }
  }

  return trends
}

function generateActionableInsights(sentimentCounts: any, averageScore: number, topKeywords: string[]): string[] {
  const insights = []

  if (sentimentCounts.Negative > 0) {
    insights.push(`Address ${sentimentCounts.Negative} negative feedback items to improve overall satisfaction`)
  }

  if (topKeywords.length > 0) {
    insights.push(`Focus on keywords: ${topKeywords.slice(0, 3).join(", ")} - these appear frequently in feedback`)
  }

  if (averageScore > 0.7) {
    insights.push("Leverage high satisfaction scores in marketing materials and case studies")
  }

  if (sentimentCounts.Neutral > sentimentCounts.Positive) {
    insights.push("Convert neutral customers to promoters through targeted engagement and improvements")
  }

  return insights
}
