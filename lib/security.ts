import { type NextRequest, NextResponse } from "next/server"

// Rate Limiting Middleware (simplified for Next.js API routes)
// In a real production environment, you'd integrate a proper rate-limiting solution
// like Upstash Redis or a Vercel Edge Middleware for more robust IP tracking.
// For this example, we'll use a basic in-memory simulation.

// Store request counts globally (not ideal for production, but works for demo)
const requestCounts = new Map<string, { count: number; lastReset: number }>()

const DEFAULT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const DEFAULT_MAX_REQUESTS = 100 // Max 100 requests per window

export async function applyRateLimit(req: NextRequest, windowMs = DEFAULT_WINDOW_MS, max = DEFAULT_MAX_REQUESTS) {
  const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1"
  const key = `rate_limit:${ip}`

  let entry = requestCounts.get(key)
  const now = Date.now()

  if (!entry || now - entry.lastReset > windowMs) {
    entry = { count: 0, lastReset: now }
    requestCounts.set(key, entry)
  }

  entry.count++

  if (entry.count > max) {
    return NextResponse.json({ error: "Too many requests from this IP, please try again later." }, { status: 429 })
  }

  return null // No rate limit exceeded
}

// Input Sanitization without external dependencies
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return String(input)

  // Basic HTML/XSS sanitization
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim()
}

export function sanitizeObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item))
  }

  const sanitizedObj: { [key: string]: any } = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (typeof value === "string") {
        sanitizedObj[key] = sanitizeInput(value)
      } else if (typeof value === "object" && value !== null) {
        sanitizedObj[key] = sanitizeObject(value)
      } else {
        sanitizedObj[key] = value
      }
    }
  }
  return sanitizedObj
}
