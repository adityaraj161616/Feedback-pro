"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  LineChart,
  PieChart,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { LayoutDashboard, FormInput, MessageSquare, TrendingUp, Download, Zap } from "lucide-react"
import { AiInsights } from "@/components/analytics/ai-insights"
import { WordCloud } from "@/components/analytics/word-cloud"
import { SentimentHeatmap } from "@/components/analytics/sentiment-heatmap"
import { ExportModal } from "@/components/export/export-modal"
import type { AnalyticsData, FormEntry } from "@/lib/types"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: {
      totalFeedback: 0,
      averageSentimentScore: 0,
      formsCreated: 0,
      activeForms: 0,
    },
    feedbackTrends: [],
    sentimentTrends: [],
    formPerformance: [],
    aiInsights: {
      recommendations: [],
      topKeywords: [],
      emergingTrends: [],
      emotionAnalysis: {},
      actionableInsights: [],
    },
    sentimentDistribution: {
      Positive: 0,
      Neutral: 0,
      Negative: 0,
    },
  })
  const [forms, setForms] = useState<FormEntry[]>([])
  const [selectedFormId, setSelectedFormId] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && userId) {
      fetchForms()
      fetchAnalytics()
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status, userId, selectedFormId])

  const fetchForms = async () => {
    try {
      const response = await fetch(`/api/forms?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setForms(data.forms || []) // Ensure it's an array
      } else {
        console.error("Failed to fetch forms")
        setForms([])
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      setForms([])
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (userId) queryParams.append("userId", userId)
      if (selectedFormId !== "all") queryParams.append("formId", selectedFormId)

      const response = await fetch(`/api/analytics?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        console.error("Failed to fetch analytics")
        // Set default empty analytics data on error
        setAnalytics({
          overview: {
            totalFeedback: 0,
            averageSentimentScore: 0,
            formsCreated: 0,
            activeForms: 0,
          },
          feedbackTrends: [],
          sentimentTrends: [],
          formPerformance: [],
          aiInsights: {
            recommendations: [],
            topKeywords: [],
            emergingTrends: [],
            emotionAnalysis: {},
            actionableInsights: [],
          },
          sentimentDistribution: {
            Positive: 0,
            Neutral: 0,
            Negative: 0,
          },
        })
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      // Set default empty analytics data on error
      setAnalytics({
        overview: {
          totalFeedback: 0,
          averageSentimentScore: 0,
          formsCreated: 0,
          activeForms: 0,
        },
        feedbackTrends: [],
        sentimentTrends: [],
        formPerformance: [],
        aiInsights: {
          recommendations: [],
          topKeywords: [],
          emergingTrends: [],
          emotionAnalysis: {},
          actionableInsights: [],
        },
        sentimentDistribution: {
          Positive: 0,
          Neutral: 0,
          Negative: 0,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const currentFormUrl =
    selectedFormId !== "all" ? `${process.env.NEXT_PUBLIC_APP_URL}/feedback/${selectedFormId}` : undefined

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="text-xl">Loading analytics...</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-8 text-center">
          <CardContent>
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300 mb-6">Please sign in to view your analytics dashboard.</p>
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <LayoutDashboard className="h-9 w-9 text-blue-400" /> Analytics Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <Select value={selectedFormId} onValueChange={setSelectedFormId}>
            <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select Form" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              <SelectItem value="all">All Forms</SelectItem>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsExportModalOpen(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Download className="mr-2 h-4 w-4" /> Export & Integrations
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-600/40 to-blue-800/40 backdrop-blur-md border border-blue-500/50 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-200 text-sm">Total Feedback</p>
              <p className="text-3xl font-bold text-white">{analytics.overview.totalFeedback}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-600/40 to-purple-800/40 backdrop-blur-md border border-purple-500/50 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-200 text-sm">Avg. Sentiment Score</p>
              <p className="text-3xl font-bold text-white">
                {(analytics.overview.averageSentimentScore * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-600/40 to-green-800/40 backdrop-blur-md border border-green-500/50 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-200 text-sm">Forms Created</p>
              <p className="text-3xl font-bold text-white">{analytics.overview.formsCreated}</p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <FormInput className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-600/40 to-orange-800/40 backdrop-blur-md border border-orange-500/50 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-200 text-sm">Active Forms</p>
              <p className="text-3xl font-bold text-white">{analytics.overview.activeForms}</p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 text-white border-b border-white/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Trends
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Form Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md border border-purple-700/30 text-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Feedback Volume Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.feedbackTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip
                      contentStyle={{ background: "#333", border: "none", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Feedback Count" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md border border-purple-700/30 text-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.sentimentDistribution).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(analytics.sentimentDistribution).map(([name, value], index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#333", border: "none", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md border border-purple-700/30 text-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Average Sentiment Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.sentimentTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#ccc" />
                    <YAxis domain={[0, 1]} stroke="#ccc" />
                    <Tooltip
                      contentStyle={{ background: "#333", border: "none", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff" }}
                      formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="averageScore" stroke="#82ca9d" name="Avg. Sentiment Score" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <SentimentHeatmap analytics={analytics} />
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <AiInsights analytics={analytics} />
            <WordCloud analytics={analytics} />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md border border-purple-700/30 text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Form Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.formPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="title" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip
                    contentStyle={{ background: "#333", border: "none", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Bar dataKey="totalFeedback" fill="#8884d8" name="Total Feedback" />
                  <Bar dataKey="averageSentimentScore" fill="#82ca9d" name="Avg. Sentiment Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false)
          // Reset any state in the modal if needed
        }}
        formId={selectedFormId !== "all" ? selectedFormId : undefined}
        formUrl={currentFormUrl}
      />
    </div>
  )
}
