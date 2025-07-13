"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { DemoSection } from "@/components/demo-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin)
}

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Page load animation
    const tl = gsap.timeline()

    tl.set("body", { overflow: "hidden" })
      .from(".page-loader", {
        yPercent: -100,
        duration: 1.5,
        ease: "power4.inOut",
      })
      .set("body", { overflow: "auto" })
      .set(".page-loader", { display: "none" })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <>
      {/* Page Loader */}
      <div className="page-loader fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 z-50 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading Experience...</div>
      </div>

      <div
        ref={pageRef}
        className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-x-hidden"
      >
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <DemoSection />
        <CTASection />
        <Footer />
      </div>
    </>
  )
}
