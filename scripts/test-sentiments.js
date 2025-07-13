// Test script to verify sentiment analysis is working
import { analyzeSentimentWithAI } from "../lib/ai-sentiment.js"

async function testSentimentAnalysis() {
  console.log("Testing sentiment analysis...\n")

  // Test cases that match your submitted forms
  const testCases = [
    {
      name: "1 Star Rating",
      responses: {
        rating: "1",
        feedback: "This is terrible, worst experience ever",
      },
    },
    {
      name: "4 Star Rating",
      responses: {
        rating: "4",
        feedback: "Pretty good service, satisfied with the experience",
      },
    },
    {
      name: "5 Star Rating",
      responses: {
        rating: "5",
        feedback: "Excellent service! Amazing experience, love it!",
      },
    },
  ]

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`)
    console.log(`Input:`, testCase.responses)

    try {
      const result = await analyzeSentimentWithAI(testCase.responses)
      console.log(`Result:`, result)
      console.log(`Expected: ${testCase.name.includes("1") ? "Negative" : "Positive"}`)
      console.log("---\n")
    } catch (error) {
      console.error(`Error testing ${testCase.name}:`, error)
    }
  }
}

// Run the test
testSentimentAnalysis().catch(console.error)
