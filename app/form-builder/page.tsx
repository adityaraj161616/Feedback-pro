"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { gsap } from "gsap"
import { Draggable } from "gsap/Draggable"
import { FormBuilderHeader } from "@/components/form-builder/form-builder-header"
import { FieldPalette } from "@/components/form-builder/field-palette"
import { FormCanvas } from "@/components/form-builder/form-canvas"
import { FormPreview } from "@/components/form-builder/form-preview"
import { FormSettings } from "@/components/form-builder/form-settings"
import { toast } from "sonner"

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable)
}

export interface FormField {
  id: string
  type: "text" | "textarea" | "rating" | "emoji" | "select" | "file"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  settings?: Record<string, any>
}

export interface FormConfig {
  id: string
  title: string
  description: string
  fields: FormField[]
  settings: {
    theme: string
    submitMessage: string
    redirectUrl?: string
    collectEmail: boolean
    allowAnonymous: boolean
  }
}

export default function FormBuilder() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editFormId = searchParams.get("id")
  const builderRef = useRef<HTMLDivElement>(null)
  const [formConfig, setFormConfig] = useState<FormConfig>({
    id: "",
    title: "New Feedback Form",
    description: "We'd love to hear your thoughts!",
    fields: [],
    settings: {
      theme: "modern",
      submitMessage: "Thank you for your feedback!",
      collectEmail: false,
      allowAnonymous: true,
    },
  })
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/form-builder")
      return
    }

    if (status === "authenticated") {
      // If editing existing form, load it
      if (editFormId) {
        loadExistingForm(editFormId)
      }

      // Form builder entrance animation
      const tl = gsap.timeline()
      tl.fromTo(".builder-header", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
        .fromTo(
          ".builder-sidebar",
          { opacity: 0, x: -100 },
          { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
          "-=0.4",
        )
        .fromTo(
          ".builder-canvas",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" },
          "-=0.4",
        )
    }
  }, [status, router, editFormId])

  const loadExistingForm = async (formId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/forms/${formId}/edit`)
      if (response.ok) {
        const existingForm = await response.json()
        setFormConfig(existingForm)
        toast.success("Form loaded successfully")
      } else {
        toast.error("Failed to load form")
        router.push("/form-builder")
      }
    } catch (error) {
      console.error("Error loading form:", error)
      toast.error("Error loading form")
      router.push("/form-builder")
    } finally {
      setLoading(false)
    }
  }

  const addField = (fieldType: FormField["type"]) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType} field`,
      required: false,
      placeholder: fieldType === "text" ? "Enter your response..." : undefined,
      options: fieldType === "select" ? ["Option 1", "Option 2"] : undefined,
    }

    setFormConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }))

    // Animate new field
    setTimeout(() => {
      gsap.fromTo(
        `[data-field-id="${newField.id}"]`,
        { opacity: 0, scale: 0.8, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" },
      )
    }, 100)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
    }))
  }

  const deleteField = (fieldId: string) => {
    // Animate field removal
    gsap.to(`[data-field-id="${fieldId}"]`, {
      opacity: 0,
      scale: 0.8,
      x: 100,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setFormConfig((prev) => ({
          ...prev,
          fields: prev.fields.filter((field) => field.id !== fieldId),
        }))
      },
    })
  }

  const reorderFields = (startIndex: number, endIndex: number) => {
    const newFields = [...formConfig.fields]
    const [removed] = newFields.splice(startIndex, 1)
    newFields.splice(endIndex, 0, removed)

    setFormConfig((prev) => ({
      ...prev,
      fields: newFields,
    }))
  }

  const updateFormConfig = (updates: Partial<FormConfig>) => {
    setFormConfig((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  const saveForm = async () => {
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formConfig),
      })

      if (response.ok) {
        const result = await response.json()
        setFormConfig((prev) => ({
          ...prev,
          id: result.formId,
        }))

        // Success animation
        gsap.to(".save-button", {
          scale: 1.1,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        })

        toast.success(result.message)
      } else {
        const errorData = await response.json()
        toast.error(`Failed to save form: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error saving form:", error)
      toast.error("An unexpected error occurred while saving the form.")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading form builder...</div>
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

  if (status === "authenticated" && session) {
    return (
      <div ref={builderRef} className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        {/* Header */}
        <div className="builder-header">
          <FormBuilderHeader
            formConfig={formConfig}
            onSave={saveForm}
            onPreview={() => setPreviewMode(!previewMode)}
            previewMode={previewMode}
            onUpdateFormConfig={updateFormConfig}
          />
        </div>

        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar - Field Palette */}
          {!previewMode && (
            <div className="builder-sidebar w-80 bg-black/50 backdrop-blur-md border-r border-white/10 overflow-y-auto">
              <FieldPalette onAddField={addField} />
              {selectedField && (
                <FormSettings
                  field={formConfig.fields.find((f) => f.id === selectedField)}
                  onUpdateField={updateField}
                  onClose={() => setSelectedField(null)}
                />
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Form Canvas */}
            {!previewMode && (
              <div className="builder-canvas flex-1 p-8 overflow-y-auto">
                <FormCanvas
                  formConfig={formConfig}
                  selectedField={selectedField}
                  onSelectField={setSelectedField}
                  onUpdateField={updateField}
                  onDeleteField={deleteField}
                  onReorderFields={reorderFields}
                  onUpdateFormConfig={updateFormConfig}
                />
              </div>
            )}

            {/* Preview */}
            <div
              className={`${previewMode ? "flex-1" : "w-96"} bg-white/5 backdrop-blur-md border-l border-white/10 overflow-y-auto`}
            >
              <FormPreview formConfig={formConfig} fullscreen={previewMode} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
