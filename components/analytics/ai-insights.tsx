"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Lightbulb, TrendingUp, Tag, Smile, Frown, Meh } from "lucide-react"
import type { AnalyticsData } from "@/lib/types"

interface AiInsightsProps {
  analytics: AnalyticsData
}

export function AiInsights({ analytics }: AiInsightsProps) {
  const { aiInsights, sentimentDistribution } = analytics

  const getSentimentEmoji = (label: string) => {
    switch (label) {
      case "Positive":
        return <Smile className="h-4 w-4 text-green-500" />
      case "Negative":
        return <Frown className="h-4 w-4 text-red-500" />
      case "Neutral":
        return <Meh className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md border border-purple-700/30 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-400" /> AI Insights
        </CardTitle>
        <Badge variant="secondary" className="bg-purple-500/30 text-purple-200">
          Powered by Gemini AI
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {aiInsights.recommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-300">
              <Lightbulb className="h-5 w-5" /> Key Recommendations
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {aiInsights.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {aiInsights.topKeywords.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-300">
              <Tag className="h-5 w-5" /> Top Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {aiInsights.topKeywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-400/50">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {aiInsights.emergingTrends.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-300">
              <TrendingUp className="h-5 w-5" /> Emerging Trends
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {aiInsights.emergingTrends.map((trend, index) => (
                <li key={index}>{trend}</li>
              ))}
            </ul>
          </div>
        )}

        {sentimentDistribution && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-300">
              <Smile className="h-5 w-5" /> Overall Sentiment Distribution
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {Object.entries(sentimentDistribution).map(([label, count]) => (
                <div key={label} className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    {getSentimentEmoji(label)}
                    <span className="text-lg font-medium text-gray-200">{label}</span>
                  </div>
                  <span className="text-3xl font-bold text-white">{count}</span>
                  <span className="text-sm text-gray-400">Feedback</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {aiInsights.emotionAnalysis && Object.keys(aiInsights.emotionAnalysis).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-300">
              <Smile className="h-5 w-5" /> Emotion Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(aiInsights.emotionAnalysis).map(([emotion, count]) => (
                <Badge
                  key={emotion}
                  variant="outline"
                  className="bg-green-500/20 text-green-200 border-green-400/50 flex items-center justify-center py-2"
                >
                  {emotion}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {aiInsights.actionableInsights.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-300">
              <Lightbulb className="h-5 w-5" /> Actionable Insights
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {aiInsights.actionableInsights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
