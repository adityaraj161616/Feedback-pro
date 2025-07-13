"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, Palette, Shield, Link } from "lucide-react"
import type { FormConfig } from "@/app/form-builder/page"

interface FormSettingsModalProps {
  formConfig: FormConfig
  onUpdateFormConfig: (updates: Partial<FormConfig>) => void
  children: React.ReactNode
}

export function FormSettingsModal({ formConfig, onUpdateFormConfig, children }: FormSettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateSettings = (key: string, value: any) => {
    onUpdateFormConfig({
      settings: {
        ...formConfig.settings,
        [key]: value,
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Settings className="h-5 w-5 mr-2" />
            Form Settings
          </DialogTitle>
          <DialogDescription className="text-gray-400">Configure your form's appearance and behavior</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Settings */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Basic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Form Title</Label>
                <Input
                  value={formConfig.title}
                  onChange={(e) => onUpdateFormConfig({ title: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter form title"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Form Description</Label>
                <Textarea
                  value={formConfig.description}
                  onChange={(e) => onUpdateFormConfig({ description: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Submit Button Text</Label>
                <Input
                  value={formConfig.settings.submitMessage}
                  onChange={(e) => updateSettings("submitMessage", e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Submit Feedback"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Theme</Label>
                <select
                  value={formConfig.settings.theme}
                  onChange={(e) => updateSettings("theme", e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="colorful">Colorful</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Collect Email Addresses</Label>
                  <p className="text-sm text-gray-500">Require users to provide their email</p>
                </div>
                <Switch
                  checked={formConfig.settings.collectEmail}
                  onCheckedChange={(checked) => updateSettings("collectEmail", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Allow Anonymous Responses</Label>
                  <p className="text-sm text-gray-500">Let users submit without identifying themselves</p>
                </div>
                <Switch
                  checked={formConfig.settings.allowAnonymous}
                  onCheckedChange={(checked) => updateSettings("allowAnonymous", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* After Submission */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Link className="h-4 w-4 mr-2" />
                After Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Redirect URL (Optional)</Label>
                <Input
                  value={formConfig.settings.redirectUrl || ""}
                  onChange={(e) => updateSettings("redirectUrl", e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="https://example.com/thank-you"
                />
                <p className="text-sm text-gray-500">Redirect users to this URL after form submission</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)} className="bg-gradient-to-r from-purple-500 to-blue-500">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
