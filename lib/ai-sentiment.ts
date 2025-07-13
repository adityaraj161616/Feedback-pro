import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Function to analyze sentiment using Gemini API
export async function analyzeSentiment(text: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Skipping AI sentiment analysis.")
    return { label: "Neutral", score: 0.5, emoji: "😐", keywords: [], emotions: [] }
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Analyze the sentiment, extract keywords, and identify emotions from the following text. Provide the output as a JSON object with 'label' (Positive, Negative, Neutral), 'score' (0-1), 'emoji' (😊, 😢, 😐), 'keywords' (array of strings), and 'emotions' (array of strings like 'joy', 'sadness', 'anger', 'surprise', 'fear', 'disgust').

Text: "${text}"

JSON Output:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const textResponse = response.text()

    // Attempt to parse the JSON response
    let parsedResult: any
    try {
      // Gemini might return markdown code block, so extract JSON
      const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch && jsonMatch[1]) {
        parsedResult = JSON.parse(jsonMatch[1])
      } else {
        parsedResult = JSON.parse(textResponse)
      }
    } catch (parseError) {
      console.error("Failed to parse AI sentiment response:", parseError)
      console.error("Raw AI response:", textResponse)
      // Fallback to a default neutral sentiment if parsing fails
      return { label: "Neutral", score: 0.5, emoji: "😐", keywords: [], emotions: [] }
    }

    // Ensure the structure matches the expected output
    const sentiment = {
      label: parsedResult.label || "Neutral",
      score: typeof parsedResult.score === "number" ? parsedResult.score : 0.5,
      emoji: parsedResult.emoji || "😐",
      keywords: Array.isArray(parsedResult.keywords) ? parsedResult.keywords : [],
      emotions: Array.isArray(parsedResult.emotions) ? parsedResult.emotions : [],
    }

    return sentiment
  } catch (error) {
    console.error("Error analyzing sentiment with Gemini API:", error)
    // Return a default neutral sentiment on API error
    return { label: "Neutral", score: 0.5, emoji: "😐", keywords: [], emotions: [] }
  }
}

// Function to analyze sentiment for multiple responses (e.g., from a form)
export async function analyzeSentimentWithAI(responses: Record<string, any>) {
  const combinedText = Object.values(responses)
    .filter((value) => typeof value === "string" && value.length > 0)
    .join(". ")

  if (!combinedText) {
    return { label: "Neutral", score: 0.5, emoji: "😐", keywords: [], emotions: [] }
  }

  return analyzeSentiment(combinedText)
}
