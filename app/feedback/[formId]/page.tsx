"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { gsap } from "gsap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Star, Send, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface FormData {
  id: string
  title: string
  description: string
  fields: any[]
  settings: any
  userId: string
}

export default function FeedbackForm() {
  const params = useParams()
  const formId = params.formId as string
  const [formData, setFormData] = useState<FormData | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchForm()
  }, [formId])

  useEffect(() => {
    if (formData && !loading) {
      // Form entrance animation
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)" },
      )

      // Stagger field animations
      gsap.fromTo(
        ".form-field",
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.3 },
      )
    }
  }, [formData, loading])

  const fetchForm = async () => {
    try {
      console.log("Frontend: Fetching form with ID:", formId)
      const response = await fetch(`/api/forms/${formId}`)

      if (response.ok) {
        const data = await response.json()
        console.log("Frontend: Fetched form data:", data)

        // Validate that we have the required fields
        if (!data.userId) {
          console.error("Frontend: Form data missing userId:", data)
          setError("Form configuration error: missing owner information")
          setFormData(null)
        } else {
          setFormData(data)
          setError(null)
        }
      } else {
        const errorData = await response.json()
        console.error("Frontend: Form fetch failed:", response.status, errorData)
        setError("Form not found or is not active")
        setFormData(null)
      }
    } catch (error) {
      console.error("Frontend: Error fetching form:", error)
      setError("Failed to load form")
      setFormData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate required fields
    const requiredFields = formData?.fields.filter((field) => field.required) || []
    const missingFields = requiredFields.filter((field) => !responses[field.id])

    if (missingFields.length > 0) {
      alert("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    // Check if we have the form owner's userId
    if (!formData?.userId) {
      console.error("Frontend: Form data:", formData)
      alert("Form owner information is missing. Cannot submit feedback.")
      setIsSubmitting(false)
      return
    }

    try {
      console.log("Frontend: Submitting feedback with userId:", formData.userId)

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          responses,
          userId: formData.userId,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Frontend: Feedback submitted successfully:", result)
        setIsSubmitted(true)

        // Success animation
        gsap.to(formRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            gsap.fromTo(
              successRef.current,
              { opacity: 0, scale: 0.8, y: 50 },
              { opacity: 1, scale: 1, y: 0, duration: 1, ease: "back.out(1.7)" },
            )
          },
        })
      } else {
        const errorData = await response.json()
        console.error("Frontend: Feedback submission error:", errorData)
        alert(`Error submitting feedback: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Frontend: Error submitting feedback:", error)
      alert("Error submitting feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: any) => {
    const value = responses[field.id] || ""

    switch (field.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || "Enter your response..."}
            className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            required={field.required}
          />
        )

      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || "Enter your detailed response..."}
            className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            rows={4}
            required={field.required}
          />
        )

      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 cursor-pointer transition-all duration-200 ${
                  star <= (value || 0)
                    ? "text-yellow-400 fill-current scale-110"
                    : "text-gray-600 hover:text-yellow-400 hover:scale-105"
                }`}
                onClick={() => handleFieldChange(field.id, star)}
              />
            ))}
            {value > 0 && <span className="ml-3 text-gray-300 self-center">({value}/5)</span>}
          </div>
        )

      case "emoji":
        const emojis = [
          { emoji: "😢", label: "Very Dissatisfied" },
          { emoji: "😐", label: "Dissatisfied" },
          { emoji: "😊", label: "Neutral" },
          { emoji: "😍", label: "Satisfied" },
          { emoji: "🤩", label: "Very Satisfied" },
        ]
        return (
          <div className="flex space-x-3">
            {emojis.map((item, index) => (
              <button
                key={index}
                type="button"
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                  value === index ? "bg-purple-500/30 scale-110 shadow-lg" : "hover:bg-white/10 hover:scale-105"
                }`}
                onClick={() => handleFieldChange(field.id, index)}
              >
                <span className="text-3xl mb-1">{item.emoji}</span>
                <span className="text-xs text-gray-400">{item.label}</span>
              </button>
            ))}
          </div>
        )

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            required={field.required}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option: string, index: number) => (
              <option key={index} value={option} className="bg-gray-800">
                {option}
              </option>
            ))}
          </select>
        )

      case "file":
        return (
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
            <input
              type="file"
              onChange={(e) => handleFieldChange(field.id, e.target.files?.[0])}
              className="hidden"
              id={`file-${field.id}`}
              accept={field.settings?.allowedTypes || "image/*,.pdf"}
            />
            <label htmlFor={`file-${field.id}`} className="cursor-pointer">
              <div className="text-gray-400 mb-2">Click to upload or drag and drop</div>
              <div className="text-sm text-gray-500">
                {field.settings?.allowedTypes || "PNG, JPG, PDF"} up to {field.settings?.maxSize || 10}MB
              </div>
              {value && <div className="text-green-400 mt-2">File selected: {value.name}</div>}
            </label>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading form...</div>
      </div>
    )
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-8 text-center">
          <CardContent>
            <h1 className="text-2xl font-bold text-white mb-4">{error ? "Error Loading Form" : "Form Not Found"}</h1>
            <p className="text-gray-300 mb-6">
              {error || "The feedback form you're looking for doesn't exist or has been removed."}
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {!isSubmitted ? (
          <Card
            ref={formRef}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl"
          >
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white mb-2">{formData.title}</CardTitle>
              {formData.description && <p className="text-gray-300 text-lg">{formData.description}</p>}
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {formData.fields.map((field, index) => (
                  <div key={field.id} className="form-field space-y-3">
                    <div className="flex items-center space-x-2">
                      <Label className="text-gray-200 font-medium text-lg">{field.label}</Label>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    {field.settings?.helpText && <p className="text-sm text-gray-400">{field.settings.helpText}</p>}
                    {renderField(field)}
                  </div>
                ))}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {formData.settings?.submitMessage || "Submit Feedback"}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card
            ref={successRef}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-400/30 shadow-2xl text-center"
          >
            <CardContent className="p-12">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">Thank You!</h1>
                <p className="text-gray-300 text-lg">
                  {formData.settings?.submitMessage || "Your feedback has been submitted successfully."}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-400">We appreciate you taking the time to share your thoughts with us.</p>

                {formData.settings?.redirectUrl ? (
                  <Button
                    onClick={() => (window.location.href = formData.settings.redirectUrl)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    Continue
                  </Button>
                ) : (
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
