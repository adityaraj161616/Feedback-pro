"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, TrendingUp, Users, Star } from "lucide-react"

const stats = [
  {
    title: "Total Feedback",
    value: 0,
    target: 1247,
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
    change: "+12%",
  },
  {
    title: "Response Rate",
    value: 0,
    target: 89,
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
    change: "+5%",
    suffix: "%",
  },
  {
    title: "Active Users",
    value: 0,
    target: 342,
    icon: Users,
    color: "from-purple-500 to-pink-500",
    change: "+18%",
  },
  {
    title: "Avg Rating",
    value: 0,
    target: 4.8,
    icon: Star,
    color: "from-yellow-500 to-orange-500",
    change: "+0.3",
    decimals: 1,
  },
]

export function StatsCards() {
  const cardsRef = useRef<HTMLDivElement>(null)
  const [animatedStats, setAnimatedStats] = useState(stats)

  useEffect(() => {
    // Animate numbers counting up
    stats.forEach((stat, index) => {
      gsap.to(animatedStats[index], {
        value: stat.target,
        duration: 2,
        delay: index * 0.2,
        ease: "power2.out",
        onUpdate: function () {
          setAnimatedStats((prev) => {
            const newStats = [...prev]
            newStats[index] = {
              ...newStats[index],
              value: this.targets()[0].value,
            }
            return newStats
          })
        },
      })
    })
  }, [])

  const formatValue = (value: number, decimals?: number, suffix?: string) => {
    const formatted = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString()
    return `${formatted}${suffix || ""}`
  }

  return (
    <>
      {animatedStats.map((stat, index) => (
        <Card
          key={index}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {formatValue(stat.value, stat.decimals, stat.suffix)}
            </div>
            <p className="text-xs text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
