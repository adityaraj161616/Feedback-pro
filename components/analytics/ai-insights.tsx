"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Target, Zap, BarChart3 } from "lucide-react"
import type { AnalyticsData } from "@/lib/types"

interface AiInsightsProps {
  analytics: AnalyticsData
}

export function AiInsights({ analytics }: AiInsightsProps) {
  const { sentimentDistribution, aiInsights, overview } = analytics
  const totalFeedback = overview.totalFeedback

  // Calculate percentages
  const positivePercentage = totalFeedback > 0 ? (sentimentDistribution.Positive / totalFeedback) * 100 : 0
  const neutralPercentage = totalFeedback > 0 ? (sentimentDistribution.Neutral / totalFeedback) * 100 : 0
  const negativePercentage = totalFeedback > 0 ? (sentimentDistribution.Negative / totalFeedback) * 100 : 0

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "text-green-400"
      case "Negative":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

  const getSentimentIcon = (percentage: number) => {
    if (percentage > 60) return <CheckCircle className="h-5 w-5 text-green-400" />
    if (percentage > 30) return <AlertTriangle className="h-5 w-5 text-yellow-400" />
    return <AlertTriangle className="h-5 w-5 text-red-400" />
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Overview */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md border border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            AI Analysis Overview
            <Badge variant="secondary" className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
              Powered by Gemini AI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalFeedback}</div>
              <div className="text-sm text-gray-400">Total Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{aiInsights.totalAnalyzed || 0}</div>
              <div className="text-sm text-gray-400">AI Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {aiInsights.averageConfidence ? (aiInsights.averageConfidence * 100).toFixed(0) : 0}%
              </div>
              <div className="text-sm text-gray-400">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{aiInsights.topKeywords.length}</div>
              <div className="text-sm text-gray-400">Keywords Found</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Analysis Breakdown */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Detailed Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-green-400 font-semibold">Positive Feedback</span>
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{sentimentDistribution.Positive}</div>
              <div className="text-sm text-gray-300 mb-3">{positivePercentage.toFixed(1)}% of total feedback</div>
              <Progress value={positivePercentage} className="h-2 bg-green-900/30" />
              <div className="mt-2 text-xs text-green-300">
                {positivePercentage > 70
                  ? "Excellent performance!"
                  : positivePercentage > 50
                    ? "Good performance"
                    : "Room for improvement"}
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-yellow-400 font-semibold">Neutral Feedback</span>
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{sentimentDistribution.Neutral}</div>
              <div className="text-sm text-gray-300 mb-3">{neutralPercentage.toFixed(1)}% of total feedback</div>
              <Progress value={neutralPercentage} className="h-2 bg-yellow-900/30" />
              <div className="mt-2 text-xs text-yellow-300">
                {neutralPercentage > 50 ? "High neutral sentiment" : "Balanced feedback"}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-lg p-4 border border-red-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-red-400 font-semibold">Negative Feedback</span>
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{sentimentDistribution.Negative}</div>
              <div className="text-sm text-gray-300 mb-3">{negativePercentage.toFixed(1)}% of total feedback</div>
              <Progress value={negativePercentage} className="h-2 bg-red-900/30" />
              <div className="mt-2 text-xs text-red-300">
                {negativePercentage > 30
                  ? "Needs attention"
                  : negativePercentage > 10
                    ? "Monitor closely"
                    : "Well managed"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiInsights.recommendations.length > 0 ? (
            <div className="space-y-3">
              {aiInsights.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                      <Lightbulb className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm leading-relaxed">{recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-white font-medium mb-2">Analyzing Your Feedback...</h4>
              <p className="text-gray-400 text-sm">
                AI insights will appear as more feedback is collected and analyzed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keywords & Topics */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Key Topics & Trending Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiInsights.topKeywords.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {aiInsights.topKeywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`
                      ${index < 3 ? "bg-blue-500/30 text-blue-200 border-blue-500/50" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}
                      hover:bg-blue-500/40 transition-colors
                    `}
                  >
                    {keyword}
                    {index < 3 && <span className="ml-1 text-xs">🔥</span>}
                  </Badge>
                ))}
              </div>
              <div className="text-sm text-gray-400">
                Top keywords extracted from {aiInsights.totalAnalyzed || 0} analyzed feedback entries
              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <p className="text-gray-400 text-sm">
                No keywords extracted yet. Submit more feedback to see keyword trends.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emotion Analysis */}
      {Object.keys(aiInsights.emotionAnalysis).length > 0 && (
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-400" />
              Emotion Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(aiInsights.emotionAnalysis).map(([emotion, value]) => (
                <div key={emotion} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-sm text-gray-300 capitalize font-medium">{emotion}</div>
                  <div className="text-xl font-bold text-white mt-1">{value.toFixed(0)}%</div>
                  <Progress value={value} className="mt-2 h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actionable Insights */}
      {aiInsights.actionableInsights.length > 0 && (
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Actionable Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.actionableInsights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-purple-500/20 rounded">
                      <Target className="h-4 w-4 text-purple-400" />
                    </div>
                    <p className="text-gray-200 text-sm">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emerging Trends */}
      {aiInsights.emergingTrends.length > 0 && (
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Emerging Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiInsights.emergingTrends.map((trend, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-200">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm">{trend}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
