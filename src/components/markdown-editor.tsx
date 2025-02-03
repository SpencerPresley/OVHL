import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { MarkdownContent } from './markdown-content'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function MarkdownEditor({ value, onChange, placeholder, className }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-end space-x-2">
        <Toggle
          pressed={isPreview}
          onPressedChange={setIsPreview}
          aria-label="Toggle markdown preview"
        >
          Preview
        </Toggle>
      </div>
      
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'min-h-[200px] font-mono',
            isPreview && 'absolute inset-0 -z-10 opacity-0'
          )}
        />
        
        {isPreview && (
          <div className="min-h-[200px] rounded-md border bg-background px-3 py-2">
            <MarkdownContent content={value} />
          </div>
        )}
      </div>
    </div>
  )
} 