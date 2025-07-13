"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AiInsights } from "@/components/analytics/ai-insights"
import { WordCloud } from "@/components/analytics/word-cloud"
import { SentimentHeatmap } from "@/components/analytics/sentiment-heatmap"
import { ExportModal } from "@/components/export/export-modal"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  Download,
  RefreshCw,
  BarChart3,
  Brain,
  Calendar,
  Target,
} from "lucide-react"
import type { AnalyticsData } from "@/lib/types"

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [forms, setForms] = useState<any[]>([])
  const [selectedForm, setSelectedForm] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchForms()
      fetchAnalytics()
    }
  }, [session?.user?.id, selectedForm])

  const fetchForms = async () => {
    try {
      const response = await fetch(`/api/forms?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
    }
  }

  const fetchAnalytics = async () => {
    if (!session?.user?.id) return

    try {
      setRefreshing(true)
      const url = `/api/analytics?userId=${session.user.id}&formId=${selectedForm}`
      console.log("Fetching analytics from:", url)

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        console.log("Analytics data received:", data)
        setAnalytics(data)
      } else {
        console.error("Failed to fetch analytics:", response.status)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchAnalytics()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">Loading analytics...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">No Analytics Data</h2>
            <p>Unable to load analytics data. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  const COLORS = ["#10B981", "#F59E0B", "#EF4444"]

  const pieChartData = [
    { name: "Positive", value: analytics.sentimentDistribution.Positive, color: "#10B981" },
    { name: "Neutral", value: analytics.sentimentDistribution.Neutral, color: "#F59E0B" },
    { name: "Negative", value: analytics.sentimentDistribution.Negative, color: "#EF4444" },
  ].filter((item) => item.value > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <DashboardHeader />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="h-10 w-10 text-blue-400" />
              Analytics Dashboard
            </h1>
            <p className="text-blue-200">Comprehensive insights into your feedback data</p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Select value={selectedForm} onValueChange={setSelectedForm}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select form" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">
                  All Forms
                </SelectItem>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id} className="text-white">
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              onClick={() => setShowExportModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/30">
              <Target className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-blue-500/30">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-blue-500/30">
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-500/30">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">Total Feedback</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics.overview.totalFeedback}</div>
                  <p className="text-xs text-blue-300">Across all forms</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">Avg Sentiment</CardTitle>
                  <Star className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {(analytics.overview.averageSentimentScore * 5).toFixed(1)}/5
                  </div>
                  <p className="text-xs text-blue-300">Overall satisfaction</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">Active Forms</CardTitle>
                  <Users className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics.overview.activeForms}</div>
                  <p className="text-xs text-blue-300">Currently collecting feedback</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">Total Forms</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics.overview.formsCreated}</div>
                  <p className="text-xs text-blue-300">Forms created</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Distribution */}
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Sentiment Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pieChartData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(0, 0, 0, 0.8)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              borderRadius: "8px",
                              color: "white",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      No sentiment data available
                    </div>
                  )}

                  {/* Legend */}
                  <div className="flex justify-center gap-4 mt-4">
                    {pieChartData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-gray-300">
                          {entry.name}: {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Trends */}
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    Feedback Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.feedbackTrends.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.feedbackTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.7)"
                            fontSize={12}
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(0, 0, 0, 0.8)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              borderRadius: "8px",
                              color: "white",
                            }}
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      No feedback trends available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Trends */}
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Sentiment Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.sentimentTrends.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.sentimentTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.7)"
                            fontSize={12}
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} domain={[0, 1]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(0, 0, 0, 0.8)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              borderRadius: "8px",
                              color: "white",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="averageScore"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      No sentiment trends available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sentiment Heatmap */}
              <SentimentHeatmap data={analytics.sentimentTrends} />
            </div>

            {/* Word Cloud */}
            <WordCloud keywords={analytics.aiInsights.topKeywords} />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights">
            <AiInsights analytics={analytics} />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Form Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.formPerformance.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.formPerformance.map((form) => (
                      <div
                        key={form.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div>
                          <h3 className="font-semibold text-white">{form.title}</h3>
                          <p className="text-sm text-gray-400">{form.totalFeedback} responses</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {(form.averageSentimentScore * 5).toFixed(1)}/5
                          </div>
                          <Badge
                            variant={
                              form.averageSentimentScore > 0.6
                                ? "default"
                                : form.averageSentimentScore > 0.4
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {form.averageSentimentScore > 0.6
                              ? "Positive"
                              : form.averageSentimentScore > 0.4
                                ? "Neutral"
                                : "Negative"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">No form performance data available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          analytics={analytics}
          selectedForm={selectedForm}
        />
      )}
    </div>
  )
}
