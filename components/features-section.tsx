"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Shield, BarChart3, Smartphone, Globe, Brain, Clock, Users, Lock } from "lucide-react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const features = [
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Get instant notifications when feedback is submitted. See responses as they happen.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption, GDPR compliant, and secure data handling for peace of mind.",
    color: "from-green-400 to-emerald-500",
  },
  {
    icon: Brain,
    title: "AI Sentiment Analysis",
    description: "Automatically detect emotions and sentiment in feedback using advanced AI.",
    color: "from-purple-400 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Beautiful dashboards with insights, trends, and actionable data visualization.",
    color: "from-blue-400 to-cyan-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Perfect experience on any device with responsive design and touch interactions.",
    color: "from-indigo-400 to-purple-500",
  },
  {
    icon: Globe,
    title: "Global Deployment",
    description: "CDN-powered forms that load instantly anywhere in the world.",
    color: "from-teal-400 to-blue-500",
  },
  {
    icon: Clock,
    title: "Form Scheduling",
    description: "Set start and end dates for your feedback campaigns with precision timing.",
    color: "from-orange-400 to-red-500",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite team members, assign roles, and collaborate on feedback analysis.",
    color: "from-pink-400 to-rose-500",
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description: "Your data stays yours. No tracking, no selling, just secure feedback collection.",
    color: "from-gray-400 to-slate-500",
  },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      )

      // Cards stagger animation
      gsap.fromTo(
        cardsRef.current?.children,
        { opacity: 0, y: 100, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      )

      // Hover animations for cards
      const cards = cardsRef.current?.children
      if (cards) {
        Array.from(cards).forEach((card) => {
          const cardElement = card as HTMLElement

          cardElement.addEventListener("mouseenter", () => {
            gsap.to(cardElement, {
              y: -10,
              scale: 1.05,
              duration: 0.3,
              ease: "power2.out",
            })
          })

          cardElement.addEventListener("mouseleave", () => {
            gsap.to(cardElement, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            })
          })
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="features" className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent"
          >
            Powerful Features
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to collect, analyze, and act on feedback. Built for modern teams who demand excellence.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group"
            >
              <CardContent className="p-8">
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${feature.color} mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
