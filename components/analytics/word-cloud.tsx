"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import cloud from "d3-cloud"
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

    const words = aiInsights.topKeywords.map((keyword) => ({
      text: keyword,
      size: 10 + Math.random() * 50, // Random size for visual variety, can be based on frequency
    }))

    const width = 500
    const height = 300

    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(5)
      .rotate(() => ~~(Math.random() * 2) * 90)
      .font("Impact")
      .fontSize((d) => d.size!)
      .on("end", draw)

    layout.start()

    function draw(words: cloud.Word[]) {
      d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("background-color", "transparent")
        .selectAll("g")
        .remove() // Clear previous drawings

      d3.select(svgRef.current)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`)
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("font-family", "Impact")
        .style("fill", (d, i) => d3.schemeCategory10[i % 10]) // Use a D3 color scheme
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text((d) => d.text!)
        .transition() // Add transition for smooth appearance
        .duration(500)
        .style("opacity", 1)
        .attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
    }
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
