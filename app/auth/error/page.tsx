"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Card entrance animation
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 100, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)" },
    )
  }, [])

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return {
          title: "Server Configuration Error",
          description: "There is a problem with the server configuration. Please contact support.",
        }
      case "AccessDenied":
        return {
          title: "Access Denied",
          description: "You do not have permission to sign in. Please contact an administrator.",
        }
      case "Verification":
        return {
          title: "Verification Error",
          description: "The verification token has expired or has already been used.",
        }
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
        return {
          title: "Authentication Error",
          description: "There was an error during the authentication process. Please try again.",
        }
      case "OAuthAccountNotLinked":
        return {
          title: "Account Not Linked",
          description:
            "This account is not linked to your profile. Please sign in with the same provider you used before.",
        }
      case "EmailSignin":
        return {
          title: "Email Sign In Error",
          description: "Unable to send sign in email. Please check your email address and try again.",
        }
      case "CredentialsSignin":
        return {
          title: "Invalid Credentials",
          description: "The credentials you provided are incorrect. Please check and try again.",
        }
      case "SessionRequired":
        return {
          title: "Session Required",
          description: "You must be signed in to access this page.",
        }
      default:
        return {
          title: "Authentication Error",
          description: "An unexpected error occurred during authentication. Please try again.",
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-8 left-8 text-white/70 hover:text-white transition-colors flex items-center space-x-2 z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </Link>

      {/* Error Card */}
      <Card ref={cardRef} className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-500 p-3 rounded-2xl">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">{errorInfo.title}</CardTitle>
          <CardDescription className="text-gray-300">{errorInfo.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">Error code: {error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/auth/signin">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent">
                Go Home
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-400">
            If this problem persists, please{" "}
            <Link href="/contact" className="text-purple-400 hover:text-purple-300">
              contact support
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
