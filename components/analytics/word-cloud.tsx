"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag } from "lucide-react"
import type { AnalyticsData } from "@/lib/types"

interface WordCloudProps {
  analytics: AnalyticsData
}

export function WordCloud({ analytics }: WordCloudProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const { aiInsights } = analytics

  useEffect(() => {
    if (!aiInsights || !aiInsights.topKeywords || aiInsights.topKeywords.length === 0) {
      // Clear SVG if no data
      d3.select(svgRef.current).selectAll("*").remove()
      return
    }

    const words = aiInsights.topKeywords.map((keyword, index) => ({
      text: keyword,
      size: 20 + (aiInsights.topKeywords.length - index) * 5, // Larger for earlier keywords
      x: Math.random() * 400 + 50, // Random x position
      y: Math.random() * 200 + 50, // Random y position
    }))

    const width = 500
    const height = 300

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "transparent")

    // Clear previous content
    svg.selectAll("*").remove()

    // Create a simple word cloud layout
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    svg
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", (d) => `${d.size}px`)
      .style("font-family", "Arial, sans-serif")
      .style("font-weight", "bold")
      .style("fill", (d, i) => colorScale(i.toString()))
      .attr("text-anchor", "middle")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .text((d) => d.text)
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .style("opacity", 1)
      .attr("transform", (d) => `translate(0, 0)`)

    // Add hover effects
    svg
      .selectAll("text")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).style("opacity", 0.7).attr("transform", "scale(1.2)")
      })
      .on("mouseout", function (event, d) {
        d3.select(this).transition().duration(200).style("opacity", 1).attr("transform", "scale(1)")
      })
  }, [aiInsights])

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md border border-purple-700/30 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <Tag className="h-6 w-6 text-purple-400" /> Keyword Cloud
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[300px]">
        {aiInsights.topKeywords && aiInsights.topKeywords.length > 0 ? (
          <svg ref={svgRef} className="w-full h-full"></svg>
        ) : (
          <p className="text-gray-400">No keywords available yet. Submit more feedback!</p>
        )}
      </CardContent>
    </Card>
  )
}
