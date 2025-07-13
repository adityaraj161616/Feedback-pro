"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 100, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div ref={contentRef} className="relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl"></div>

          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/20">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Ready to Transform Your Feedback?
            </h2>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of companies already using FeedbackPro to collect, analyze, and act on customer feedback.
              Start your free trial today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="magnetic-btn bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="text-sm text-gray-400">No credit card required • 14-day free trial</div>
            </div>

            <div className="mt-8 flex justify-center space-x-8 text-sm text-gray-500">
              <div>✓ Setup in 5 minutes</div>
              <div>✓ Cancel anytime</div>
              <div>✓ 24/7 support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
