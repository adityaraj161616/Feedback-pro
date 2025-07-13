"use client"

import { useRef } from "react"
// import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
// import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
// import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash2, GripVertical, Settings, Star } from "lucide-react"
import type { FormConfig, FormField } from "@/app/form-builder/page"
// import { useSortable } from "@dnd-kit/sortable"

interface FormCanvasProps {
  formConfig: FormConfig
  selectedField: string | null
  onSelectField: (fieldId: string | null) => void
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
  onDeleteField: (fieldId: string) => void
  onReorderFields: (startIndex: number, endIndex: number) => void
  onUpdateFormConfig: (updates: Partial<FormConfig>) => void // New prop for form-level updates
}

export function FormCanvas({
  formConfig,
  selectedField,
  onSelectField,
  onUpdateField,
  onDeleteField,
  onReorderFields,
  onUpdateFormConfig, // Destructure the new prop
}: FormCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  // const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

  // const handleDragEnd = (event: any) => {
  //   const { active, over } = event

  //   if (active.id !== over.id) {
  //     const oldIndex = formConfig.fields.findIndex((field) => field.id === active.id)
  //     const newIndex = formConfig.fields.findIndex((field) => field.id === over.id)

  //     onReorderFields(oldIndex, newIndex)
  //   }
  // }

  const renderField = (field: FormField) => {
    const isSelected = selectedField === field.id

    return (
      <SortableFieldItem
        key={field.id}
        field={field}
        isSelected={isSelected}
        onSelect={() => onSelectField(field.id)}
        onUpdate={(updates) => onUpdateField(field.id, updates)}
        onDelete={() => onDeleteField(field.id)}
      />
    )
  }

  return (
    <div ref={canvasRef} className="max-w-2xl mx-auto">
      {/* Form Header */}
      <Card className="mb-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
        <CardContent className="p-6">
          <Input
            value={formConfig.title}
            onChange={(e) => onUpdateFormConfig({ title: e.target.value })} // Corrected to use onUpdateFormConfig
            className="text-2xl font-bold bg-transparent border-none text-white p-0 mb-4 focus:ring-0"
            placeholder="Form Title"
          />
          <Textarea
            value={formConfig.description}
            onChange={(e) => onUpdateFormConfig({ description: e.target.value })} // Corrected to use onUpdateFormConfig
            className="bg-transparent border-none text-gray-300 p-0 resize-none focus:ring-0"
            placeholder="Form Description"
            rows={2}
          />
        </CardContent>
      </Card>

      {/* Form Fields */}
      {/* <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={formConfig.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}> */}
      <div className="space-y-4">
        {formConfig.fields.length === 0 ? (
          <Card className="bg-white/5 border-white/10 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 text-lg mb-2">No fields added yet</div>
              <div className="text-gray-500 text-sm">
                Add fields from the palette on the left to start building your form
              </div>
            </CardContent>
          </Card>
        ) : (
          formConfig.fields.map(renderField)
        )}
      </div>
      {/* </SortableContext>
      </DndContext> */}
    </div>
  )
}

function SortableFieldItem({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: {
  field: FormField
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<FormField>) => void
  onDelete: () => void
}) {
  // const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
  //   id: field.id,
  // })

  // const style = {
  //   transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  //   transition,
  //   opacity: isDragging ? 0.5 : 1,
  // }

  const renderFieldPreview = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            placeholder={field.placeholder || "Enter your response..."}
            className="bg-white/10 border-white/20 text-white"
            disabled
          />
        )
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || "Enter your detailed response..."}
            className="bg-white/10 border-white/20 text-white"
            rows={3}
            disabled
          />
        )
      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-6 w-6 text-yellow-400 cursor-pointer hover:fill-current" />
            ))}
          </div>
        )
      case "emoji":
        return (
          <div className="flex space-x-2">
            {["😢", "😐", "😊", "😍", "🤩"].map((emoji, index) => (
              <button key={index} className="text-2xl p-2 rounded-lg hover:bg-white/10 transition-colors" disabled>
                {emoji}
              </button>
            ))}
          </div>
        )
      case "select":
        return (
          <select className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white" disabled>
            <option>Select an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case "file":
        return (
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
            <div className="text-gray-400">Click to upload or drag and drop</div>
            <div className="text-sm text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card
      data-field-id={field.id}
      className={`group cursor-pointer transition-all duration-200 ${isSelected
        ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-400"
        : "bg-white/5 border-white/10 hover:border-white/20"
        }`}
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <button className="text-gray-400 hover:text-white cursor-pointer">

                <GripVertical className="h-4 w-4" />
              </button>
              <Input
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="bg-transparent border-none text-white font-medium p-0 focus:ring-0"
                placeholder="Field Label"
                onClick={(e) => e.stopPropagation()}
              />
              {field.required && <span className="text-red-400 text-sm">*</span>}
            </div>
          </div>

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">{field.label}</Label>
          {renderFieldPreview()}
        </div>
      </CardContent>
    </Card>
  )
}
