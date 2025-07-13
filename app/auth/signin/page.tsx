"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, ArrowLeft, Sparkles, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function SignIn() {
  const cardRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      try {
        const session = await getSession()
        if (session) {
          console.log("User already signed in, redirecting to dashboard")
          router.replace("/dashboard")
          return
        }
      } catch (error) {
        console.log("Error checking session:", error)
      }
    }

    checkSession()

    const tl = gsap.timeline()

    // Background animation
    tl.fromTo(
      backgroundRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
    )

    // Card entrance
    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 100, rotationX: -15 },
      { opacity: 1, y: 0, rotationX: 0, duration: 1, ease: "back.out(1.7)" },
      "-=0.5",
    )

    // Floating animation
    gsap.to(cardRef.current, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    })

    // Show error if present
    if (error) {
      let errorMessage = "Authentication failed. Please try again."

      switch (error) {
        case "OAuthSignin":
          errorMessage = "Error occurred during sign in. Please try again."
          break
        case "OAuthCallback":
          errorMessage = "Error occurred during callback. Please try again."
          break
        case "OAuthCreateAccount":
          errorMessage = "Could not create account. Please try again."
          break
        case "EmailCreateAccount":
          errorMessage = "Could not create account. Please try again."
          break
        case "Callback":
          errorMessage = "Error occurred during callback. Please try again."
          break
        case "OAuthAccountNotLinked":
          errorMessage = "Account not linked. Please sign in with the same provider you used before."
          break
        case "EmailSignin":
          errorMessage = "Check your email for the sign in link."
          break
        case "CredentialsSignin":
          errorMessage = "Sign in failed. Check your credentials."
          break
        case "SessionRequired":
          errorMessage = "Please sign in to access this page."
          break
        default:
          errorMessage = "An unexpected error occurred. Please try again."
      }

      toast.error(errorMessage)
    }
  }, [error, router])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      console.log("🚀 Starting Google sign in with callback URL:", callbackUrl)

      // Use NextAuth's signIn with redirect: true for proper handling
      await signIn("google", {
        callbackUrl: callbackUrl,
        redirect: true, // Let NextAuth handle the redirect
      })

      // The redirect will happen automatically, so we don't need additional logic here
    } catch (error) {
      console.error("❌ Sign in error:", error)
      toast.error("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div ref={backgroundRef} className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-8 left-8 text-white/70 hover:text-white transition-colors flex items-center space-x-2 z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </Link>

      {/* Sign In Card */}
      <Card ref={cardRef} className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome to FeedbackPro</CardTitle>
          <CardDescription className="text-gray-300">Sign in to access your feedback dashboard</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-red-300 text-sm">Authentication failed. Please try again.</span>
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <Chrome className="h-5 w-5" />
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-400">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-purple-400 hover:text-purple-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
              Privacy Policy
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
