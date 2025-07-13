"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { X, Settings } from "lucide-react"
import type { FormField } from "@/app/form-builder/page"

interface FormSettingsProps {
  field?: FormField
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
  onClose: () => void
}

export function FormSettings({ field, onUpdateField, onClose }: FormSettingsProps) {
  if (!field) return null

  const handleUpdate = (updates: Partial<FormField>) => {
    onUpdateField(field.id, updates)
  }

  const addOption = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
    handleUpdate({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])]
    newOptions[index] = value
    handleUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || []
    handleUpdate({ options: newOptions })
  }

  return (
    <div className="border-t border-white/10">
      <Card className="bg-white/5 border-white/10 rounded-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Field Settings
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Basic Settings */}
          <div className="space-y-2">
            <Label className="text-gray-300">Field Label</Label>
            <Input
              value={field.label}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Enter field label"
            />
          </div>

          {(field.type === "text" || field.type === "textarea") && (
            <div className="space-y-2">
              <Label className="text-gray-300">Placeholder Text</Label>
              <Input
                value={field.placeholder || ""}
                onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Enter placeholder text"
              />
            </div>
          )}

          {/* Options for Select Fields */}
          {field.type === "select" && (
            <div className="space-y-2">
              <Label className="text-gray-300">Options</Label>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="bg-white/10 border-white/20 text-white flex-1"
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeOption(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addOption}
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">Required Field</Label>
            <Switch checked={field.required} onCheckedChange={(checked) => handleUpdate({ required: checked })} />
          </div>

          {/* Field Type Specific Settings */}
          {field.type === "rating" && (
            <div className="space-y-2">
              <Label className="text-gray-300">Rating Scale</Label>
              <select
                value={field.settings?.scale || 5}
                onChange={(e) =>
                  handleUpdate({ settings: { ...field.settings, scale: Number.parseInt(e.target.value) } })
                }
                className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value={3}>3 Stars</option>
                <option value={5}>5 Stars</option>
                <option value={10}>10 Point Scale</option>
              </select>
            </div>
          )}

          {field.type === "file" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Allowed File Types</Label>
                <Input
                  value={field.settings?.allowedTypes || "image/*,.pdf"}
                  onChange={(e) => handleUpdate({ settings: { ...field.settings, allowedTypes: e.target.value } })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="image/*,.pdf,.doc"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Max File Size (MB)</Label>
                <Input
                  type="number"
                  value={field.settings?.maxSize || 10}
                  onChange={(e) =>
                    handleUpdate({ settings: { ...field.settings, maxSize: Number.parseInt(e.target.value) } })
                  }
                  className="bg-white/10 border-white/20 text-white"
                  min={1}
                  max={100}
                />
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="space-y-2">
            <Label className="text-gray-300">Help Text</Label>
            <Textarea
              value={field.settings?.helpText || ""}
              onChange={(e) => handleUpdate({ settings: { ...field.settings, helpText: e.target.value } })}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Optional help text for users"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
