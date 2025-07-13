import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export interface SentimentResult {
  label: "Positive" | "Negative" | "Neutral"
  score: number
  emoji: string
  keywords: string[]
  emotions: string[]
  summary?: string
  confidence: number
}

export async function analyzeSentimentWithAI(text: string, rating?: number): Promise<SentimentResult> {
  try {
    console.log("Analyzing sentiment for:", { text, rating })

    // If we have a rating, use it as primary indicator
    if (rating !== undefined && rating !== null) {
      const sentimentFromRating = getSentimentFromRating(rating)
      console.log("Sentiment from rating:", sentimentFromRating)

      // Still analyze text for keywords and emotions if text exists
      if (text && text.trim()) {
        try {
          const textAnalysis = await analyzeTextWithGemini(text)
          return {
            ...sentimentFromRating,
            keywords: textAnalysis.keywords,
            emotions: textAnalysis.emotions,
            summary: textAnalysis.summary,
            confidence: 0.9, // High confidence when we have rating
          }
        } catch (error) {
          console.error("Error analyzing text with Gemini:", error)
          return {
            ...sentimentFromRating,
            keywords: extractKeywords(text),
            emotions: sentimentFromRating.emotions,
            confidence: 0.8,
          }
        }
      }

      return sentimentFromRating
    }

    // If no rating but we have text, analyze with Gemini
    if (text && text.trim()) {
      return await analyzeTextWithGemini(text)
    }

    // Fallback for empty feedback
    return {
      label: "Neutral",
      score: 0.5,
      emoji: "😐",
      keywords: [],
      emotions: ["neutral"],
      confidence: 0.3,
    }
  } catch (error) {
    console.error("Error in sentiment analysis:", error)
    return fallbackSentimentAnalysis(text, rating)
  }
}

function getSentimentFromRating(rating: number): SentimentResult {
  if (rating <= 2) {
    return {
      label: "Negative",
      score: rating === 1 ? 0.1 : 0.3,
      emoji: rating === 1 ? "😡" : "😞",
      keywords: [],
      emotions: rating === 1 ? ["angry", "frustrated"] : ["disappointed", "unsatisfied"],
      confidence: 0.9,
    }
  } else if (rating >= 4) {
    return {
      label: "Positive",
      score: rating === 4 ? 0.7 : 0.9,
      emoji: rating === 5 ? "😍" : "😊",
      keywords: [],
      emotions: rating === 5 ? ["delighted", "excited"] : ["satisfied", "happy"],
      confidence: 0.9,
    }
  } else {
    return {
      label: "Neutral",
      score: 0.5,
      emoji: "😐",
      keywords: [],
      emotions: ["neutral", "okay"],
      confidence: 0.8,
    }
  }
}

async function analyzeTextWithGemini(text: string): Promise<SentimentResult> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found, using fallback analysis")
    return fallbackSentimentAnalysis(text)
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
      Analyze the sentiment of this feedback text and return a JSON response with the following structure:
      {
        "label": "Positive" | "Negative" | "Neutral",
        "score": number between 0 and 1,
        "emoji": appropriate emoji,
        "keywords": array of 3-5 important keywords,
        "emotions": array of 2-3 detected emotions,
        "summary": brief summary of the feedback,
        "confidence": confidence score between 0 and 1
      }

      Text to analyze: "${text}"

      Guidelines:
      - Score 0.0-0.3 = Negative
      - Score 0.4-0.6 = Neutral  
      - Score 0.7-1.0 = Positive
      - Extract meaningful keywords (not common words)
      - Identify specific emotions
      - Provide a concise summary
      - Rate your confidence in the analysis

      Return only valid JSON without any markdown formatting:
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const textResponse = response.text()

    console.log("Gemini raw response:", textResponse)

    // Clean the response to extract JSON
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])

      return {
        label: parsed.label || "Neutral",
        score: Math.max(0, Math.min(1, parsed.score || 0.5)),
        emoji: parsed.emoji || "😐",
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : [],
        emotions: Array.isArray(parsed.emotions) ? parsed.emotions.slice(0, 3) : [],
        summary: parsed.summary || "",
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
      }
    }
  } catch (parseError) {
    console.error("Error parsing Gemini response:", parseError)
  }

  // Fallback if Gemini fails
  return fallbackSentimentAnalysis(text)
}

function fallbackSentimentAnalysis(text: string, rating?: number): SentimentResult {
  console.log("Using fallback sentiment analysis")

  if (rating !== undefined) {
    return getSentimentFromRating(rating)
  }

  if (!text) {
    return {
      label: "Neutral",
      score: 0.5,
      emoji: "😐",
      keywords: [],
      emotions: ["neutral"],
      confidence: 0.3,
    }
  }

  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "love",
    "perfect",
    "awesome",
    "fantastic",
    "wonderful",
    "satisfied",
    "happy",
    "pleased",
    "outstanding",
    "brilliant",
    "superb",
    "magnificent",
    "incredible",
    "terrific",
  ]

  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "hate",
    "horrible",
    "worst",
    "disappointed",
    "frustrated",
    "angry",
    "sad",
    "poor",
    "useless",
    "annoying",
    "disgusting",
    "pathetic",
    "ridiculous",
    "unacceptable",
    "failure",
  ]

  const lowerText = text.toLowerCase()
  const words = lowerText.split(/\W+/)

  let positiveCount = 0
  let negativeCount = 0

  words.forEach((word) => {
    if (positiveWords.includes(word)) positiveCount++
    if (negativeWords.includes(word)) negativeCount++
  })

  let label: "Positive" | "Negative" | "Neutral"
  let score: number
  let emoji: string
  let emotions: string[]

  if (positiveCount > negativeCount) {
    label = "Positive"
    score = Math.min(0.9, 0.6 + positiveCount * 0.1)
    emoji = "😊"
    emotions = ["happy", "satisfied"]
  } else if (negativeCount > positiveCount) {
    label = "Negative"
    score = Math.max(0.1, 0.4 - negativeCount * 0.1)
    emoji = "😞"
    emotions = ["disappointed", "frustrated"]
  } else {
    label = "Neutral"
    score = 0.5
    emoji = "😐"
    emotions = ["neutral"]
  }

  return {
    label,
    score,
    emoji,
    keywords: extractKeywords(text),
    emotions,
    confidence: 0.6,
  }
}

function extractKeywords(text: string): string[] {
  if (!text) return []

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)

  const stopWords = new Set([
    "this",
    "that",
    "with",
    "have",
    "will",
    "from",
    "they",
    "been",
    "were",
    "said",
    "each",
    "which",
    "their",
    "time",
    "would",
    "there",
    "could",
    "other",
    "than",
    "find",
    "more",
    "very",
    "what",
    "know",
    "just",
    "first",
    "also",
    "after",
    "back",
    "work",
    "way",
    "even",
    "new",
    "want",
    "because",
    "any",
    "these",
    "give",
    "day",
    "most",
    "us",
  ])

  const filteredWords = words.filter((word) => !stopWords.has(word) && /^[a-zA-Z]+$/.test(word))

  const wordCount: { [key: string]: number } = {}
  filteredWords.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word)
}
