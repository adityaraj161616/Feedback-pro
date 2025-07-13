"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Download, QrCode, Share2, Zap } from "lucide-react"
import { useSession } from "next-auth/react"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  formId?: string // Optional: if exporting for a specific form
  formUrl?: string // Optional: URL of the form for QR/embed
}

export function ExportModal({ isOpen, onClose, formId, formUrl }: ExportModalProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)

  const handleExport = async () => {
    if (!userId) {
      toast.error("Authentication required to export data.")
      return
    }

    try {
      const response = await fetch(
        `/api/export?userId=${userId}${formId ? `&formId=${formId}` : ""}&format=${exportFormat}`,
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `feedback_data.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        a.remove()
        toast.success("Data exported successfully!")
      } else {
        const errorData = await response.json()
        toast.error(`Failed to export data: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Export error:", error)
      toast.error("An unexpected error occurred during export.")
    }
  }

  const handleGenerateQrCode = async () => {
    if (!formUrl) {
      toast.error("Form URL is not available to generate QR code.")
      return
    }
    try {
      const response = await fetch("/api/qr-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formUrl }),
      })
      if (response.ok) {
        const data = await response.json()
        setQrCodeDataUrl(data.qrCodeDataUrl)
        toast.success("QR Code generated!")
      } else {
        const errorData = await response.json()
        toast.error(`Failed to generate QR code: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("QR code generation error:", error)
      toast.error("An unexpected error occurred during QR code generation.")
    }
  }

  const handleCopyEmbedSnippet = () => {
    if (!formId) {
      toast.error("Form ID is not available to generate embed snippet.")
      return
    }
    const embedSnippet = `<iframe src="${process.env.NEXT_PUBLIC_APP_URL}/feedback/${formId}" width="100%" height="600px" frameborder="0" style="border: none; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" title="Feedback Form"></iframe>`
    navigator.clipboard.writeText(embedSnippet)
    toast.success("Embed snippet copied to clipboard!")
  }

  const handleSendWebhook = async () => {
    if (!webhookUrl || !formId || !userId) {
      toast.error("Webhook URL, Form ID, and User ID are required.")
      return
    }

    try {
      // Fetch some sample data or the latest feedback for the payload
      const feedbackResponse = await fetch(`/api/feedback?userId=${userId}&formId=${formId}&limit=1`)
      const feedbackData = feedbackResponse.ok ? (await feedbackResponse.json()).feedback[0] : null

      const payload = {
        eventType: "form.feedback_received",
        formId: formId,
        userId: userId,
        timestamp: new Date().toISOString(),
        data: feedbackData || { message: "No recent feedback available for sample." },
      }

      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl, payload }),
      })

      if (response.ok) {
        toast.success("Webhook sent successfully!")
      } else {
        const errorData = await response.json()
        toast.error(`Failed to send webhook: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Webhook send error:", error)
      toast.error("An unexpected error occurred during webhook send.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-gray-800 to-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Export & Integrations</DialogTitle>
          <DialogDescription className="text-gray-400">
            Export your feedback data or integrate with other services.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Data Export */}
          <div className="space-y-2">
            <Label htmlFor="export-format" className="text-gray-300 text-base">
              Export Feedback Data
            </Label>
            <div className="flex gap-2">
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as "csv" | "pdf")}>
                <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border-gray-600">
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExport} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
            </div>
          </div>

          {/* Form Sharing & Embedding (only if formId and formUrl are provided) */}
          {formId && formUrl && (
            <>
              <div className="space-y-2">
                <Label className="text-gray-300 text-base">Share Form</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateQrCode}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <QrCode className="mr-2 h-4 w-4" /> Generate QR Code
                  </Button>
                  <Button
                    onClick={handleCopyEmbedSnippet}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Copy Embed Snippet
                  </Button>
                </div>
                {qrCodeDataUrl && (
                  <div className="mt-4 text-center">
                    <img
                      src={qrCodeDataUrl || "/placeholder.svg"}
                      alt="QR Code"
                      className="mx-auto border border-gray-600 rounded-md"
                    />
                    <p className="text-gray-400 text-sm mt-2">Scan to access the form</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Webhook Integration */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="text-gray-300 text-base">
              Webhook Integration (e.g., Zapier)
            </Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                placeholder="Enter webhook URL"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-500"
              />
              <Button onClick={handleSendWebhook} className="bg-orange-600 hover:bg-orange-700 text-white">
                <Zap className="mr-2 h-4 w-4" /> Test Webhook
              </Button>
            </div>
            <p className="text-sm text-gray-500">Sends a sample feedback payload to the specified URL.</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
