"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Eye, EyeOff, Share2, Settings, ArrowLeft } from "lucide-react"
import { FormSettingsModal } from "./form-settings-modal"
import { ShareModal } from "./share-modal"
import Link from "next/link"
import type { FormConfig } from "@/app/form-builder/page"

interface FormBuilderHeaderProps {
  formConfig: FormConfig
  onSave: () => void
  onPreview: () => void
  previewMode: boolean
  onUpdateFormConfig: (updates: Partial<FormConfig>) => void
}

export function FormBuilderHeader({
  formConfig,
  onSave,
  onPreview,
  previewMode,
  onUpdateFormConfig,
}: FormBuilderHeaderProps) {
  return (
    <header className="bg-black/50 backdrop-blur-md border-b border-white/10 h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left */}
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="h-6 w-px bg-white/20" />

          <Input
            value={formConfig.title}
            onChange={(e) => onUpdateFormConfig({ title: e.target.value })}
            className="bg-transparent border-none text-white text-lg font-semibold focus:ring-0 focus:border-none p-0 h-auto"
            placeholder="Form Title"
          />
        </div>

        {/* Right */}
        <div className="flex items-center space-x-3">
          <FormSettingsModal formConfig={formConfig} onUpdateFormConfig={onUpdateFormConfig}>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </FormSettingsModal>

          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? "Edit" : "Preview"}
          </Button>

          <ShareModal formConfig={formConfig}>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </ShareModal>

          <Button
            onClick={onSave}
            className="save-button bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Form
          </Button>
        </div>
      </div>
    </header>
  )
}
