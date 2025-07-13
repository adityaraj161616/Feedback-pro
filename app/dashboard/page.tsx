"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentFeedback } from "@/components/dashboard/recent-feedback"
import { FeedbackChart } from "@/components/dashboard/feedback-chart"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const dashboardRef = useRef<HTMLDivElement>(null)
  const [feedbackData, setFeedbackData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const router = useRouter()

  useEffect(() => {
    console.log("Dashboard - Session status:", status)
    console.log("Dashboard - Session data:", session)

    if (status === "loading") {
      // Still loading, do nothing
      return
    }

    if (status === "unauthenticated") {
      console.log("User not authenticated, redirecting to sign in")
      router.push("/auth/signin?callbackUrl=/dashboard")
      return
    }

    if (status === "authenticated" && session) {
      console.log("User authenticated, setting up dashboard")

      // Dashboard entrance animations
      const tl = gsap.timeline()

      tl.fromTo(".dashboard-header", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
        .fromTo(
          ".stats-cards",
          { opacity: 0, y: 100, stagger: 0.1 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" },
          "-=0.4",
        )
        .fromTo(
          ".dashboard-content",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
          "-=0.2",
        )

      // Fetch user's feedback data
      fetchFeedbackData()

      // Welcome message for users (only show once)
      if (!hasShownWelcome) {
        toast.success(`Welcome back, ${session.user?.name || "User"}!`)
        setHasShownWelcome(true)
      }
    }
  }, [status, session, router, hasShownWelcome])

  const fetchFeedbackData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/feedback/user")
      if (response.ok) {
        const data = await response.json()
        setFeedbackData(data)
      } else {
        console.error("Failed to fetch feedback data")
      }
    } catch (error) {
      console.error("Error fetching feedback data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  // Show redirecting state
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Redirecting to sign in...</div>
        </div>
      </div>
    )
  }

  // Render dashboard for authenticated users
  if (status === "authenticated" && session) {
    return (
      <div ref={dashboardRef} className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="dashboard-header">
          <DashboardHeader user={session.user} />
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="stats-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCards />
          </div>

          {/* Main Dashboard Content */}
          <div className="dashboard-content grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <FeedbackChart data={feedbackData} />
              <RecentFeedback />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return null
}
