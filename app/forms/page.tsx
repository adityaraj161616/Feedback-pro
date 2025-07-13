"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Plus, MoreVertical, Edit, Trash2, Copy, Eye, BarChart3, Calendar, Users } from "lucide-react"
import Link from "next/link"

interface Form {
  id: string
  title: string
  description: string
  isActive: boolean
  createdAt: string
  responses: number
  fields: any[]
}

export default function FormsPage() {
  const { data: session } = useSession()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchForms()
    }
  }, [session])

  const fetchForms = async () => {
    try {
      const response = await fetch(`/api/forms?userId=${session?.user?.id}`)
      if (response.ok) {
        const formsData = await response.json()

        // Fetch response count for each form
        const formsWithCounts = await Promise.all(
          formsData.map(async (form: Form) => {
            try {
              const countResponse = await fetch(`/api/feedback/count?formId=${form.id}`)
              if (countResponse.ok) {
                const countData = await countResponse.json()
                return {
                  ...form,
                  responses: countData.count || 0,
                }
              }
              return { ...form, responses: 0 }
            } catch (error) {
              console.error(`Error fetching count for form ${form.id}:`, error)
              return { ...form, responses: 0 }
            }
          }),
        )

        setForms(formsWithCounts)
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      toast.error("Failed to load forms")
    } finally {
      setLoading(false)
    }
  }

  const toggleFormStatus = async (formId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/forms/${formId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setForms(forms.map((form) => (form.id === formId ? { ...form, isActive } : form)))
        toast.success(`Form ${isActive ? "activated" : "deactivated"}`)
      } else {
        toast.error("Failed to update form status")
      }
    } catch (error) {
      console.error("Error toggling form status:", error)
      toast.error("Failed to update form status")
    }
  }

  const deleteForm = async (formId: string) => {
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
      toast.error("Failed to delete form")
    }
  }

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/feedback/${formId}`
    navigator.clipboard.writeText(link)
    toast.success("Form link copied to clipboard")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Forms</h1>
            <p className="text-muted-foreground">Manage your feedback forms</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Forms</h1>
          <p className="text-muted-foreground">Manage your feedback forms</p>
        </div>
        <Link href="/form-builder">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Form
          </Button>
        </Link>
      </div>

      {forms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
            <p className="text-muted-foreground mb-4">Create your first feedback form to start collecting responses</p>
            <Link href="/form-builder">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Form
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{form.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {form.description || "No description"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => copyFormLink(form.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/feedback/${form.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/analytics?formId=${form.id}`}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/form-builder?edit=${form.id}`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Form</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{form.title}"? This action cannot be undone and all
                              responses will be lost.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteForm(form.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{form.responses} responses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={form.isActive} onCheckedChange={(checked) => toggleFormStatus(form.id, checked)} />
                    <span className="text-sm">{form.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <Badge variant={form.isActive ? "default" : "secondary"}>
                    {form.isActive ? "Collecting" : "Paused"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
