"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Share2, Copy, Mail, MessageSquare, Facebook, Twitter, QrCode, UploadIcon as Embed } from "lucide-react"
import { toast } from "sonner"
import type { FormConfig } from "@/app/form-builder/page"

interface ShareModalProps {
  formConfig: FormConfig
  children: React.ReactNode
}

export function ShareModal({ formConfig, children }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const formUrl = `${window.location.origin}/feedback/${formConfig.id}`
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Feedback Request: ${formConfig.title}`)
    const body = encodeURIComponent(
      `Hi,\n\nI'd love to get your feedback! Please fill out this quick form:\n\n${formUrl}\n\nThanks!`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareViaSMS = () => {
    const message = encodeURIComponent(`Please share your feedback: ${formUrl}`)
    window.open(`sms:?body=${message}`)
  }

  const shareViaTwitter = () => {
    const text = encodeURIComponent(`Share your feedback: ${formConfig.title}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(formUrl)}`)
  }

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Share2 className="h-5 w-5 mr-2" />
            Share Your Form
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Share your feedback form with others using these options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Direct Link */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Direct Link</CardTitle>
              <CardDescription className="text-gray-400">Copy and share this link directly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input value={formUrl} readOnly className="bg-white/10 border-white/20 text-white" />
                <Button
                  onClick={() => copyToClipboard(formUrl, "Form link")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Sharing */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Social Sharing</CardTitle>
              <CardDescription className="text-gray-400">Share on social media platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={shareViaEmail}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 flex flex-col items-center p-4 h-auto bg-transparent"
                >
                  <Mail className="h-6 w-6 mb-2" />
                  Email
                </Button>
                <Button
                  onClick={shareViaSMS}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 flex flex-col items-center p-4 h-auto bg-transparent"
                >
                  <MessageSquare className="h-6 w-6 mb-2" />
                  SMS
                </Button>
                <Button
                  onClick={shareViaTwitter}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 flex flex-col items-center p-4 h-auto bg-transparent"
                >
                  <Twitter className="h-6 w-6 mb-2" />
                  Twitter
                </Button>
                <Button
                  onClick={shareViaFacebook}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 flex flex-col items-center p-4 h-auto bg-transparent"
                >
                  <Facebook className="h-6 w-6 mb-2" />
                  Facebook
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center">
                <Embed className="h-5 w-5 mr-2" />
                Embed Code
              </CardTitle>
              <CardDescription className="text-gray-400">Embed this form directly on your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label className="text-gray-300">HTML Embed Code</Label>
                <div className="flex space-x-2">
                  <Input
                    value={embedCode}
                    readOnly
                    className="bg-white/10 border-white/20 text-white font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(embedCode, "Embed code")}
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Copy this code and paste it into your website's HTML</p>
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                QR Code
              </CardTitle>
              <CardDescription className="text-gray-400">Generate a QR code for easy mobile access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 bg-white rounded-lg">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">QR Code will be generated here</p>
                </div>
              </div>
              <Button
                onClick={() => toast.info("QR code generation coming soon!")}
                variant="outline"
                className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
              >
                Generate QR Code
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button onClick={() => setIsOpen(false)} className="bg-gradient-to-r from-purple-500 to-blue-500">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
