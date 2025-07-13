export interface FormField {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating" | "email" | "number"
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface FormEntry {
  id: string
  title: string
  description?: string
  fields: FormField[]
  userId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  settings?: {
    allowAnonymous?: boolean
    requireAuth?: boolean
    collectEmail?: boolean
    thankYouMessage?: string
    redirectUrl?: string
  }
}

export interface FeedbackEntry {
  id: string
  formId: string
  userId: string
  responses: Record<string, any>
  submittedAt: Date
  submitterEmail?: string
  submitterName?: string
  isAnonymous?: boolean
  sentiment?: {
    label: "Positive" | "Negative" | "Neutral"
    score: number
    emoji: string
    keywords: string[]
    emotions: string[]
    confidence?: number
  }
  metadata?: {
    userAgent?: string
    ipAddress?: string
    referrer?: string
  }
}

export interface AnalyticsData {
  overview: {
    totalFeedback: number
    averageSentimentScore: number
    formsCreated: number
    activeForms: number
  }
  feedbackTrends: Array<{
    date: string
    count: number
  }>
  sentimentTrends: Array<{
    date: string
    averageScore: number
    hourlySentiment?: { [hour: string]: number }
  }>
  formPerformance: Array<{
    id: string
    title: string
    totalFeedback: number
    averageSentimentScore: number
  }>
  aiInsights: {
    recommendations: string[]
    topKeywords: string[]
    emergingTrends: string[]
    emotionAnalysis: { [emotion: string]: number }
    actionableInsights: string[]
    averageConfidence?: number
    totalAnalyzed?: number
  }
  sentimentDistribution: {
    Positive: number
    Neutral: number
    Negative: number
  }
}

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: "user" | "admin"
  createdAt?: Date
  updatedAt?: Date
}

export interface AuditLog {
  id: string
  action: string
  userId: string
  resourceType: string
  resourceId: string
  details?: Record<string, any>
  timestamp: Date
  severity?: "low" | "medium" | "high"
  ipAddress?: string
  userAgent?: string
}

export interface ExportOptions {
  format: "csv" | "json" | "pdf"
  dateRange?: {
    start: Date
    end: Date
  }
  includeMetadata?: boolean
  includeSentiment?: boolean
  formIds?: string[]
}

export interface WebhookConfig {
  id: string
  url: string
  events: string[]
  isActive: boolean
  secret?: string
  headers?: Record<string, string>
  retryConfig?: {
    maxRetries: number
    retryDelay: number
  }
}

export interface NotificationSettings {
  email: {
    enabled: boolean
    onNewFeedback: boolean
    onNegativeFeedback: boolean
    dailyDigest: boolean
    weeklyReport: boolean
  }
  webhook: {
    enabled: boolean
    configs: WebhookConfig[]
  }
  realtime: {
    enabled: boolean
    channels: string[]
  }
}

export interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
  fields: FormField[]
  isPublic: boolean
  usageCount: number
  createdBy: string
  createdAt: Date
}

export interface Integration {
  id: string
  name: string
  type: "webhook" | "email" | "slack" | "discord" | "zapier"
  config: Record<string, any>
  isActive: boolean
  lastSync?: Date
  errorCount: number
}

export interface DashboardStats {
  totalFeedback: number
  totalForms: number
  activeForms: number
  averageSentiment: number
  recentFeedback: FeedbackEntry[]
  sentimentTrend: Array<{
    date: string
    positive: number
    neutral: number
    negative: number
  }>
  topPerformingForms: Array<{
    id: string
    title: string
    responseCount: number
    averageSentiment: number
  }>
}
