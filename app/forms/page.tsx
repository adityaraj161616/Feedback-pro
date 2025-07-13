"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Share,
  BarChart3,
  Eye,
  EyeOff,
  Calendar,
  MessageSquare,
} from "lucide-react"

interface Form {
  id: string
  title: string
  description: string
  fields: any[]
  isActive: boolean
  createdAt: string
  responses: number
  lastResponse?: string
}

export default function FormsPage() {
  const { data: session } = useSession()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchForms()
    }
  }, [session])

  const fetchForms = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/forms?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()

        // Fetch response count for each form
        const formsWithCounts = await Promise.all(
          data.map(async (form: Form) => {
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
      toast.error("Failed to fetch forms")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateForm = async () => {
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.id,
          fields: [],
        }),
      })

      if (response.ok) {
        toast.success("Form created successfully")
        setIsCreateModalOpen(false)
        setFormData({ title: "", description: "", isActive: true })
        fetchForms()
      } else {
        toast.error("Failed to create form")
      }
    } catch (error) {
      console.error("Error creating form:", error)
      toast.error("Failed to create form")
    }
  }

  const handleEditForm = async () => {
    if (!selectedForm) return

    try {
      const response = await fetch(`/api/forms/${selectedForm.id}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Form updated successfully")
        setIsEditModalOpen(false)
        setSelectedForm(null)
        setFormData({ title: "", description: "", isActive: true })
        fetchForms()
      } else {
        toast.error("Failed to update form")
      }
    } catch (error) {
      console.error("Error updating form:", error)
      toast.error("Failed to update form")
    }
  }

  const handleDeleteForm = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Form deleted successfully")
        fetchForms()
      } else {
        toast.error("Failed to delete form")
      }
    } catch (error) {
      console.error("Error deleting form:", error)
      toast.error("Failed to delete form")
    }
  }

  const handleToggleActive = async (formId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/forms/${formId}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast.success(`Form ${isActive ? "activated" : "deactivated"} successfully`)
        fetchForms()
      } else {
        toast.error("Failed to update form status")
      }
    } catch (error) {
      console.error("Error toggling form status:", error)
      toast.error("Failed to update form status")
    }
  }

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/feedback/${formId}`
    navigator.clipboard.writeText(link)
    toast.success("Form link copied to clipboard")
  }

  const openEditModal = (form: Form) => {
    setSelectedForm(form)
    setFormData({
      title: form.title,
      description: form.description,
      isActive: form.isActive,
    })
    setIsEditModalOpen(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Forms</h1>
            <p className="text-muted-foreground">Manage your feedback forms</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Forms</h1>
          <p className="text-muted-foreground">Manage your feedback forms</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription>Create a new feedback form to collect responses from your users.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Form Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter form title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter form description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateForm}>Create Form</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {forms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
            <p className="text-muted-foreground mb-4">Create your first feedback form to start collecting responses.</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{form.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{form.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(form)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyFormLink(form.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/feedback/${form.id}`, "_blank")}>
                        <Share className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/analytics?formId=${form.id}`, "_blank")}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteForm(form.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      {form.responses} responses
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(form.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {form.isActive ? (
                        <Eye className="h-3 w-3 text-green-600" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={`text-xs ${form.isActive ? "text-green-600" : "text-gray-400"}`}>
                        {form.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => handleToggleActive(form.id, checked)}
                    size="sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Form Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Form</DialogTitle>
            <DialogDescription>Update your form details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Form Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter form title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter form description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditForm}>Update Form</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
