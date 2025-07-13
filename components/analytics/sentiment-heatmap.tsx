"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"
import type { AnalyticsData } from "@/lib/types"

interface SentimentHeatmapProps {
  analytics: AnalyticsData
}

export function SentimentHeatmap({ analytics }: SentimentHeatmapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const { sentimentTrends } = analytics

  useEffect(() => {
    if (!sentimentTrends || sentimentTrends.length === 0) {
      d3.select(svgRef.current).selectAll("*").remove()
      return
    }

    const margin = { top: 50, right: 20, bottom: 70, left: 80 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "transparent")
      .selectAll("g")
      .remove() // Clear previous drawings
      .data([null]) // Bind data to ensure only one 'g' element
      .enter()
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Process data for heatmap
    const data = sentimentTrends.flatMap((dayData) =>
      Object.entries(dayData.hourlySentiment).map(([hour, sentiment]) => ({
        date: dayData.date,
        hour: Number.parseInt(hour),
        sentiment: sentiment as number, // Ensure sentiment is number
      })),
    )

    // Group data by date and hour to get average sentiment for each cell
    const groupedData = Array.from(
      d3.group(
        data,
        (d) => d.date,
        (d) => d.hour,
      ),
      ([date, hoursMap]) => ({
        date,
        hours: Array.from(hoursMap, ([hour, sentimentData]) => ({
          hour,
          avgSentiment: d3.mean(sentimentData, (d) => d.sentiment) || 0.5, // Default to neutral if no data
        })),
      }),
    )

    const dates = groupedData.map((d) => d.date).sort()
    const hours = Array.from({ length: 24 }, (_, i) => i) // 0 to 23

    // X scale for hours
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(hours.map(String)) // Convert hours to string for domain
      .padding(0.05)

    // Y scale for dates
    const y = d3.scaleBand().range([height, 0]).domain(dates).padding(0.05)

    // Color scale for sentiment
    const colorScale = d3
      .scaleLinear<string>()
      .range(["#dc3545", "#ffc107", "#28a745"]) // Red (negative), Yellow (neutral), Green (positive)
      .domain([0, 0.5, 1]) // Sentiment scores

    // Add X axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => `${d}:00`))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("fill", "#ccc")

    // Add Y axis
    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y)).selectAll("text").style("fill", "#ccc")

    // Add the squares
    svg
      .selectAll(".heatmap-rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "heatmap-rect")
      .attr("x", (d) => x(String(d.hour))!)
      .attr("y", (d) => y(d.date)!)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", (d) => colorScale(d.sentiment))
      .style("stroke", "#333")
      .style("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        d3.select(this).style("stroke", "#fff").style("stroke-width", 2)
        tooltip
          .style("opacity", 1)
          .html(
            `Date: ${d.date}<br>Hour: ${d.hour}:00<br>Sentiment: ${(d.sentiment * 100).toFixed(0)}% ${
              d.sentiment > 0.7 ? "😊" : d.sentiment < 0.3 ? "😢" : "😐"
            }`,
          )
      })
      .on("mousemove", (event) => {
        tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 20 + "px")
      })
      .on("mouseleave", function () {
        d3.select(this).style("stroke", "#333").style("stroke-width", 0.5)
        tooltip.style("opacity", 0)
      })

    // Add tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "#333")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("opacity", 0)
      .style("pointer-events", "none")
      .style("font-size", "12px")
  }, [sentimentTrends])

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md border border-purple-700/30 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <Flame className="h-6 w-6 text-purple-400" /> Sentiment Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {sentimentTrends && sentimentTrends.length > 0 ? (
          <svg ref={svgRef} className="w-full h-[400px]"></svg>
        ) : (
          <p className="text-gray-400 h-[400px] flex items-center justify-center">
            No sentiment trend data available yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
