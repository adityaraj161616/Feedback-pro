"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts"

const chartData = [
  { month: "Jan", feedback: 65, sentiment: 4.2 },
  { month: "Feb", feedback: 89, sentiment: 4.1 },
  { month: "Mar", feedback: 123, sentiment: 4.5 },
  { month: "Apr", feedback: 156, sentiment: 4.3 },
  { month: "May", feedback: 198, sentiment: 4.6 },
  { month: "Jun", feedback: 234, sentiment: 4.4 },
  { month: "Jul", feedback: 267, sentiment: 4.7 },
]

interface FeedbackChartProps {
  data?: any[]
}

export function FeedbackChart({ data = chartData }: FeedbackChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Chart entrance animation
    gsap.fromTo(
      chartRef.current,
      { opacity: 0, scale: 0.9, y: 50 },
      { opacity: 1, scale: 1, y: 0, duration: 1, ease: "back.out(1.7)", delay: 0.5 },
    )
  }, [])

  return (
    <Card ref={chartRef} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Feedback Trends</CardTitle>
        <CardDescription className="text-gray-400">Monthly feedback volume and sentiment analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            feedback: {
              label: "Feedback Count",
              color: "hsl(var(--chart-1))",
            },
            sentiment: {
              label: "Avg Sentiment",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="feedbackGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="feedback" stroke="#8b5cf6" fillOpacity={1} fill="url(#feedbackGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
