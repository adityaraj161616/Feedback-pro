"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Hash, TrendingUp } from "lucide-react"

interface WordCloudProps {
  keywords: string[]
}

export function WordCloud({ keywords }: WordCloudProps) {
  if (!keywords || keywords.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-400" />
            Word Cloud
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No keywords available yet. More feedback needed for word cloud analysis.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate word frequencies and sizes
  const wordFrequency: { [key: string]: number } = {}
  keywords.forEach((keyword) => {
    wordFrequency[keyword] = (wordFrequency[keyword] || 0) + 1
  })

  const sortedWords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)

  const maxFreq = Math.max(...Object.values(wordFrequency))

  const getWordSize = (frequency: number) => {
    const ratio = frequency / maxFreq
    if (ratio > 0.8) return "text-3xl"
    if (ratio > 0.6) return "text-2xl"
    if (ratio > 0.4) return "text-xl"
    if (ratio > 0.2) return "text-lg"
    return "text-base"
  }

  const getWordColor = (frequency: number) => {
    const ratio = frequency / maxFreq
    if (ratio > 0.8) return "text-blue-300"
    if (ratio > 0.6) return "text-purple-300"
    if (ratio > 0.4) return "text-green-300"
    if (ratio > 0.2) return "text-yellow-300"
    return "text-gray-300"
  }

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Hash className="h-5 w-5 text-blue-400" />
          Word Cloud
          <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-300">
            {sortedWords.length} keywords
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 justify-center items-center min-h-[200px] p-4">
          {sortedWords.map(([word, frequency], index) => (
            <div
              key={word}
              className={`
                ${getWordSize(frequency)} 
                ${getWordColor(frequency)} 
                font-semibold 
                hover:scale-110 
                transition-transform 
                cursor-pointer
                px-2 py-1 
                rounded-lg 
                bg-white/5 
                border 
                border-white/10
                hover:bg-white/10
              `}
              style={{
                transform: `rotate(${((index % 3) - 1) * 5}deg)`,
              }}
              title={`Appears ${frequency} time${frequency > 1 ? "s" : ""}`}
            >
              {word}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <TrendingUp className="h-4 w-4" />
            <span>Word size indicates frequency in feedback</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
