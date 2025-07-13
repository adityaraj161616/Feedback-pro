"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { FeedbackTable } from "@/components/admin/feedback-table"
import { SentimentChart } from "@/components/admin/sentiment-chart"
import { RealtimeUpdates } from "@/components/admin/realtime-updates"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const adminRef = useRef<HTMLDivElement>(null)
  const [feedbackData, setFeedbackData] = useState([])
  const [stats, setStats] = useState({
    totalFeedback: 0,
    totalForms: 0,
    totalUsers: 0,
    avgSentiment: 0,
    responseRate: 0,
    sentimentBreakdown: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
  })

  useEffect(() => {
    console.log("Admin - Session status:", status)

    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      console.log("User not authenticated, redirecting to sign in")
      router.push("/auth/signin?callbackUrl=/admin")
      return
    }

    if (status === "authenticated" && session) {
      if (session.user.role !== "admin") {
        console.log("User is not admin, redirecting to dashboard")
        router.push("/dashboard")
        return
      }

      console.log("Admin authenticated, setting up admin dashboard")

      // Admin dashboard entrance animations
      const tl = gsap.timeline()

      tl.fromTo(".admin-header", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
        .fromTo(
          ".admin-stats",
          { opacity: 0, y: 100, stagger: 0.1 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" },
          "-=0.4",
        )
        .fromTo(
          ".admin-content",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
          "-=0.2",
        )

      fetchAdminData()
    }
  }, [status, session, router])

  const fetchAdminData = async () => {
    try {
      const [feedbackRes, statsRes] = await Promise.all([fetch("/api/admin/feedback"), fetch("/api/admin/stats")])

      if (feedbackRes.ok && statsRes.ok) {
        const feedback = await feedbackRes.json()
        const statsData = await statsRes.json()

        setFeedbackData(feedback)
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

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

  if (status === "authenticated" && session) {
    if (session.user.role !== "admin") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <div className="text-white text-xl">Redirecting to dashboard...</div>
          </div>
        </div>
      )
    }

    return (
      <div ref={adminRef} className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="admin-header">
          <AdminHeader user={session.user} />
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="admin-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminStats stats={stats} />
          </div>

          {/* Main Content */}
          <div className="admin-content grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <SentimentChart data={feedbackData} />
              <FeedbackTable data={feedbackData} onUpdate={fetchAdminData} />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <RealtimeUpdates />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return null
}
