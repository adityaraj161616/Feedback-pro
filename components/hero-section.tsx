"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { TextPlugin } from "gsap/TextPlugin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Play, ArrowRight, Star, Users, Zap, CheckCircle, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin)
}

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subheadRef = useRef<HTMLParagraphElement>(null)
  const videoMaskRef = useRef<HTMLDivElement>(null)
  const ctaButtonsRef = useRef<HTMLDivElement>(null)
  const [isDemoSubmitted, setIsDemoSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [email, setEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.5 })

    // Video mask reveal
    tl.fromTo(
      videoMaskRef.current,
      { clipPath: "circle(0% at 50% 50%)" },
      { clipPath: "circle(100% at 50% 50%)", duration: 2, ease: "power3.out" },
    )

      // SplitText animation for headline
      .fromTo(headlineRef.current, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=1")

      // Typewriter → Glitch → Settle for subhead
      .set(subheadRef.current, { text: "" })
      .to(subheadRef.current, {
        text: "Real-time. Secure. Smart.",
        duration: 2,
        ease: "none",
      })
      .to(subheadRef.current, {
        skewX: 20,
        duration: 0.1,
        yoyo: true,
        repeat: 3,
        ease: "power2.inOut",
      })
      .to(subheadRef.current, {
        skewX: 0,
        clearProps: "all",
        duration: 0.3,
      })

      // CTA buttons entrance
      .fromTo(
        ctaButtonsRef.current?.children,
        { opacity: 0, y: 50, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.2, ease: "back.out(1.7)" },
      )

    // Setup magnetic buttons
    const magneticButtons = document.querySelectorAll(".magnetic-btn")
    magneticButtons.forEach((btn) => {
      const button = btn as HTMLElement

      button.addEventListener("mousemove", (e) => {
        const rect = button.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2

        gsap.to(button, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: "power2.out",
        })
      })

      button.addEventListener("mouseleave", () => {
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        })
      })
    })

    return () => {
      tl.kill()
    }
  }, [])

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rating) {
      toast.error("Please select a rating")
      return
    }

    if (!feedback.trim()) {
      toast.error("Please enter your feedback")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/demo-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          feedback,
          email: email || "anonymous",
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setIsDemoSubmitted(true)
        toast.success("Thank you for your feedback!")
        gsap.fromTo(
          ".demo-success-message",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        )

        // Reset form after 3 seconds
        setTimeout(() => {
          setIsDemoSubmitted(false)
          setRating(0)
          setFeedback("")
          setEmail("")
        }, 3000)
      } else {
        toast.error("Failed to submit feedback. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting demo feedback:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToDemoSection = () => {
    const demoSection = document.getElementById("demo")
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleAuthRedirect = () => {
    router.push("/auth/signin")
  }

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image with Mask */}
      <div
        ref={videoMaskRef}
        className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-blue-700/30"
        style={{ clipPath: "circle(0% at 50% 50%)" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://plus.unsplash.com/premium_photo-1683134474181-8b88c82b6aa8?q=80&w=1177&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-blue-800/40 to-blue-700/50" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-blue-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <h1
              ref={headlineRef}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent leading-tight"
            >
              Collect Feedback,
              <br />
              Understand Better.
            </h1>

            <p ref={subheadRef} className="text-xl md:text-2xl text-blue-100 mb-8 font-medium">
              {/* Text will be animated in via GSAP */}
            </p>

            <div className="mb-8">
              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-blue-200">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>10k+ Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span>Real-time</span>
                </div>
              </div>
            </div>

            <div ref={ctaButtonsRef} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="magnetic-btn bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl"
                onClick={handleAuthRedirect}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="magnetic-btn border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm bg-transparent"
                onClick={scrollToDemoSection}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Column - Interactive Feedback Form */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-blue-200 ml-4">Try our feedback form</span>
                </div>

                {isDemoSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12 demo-success-message">
                    <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                    <p className="text-gray-300 text-center">Your feedback helps us improve FeedbackPro.</p>
                  </div>
                ) : (
                  <form onSubmit={handleDemoSubmit} className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">How would you rate FeedbackPro?</h3>

                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-8 w-8 cursor-pointer transition-all duration-200 ${
                            star <= rating
                              ? "text-yellow-400 fill-current scale-110"
                              : "text-gray-600 hover:text-yellow-400 hover:scale-105"
                          }`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us what you think about our platform..."
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 resize-none"
                        rows={3}
                        required
                      />

                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email (optional)"
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
                Live Demo
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
