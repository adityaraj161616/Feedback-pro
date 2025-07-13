"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Edit, Share2, Trash2, Eye, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Form {
  _id: string
  id: string
  title: string
  description: string
  fields: any[]
  responses: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function FormsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pageRef = useRef<HTMLDivElement>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/forms")
      return
    }

    if (status === "authenticated") {
      fetchForms()

      // Page entrance animation
      gsap.fromTo(
        ".forms-content",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 },
      )
    }
  }, [status, router])

  const fetchForms = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/forms")
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      } else {
        toast.error("Failed to fetch forms")
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      toast.error("Error loading forms")
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setForms(forms.filter((form) => form.id !== formId))
        toast.success("Form deleted successfully")
      } else {
        toast.error("Failed to delete form")
      }
    } catch (error) {
      console.error("Error deleting form:", error)
      toast.error("Error deleting form")
    }
  }

  const toggleFormStatus = async (formId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/forms/${formId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        setForms(forms.map((form) => (form.id === formId ? { ...form, isActive: !isActive } : form)))
        toast.success(`Form ${!isActive ? "activated" : "deactivated"}`)
      } else {
        toast.error("Failed to update form status")
      }
    } catch (error) {
      console.error("Error updating form:", error)
      toast.error("Error updating form")
    }
  }

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/feedback/${formId}`
    navigator.clipboard.writeText(link)
    toast.success("Form link copied to clipboard!")
  }

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading forms...</div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Redirecting to sign in...</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <DashboardHeader user={session.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="forms-content">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Forms</h1>
              <p className="text-gray-400">Manage and track your feedback forms</p>
            </div>
            <Link href="/form-builder">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Create New Form
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Forms Grid */}
          {filteredForms.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 text-lg mb-4">
                  {forms.length === 0 ? "No forms created yet" : "No forms match your search"}
                </div>
                {forms.length === 0 && (
                  <Link href="/form-builder">
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Form
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <Card
                  key={form.id}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 group"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2 line-clamp-2">{form.title}</CardTitle>
                        <CardDescription className="text-gray-400 line-clamp-2">{form.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem
                            onClick={() => router.push(`/form-builder?id=${form.id}`)}
                            className="text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => copyFormLink(form.id)}
                            className="text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(`/feedback/${form.id}`, "_blank")}
                            className="text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/forms/${form.id}/analytics`)}
                            className="text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleFormStatus(form.id, form.isActive)}
                            className="text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            {form.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteForm(form.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <Badge className={form.isActive ? "bg-green-500" : "bg-gray-500"}>
                          {form.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-sm text-gray-400">{form.fields.length} fields</span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{form.responses}</div>
                          <div className="text-xs text-gray-400">Responses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {new Date(form.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">Created</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/form-builder?id=${form.id}`)}
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => copyFormLink(form.id)}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
