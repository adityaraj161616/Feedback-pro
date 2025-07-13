"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, TrendingUp, Users, Brain, Activity } from "lucide-react"

interface AdminStatsProps {
  stats: {
    totalFeedback: number
    totalForms: number
    totalUsers: number
    avgSentiment: number
    responseRate: number
    sentimentBreakdown: {
      positive: number
      neutral: number
      negative: number
    }
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  const cardsRef = useRef<HTMLDivElement>(null)
  const [animatedStats, setAnimatedStats] = useState({
    totalFeedback: 0,
    totalForms: 0,
    totalUsers: 0,
    avgSentiment: 0,
    responseRate: 0,
  })

  useEffect(() => {
    // Animate numbers counting up
    gsap.to(animatedStats, {
      totalFeedback: stats.totalFeedback,
      totalForms: stats.totalForms,
      totalUsers: stats.totalUsers,
      avgSentiment: stats.avgSentiment,
      responseRate: stats.responseRate,
      duration: 2,
      ease: "power2.out",
      onUpdate: function () {
        setAnimatedStats({ ...this.targets()[0] })
      },
    })
  }, [stats])

  const adminStatsData = [
    {
      title: "Total Feedback",
      value: Math.round(animatedStats.totalFeedback).toLocaleString(),
      icon: MessageSquare,
      color: "from-blue-500 to-blue-600",
      change: "+12%",
    },
    {
      title: "Active Forms",
      value: Math.round(animatedStats.totalForms).toLocaleString(),
      icon: Activity,
      color: "from-green-500 to-green-600",
      change: "+8%",
    },
    {
      title: "Total Users",
      value: Math.round(animatedStats.totalUsers).toLocaleString(),
      icon: Users,
      color: "from-purple-500 to-purple-600",
      change: "+23%",
    },
    {
      title: "Avg Sentiment",
      value: `${Math.round(animatedStats.avgSentiment)}%`,
      icon: Brain,
      color: "from-yellow-500 to-orange-500",
      change: "+5%",
    },
  ]

  return (
    <>
      {adminStatsData.map((stat, index) => (
        <Card
          key={index}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-blue-200/20 hover:border-blue-300/40 transition-all duration-300 cursor-pointer group"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100 group-hover:text-white transition-colors">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <p className="text-xs text-blue-300 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
