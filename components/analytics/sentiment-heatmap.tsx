"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface SentimentHeatmapProps {
  data: Array<{
    date: string
    averageScore: number
  }>
}

export function SentimentHeatmap({ data }: SentimentHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Sentiment Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No sentiment trend data available yet. Submit more feedback to see patterns.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return "bg-green-500"
    if (score >= 0.5) return "bg-yellow-500"
    if (score >= 0.3) return "bg-orange-500"
    return "bg-red-500"
  }

  const getSentimentIntensity = (score: number) => {
    if (score >= 0.8) return "opacity-100"
    if (score >= 0.6) return "opacity-80"
    if (score >= 0.4) return "opacity-60"
    if (score >= 0.2) return "opacity-40"
    return "opacity-20"
  }

  const getSentimentIcon = (score: number) => {
    if (score >= 0.6) return <TrendingUp className="h-3 w-3 text-green-400" />
    if (score >= 0.4) return <Minus className="h-3 w-3 text-yellow-400" />
    return <TrendingDown className="h-3 w-3 text-red-400" />
  }

  const getSentimentLabel = (score: number) => {
    if (score >= 0.7) return "Very Positive"
    if (score >= 0.5) return "Positive"
    if (score >= 0.3) return "Neutral"
    return "Negative"
  }

  // Group data by week for better visualization
  const groupedData = data.reduce(
    (acc, item) => {
      const date = new Date(item.date)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split("T")[0]

      if (!acc[weekKey]) {
        acc[weekKey] = []
      }
      acc[weekKey].push(item)
      return acc
    },
    {} as { [key: string]: typeof data },
  )

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Sentiment Heatmap
          <Badge variant="secondary" className="ml-2 bg-purple-500/20 text-purple-300">
            {data.length} data points
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recent Sentiment Trend */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {data.slice(-7).map((item, index) => {
              const date = new Date(item.date)
              const dayName = date.toLocaleDateString("en-US", { weekday: "short" })

              return (
                <div key={item.date} className="text-center">
                  <div className="text-xs text-gray-400 mb-1">{dayName}</div>
                  <div
                    className={`
                      w-full h-12 rounded-lg border border-white/20 flex items-center justify-center
                      ${getSentimentColor(item.averageScore)} 
                      ${getSentimentIntensity(item.averageScore)}
                      hover:opacity-100 transition-opacity cursor-pointer
                    `}
                    title={`${item.date}: ${getSentimentLabel(item.averageScore)} (${(item.averageScore * 100).toFixed(0)}%)`}
                  >
                    {getSentimentIcon(item.averageScore)}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">{(item.averageScore * 100).toFixed(0)}%</div>
                </div>
              )
            })}
          </div>

          {/* Sentiment Legend */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs text-gray-400">Negative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-xs text-gray-400">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-400">Positive</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {data.length > 0
                  ? ((data.reduce((sum, item) => sum + item.averageScore, 0) / data.length) * 100).toFixed(0)
                  : 0}
                %
              </div>
              <div className="text-xs text-gray-400">Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {data.filter((item) => item.averageScore >= 0.6).length}
              </div>
              <div className="text-xs text-gray-400">Positive Days</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">
                {data.filter((item) => item.averageScore < 0.4).length}
              </div>
              <div className="text-xs text-gray-400">Negative Days</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
