"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageSquare, Clock } from "lucide-react"

const recentFeedback = [
  {
    id: 1,
    user: "Sarah Johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    rating: 5,
    comment: "Amazing product! The user experience is fantastic and the support team is very responsive.",
    sentiment: "positive",
    timestamp: "2 minutes ago",
    form: "Product Feedback",
  },
  {
    id: 2,
    user: "Mike Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    rating: 4,
    comment: "Good overall experience, but the checkout process could be improved.",
    sentiment: "neutral",
    timestamp: "15 minutes ago",
    form: "Website Feedback",
  },
  {
    id: 3,
    user: "Emily Davis",
    avatar: "/placeholder.svg?height=32&width=32",
    rating: 5,
    comment: "Love the new features! Keep up the great work.",
    sentiment: "positive",
    timestamp: "1 hour ago",
    form: "Feature Request",
  },
  {
    id: 4,
    user: "Anonymous",
    avatar: null,
    rating: 3,
    comment: "The app crashes sometimes on mobile devices.",
    sentiment: "negative",
    timestamp: "2 hours ago",
    form: "Bug Report",
  },
]

export function RecentFeedback() {
  const feedbackRef = useRef<HTMLDivElement>(null)
  const [feedback, setFeedback] = useState(recentFeedback)

  useEffect(() => {
    // Stagger animation for feedback items
    gsap.fromTo(
      ".feedback-item",
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.8 },
    )

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Add new feedback occasionally (for demo)
      if (Math.random() > 0.7) {
        const newFeedback = {
          id: Date.now(),
          user: "New User",
          avatar: "/placeholder.svg?height=32&width=32",
          rating: Math.floor(Math.random() * 5) + 1,
          comment: "Just submitted new feedback!",
          sentiment: "positive",
          timestamp: "Just now",
          form: "Live Form",
        }

        setFeedback((prev) => [newFeedback, ...prev.slice(0, 3)])

        // Animate new item
        setTimeout(() => {
          gsap.fromTo(
            ".feedback-item:first-child",
            { opacity: 0, scale: 0.8, x: -100 },
            { opacity: 1, scale: 1, x: 0, duration: 0.8, ease: "back.out(1.7)" },
          )
        }, 100)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-600"}`} />
    ))
  }

  return (
    <Card
      ref={feedbackRef}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20"
    >
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Recent Feedback
        </CardTitle>
        <CardDescription className="text-gray-400">Latest responses from your forms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback.map((item) => (
          <div
            key={item.id}
            className="feedback-item p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={item.avatar || ""} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                  {item.user.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">{item.user}</span>
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                      {item.form}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getSentimentColor(item.sentiment)}`} />
                    <span className="text-xs text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 mb-2">{renderStars(item.rating)}</div>

                <p className="text-sm text-gray-300 line-clamp-2">{item.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
