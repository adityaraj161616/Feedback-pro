"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link" // Import Link for navigation
import { useRouter } from "next/navigation" // Import useRouter for programmatic navigation

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null) // Changed to HTMLDivElement for consistency with ref usage
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const router = useRouter() // Initialize useRouter

  useEffect(() => {
    // Navbar entrance animation
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 2, ease: "power3.out" },
    )
  }, [])

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power3.out" },
      )
    } else {
      gsap.to(mobileMenuRef.current, { x: "100%", opacity: 0, duration: 0.3, ease: "power3.in" })
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)

    // Hamburger animation
    if (!isOpen) {
      gsap.to(hamburgerRef.current, { rotation: 180, duration: 0.3 })
    } else {
      gsap.to(hamburgerRef.current, { rotation: 0, duration: 0.3 })
    }
  }

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
      setIsOpen(false) // Close mobile menu after clicking a link
    }
  }

  const handleAuthRedirect = () => {
    router.push("/auth/signin")
    setIsOpen(false) // Close mobile menu
  }

  return (
    <>
      <nav ref={navRef} className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                FeedbackPro
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("demo")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Demo
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </button>
              <Button
                variant="outline"
                className="magnetic-btn border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black bg-transparent"
                onClick={handleAuthRedirect}
              >
                Sign In
              </Button>
              <Button
                className="magnetic-btn bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                onClick={handleAuthRedirect}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              ref={hamburgerRef}
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        ref={mobileMenuRef}
        className="fixed inset-y-0 right-0 w-full max-w-sm bg-black/95 backdrop-blur-md z-50 md:hidden transform translate-x-full"
      >
        <div className="flex flex-col h-full pt-20 px-6">
          <div className="space-y-6">
            <button
              onClick={() => scrollToSection("features")}
              className="block text-xl text-gray-300 hover:text-white"
            >
              Features
            </button>
            <button onClick={() => scrollToSection("demo")} className="block text-xl text-gray-300 hover:text-white">
              Demo
            </button>
            <button onClick={() => scrollToSection("pricing")} className="block text-xl text-gray-300 hover:text-white">
              Pricing
            </button>
          </div>
          <div className="mt-8 space-y-4">
            <Button
              variant="outline"
              className="w-full border-purple-400 text-purple-400 bg-transparent"
              onClick={handleAuthRedirect}
            >
              Sign In
            </Button>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500" onClick={handleAuthRedirect}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
