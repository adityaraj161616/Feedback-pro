"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Type, MessageSquare, Star, Smile, List, Upload } from "lucide-react"
import type { FormField } from "@/app/form-builder/page"

const fieldTypes = [
  {
    type: "text" as const,
    label: "Text Input",
    description: "Single line text field",
    icon: Type,
    color: "from-blue-500 to-cyan-500",
  },
  {
    type: "textarea" as const,
    label: "Text Area",
    description: "Multi-line text field",
    icon: MessageSquare,
    color: "from-green-500 to-emerald-500",
  },
  {
    type: "rating" as const,
    label: "Star Rating",
    description: "5-star rating system",
    icon: Star,
    color: "from-yellow-500 to-orange-500",
  },
  {
    type: "emoji" as const,
    label: "Emoji Selector",
    description: "Emoji-based feedback",
    icon: Smile,
    color: "from-pink-500 to-rose-500",
  },
  {
    type: "select" as const,
    label: "Dropdown",
    description: "Multiple choice selection",
    icon: List,
    color: "from-purple-500 to-indigo-500",
  },
  {
    type: "file" as const,
    label: "File Upload",
    description: "Allow file attachments",
    icon: Upload,
    color: "from-gray-500 to-slate-500",
  },
]

interface FieldPaletteProps {
  onAddField: (fieldType: FormField["type"]) => void
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <div className="p-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Field Types</CardTitle>
          <CardDescription className="text-gray-400">Drag or click to add fields to your form</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {fieldTypes.map((fieldType) => (
            <Button
              key={fieldType.type}
              onClick={() => onAddField(fieldType.type)}
              className={`w-full justify-start h-auto p-4 bg-gradient-to-r ${fieldType.color} hover:opacity-90 transition-all duration-200 group cursor-grab active:cursor-grabbing`}
              draggable
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <fieldType.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-white">{fieldType.label}</div>
                  <div className="text-xs text-white/80">{fieldType.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
