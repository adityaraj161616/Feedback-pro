"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, TrendingUp, MessageSquare, Star, Users, Clock } from "lucide-react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function DemoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const demoRef = useRef<HTMLDivElement>(null)

  const demoSteps = [
    {
      title: "Create Form",
      description: "Design beautiful feedback forms in minutes",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Collect Responses",
      description: "Real-time feedback collection from users",
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Analyze Data",
      description: "AI-powered insights and sentiment analysis",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Take Action",
      description: "Make data-driven decisions with confidence",
      icon: Star,
      color: "from-yellow-500 to-orange-500",
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % demoSteps.length)
      }, 2000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, demoSteps.length])

  const toggleDemo = () => {
    setIsPlaying(!isPlaying)
  }

  const resetDemo = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  return (
    <section ref={sectionRef} id="demo" className="py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            See It In Action
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Watch how easy it is to create, deploy, and analyze feedback with our platform.
          </p>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={toggleDemo}
              className="magnetic-btn bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isPlaying ? "Pause Demo" : "Start Demo"}
            </Button>

            <Button
              onClick={resetDemo}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Demo Steps */}
          <div className="space-y-6">
            {demoSteps.map((step, index) => (
              <Card
                key={index}
                className={`transition-all duration-500 ${
                  index === currentStep
                    ? "bg-gradient-to-r from-white/20 to-white/10 border-purple-400 scale-105"
                    : "bg-white/5 border-white/10"
                } backdrop-blur-md border`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${step.color}`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                        {index === currentStep && (
                          <Badge className="bg-green-500 text-white animate-pulse">Active</Badge>
                        )}
                      </div>
                      <p className="text-gray-400 mt-1">{step.description}</p>
                    </div>

                    <div className="text-2xl font-bold text-gray-600">{index + 1}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Interactive Demo Preview */}
          <div ref={demoRef} className="relative">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Browser Chrome */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="flex-1 bg-white/10 rounded-lg px-4 py-2 ml-4">
                  <span className="text-sm text-gray-400">feedbackpro.app/dashboard</span>
                </div>
              </div>

              {/* Demo Content */}
              <div className="space-y-6">
                {currentStep === 0 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xl font-semibold text-white">Form Builder</h3>
                    <div className="space-y-3">
                      <div className="h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full w-3/4"></div>
                      <div className="h-4 bg-white/20 rounded-full w-1/2"></div>
                      <div className="h-8 bg-white/10 rounded-lg"></div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xl font-semibold text-white">Live Responses</h3>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-300">New feedback received</span>
                          <Clock className="h-4 w-4 text-gray-400 ml-auto" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xl font-semibold text-white">Analytics Dashboard</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">94%</div>
                        <div className="text-sm text-gray-400">Positive</div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">1.2k</div>
                        <div className="text-sm text-gray-400">Responses</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xl font-semibold text-white">Action Items</h3>
                    <div className="space-y-3">
                      {["Improve checkout flow", "Add mobile app", "Update pricing"].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg"
                        >
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-white">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Floating indicators */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-bounce">
              Live Demo
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
