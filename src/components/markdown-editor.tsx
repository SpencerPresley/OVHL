'use client';

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Toggle } from '@/components/ui/toggle'
import { Bold, Italic, List, Heading2, Code, Quote as QuoteIcon, Eye, ChevronDown } from 'lucide-react'
import { MarkdownContent } from './markdown-content'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function MarkdownEditor({ value, onChange, placeholder, className }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const insertMarkdown = (prefix: string, suffix: string = prefix) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    // Special handling for lists
    if (prefix === '- ') {
      // If there's selected text, make each line a list item
      if (selectedText) {
        const listItems = selectedText
          .split('\n')
          .map(line => line.trim() ? `- ${line}` : '')
          .join('\n');
        const newText = `${beforeText}\n${listItems}\n${afterText}`;
        onChange(newText);
        
        // Set cursor position after the list
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + listItems.length + 2; // +2 for the extra newlines
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
        return;
      }

      // If no text is selected, add a list item with proper spacing
      const needsNewLine = beforeText.length > 0 && !beforeText.endsWith('\n\n');
      const newText = `${beforeText}${needsNewLine ? '\n\n' : ''}- text\n${afterText}`;
      onChange(newText);

      // Set cursor position after "- " but before "text"
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = beforeText.length + (needsNewLine ? 4 : 2); // +2 for "- ", +2 for \n\n if needed
        textarea.setSelectionRange(newCursorPos, newCursorPos + 4); // Select "text"
      }, 0);
      return;
    }

    // Special handling for headers and quotes
    if (prefix.startsWith('#') || prefix.startsWith('>')) {
      // Add a new line before if we're not at the start of a line
      const needsNewLine = beforeText.length > 0 && !beforeText.endsWith('\n');
      const newText = selectedText 
        ? `${beforeText}${needsNewLine ? '\n' : ''}${prefix}${selectedText}${afterText}`
        : `${beforeText}${needsNewLine ? '\n' : ''}${prefix}text${afterText}`;

      onChange(newText);

      // Set cursor position after update
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = selectedText 
          ? start + prefix.length + selectedText.length + (needsNewLine ? 1 : 0)
          : start + prefix.length + 4 + (needsNewLine ? 1 : 0); // 4 is length of "text"
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
      return;
    }

    // Normal wrapping for bold, italic, etc.
    const newText = selectedText 
      ? `${beforeText}${prefix}${selectedText}${suffix}${afterText}`
      : `${beforeText}${prefix}text${suffix}${afterText}`;

    onChange(newText);

    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText 
        ? start + prefix.length + selectedText.length + suffix.length
        : start + prefix.length + 4; // 4 is length of "text"
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, label: 'Bold', prefix: '**' },
    { icon: Italic, label: 'Italic', prefix: '_' },
    { icon: List, label: 'List', prefix: '- ' },
    { icon: Code, label: 'Code', prefix: '`' },
    { icon: QuoteIcon, label: 'Quote', prefix: '> ' }
  ];

  const headerLevels = [
    { level: 1, label: 'Heading 1', prefix: '# ' },
    { level: 2, label: 'Heading 2', prefix: '## ' },
    { level: 3, label: 'Heading 3', prefix: '### ' },
    { level: 4, label: 'Heading 4', prefix: '#### ' },
    { level: 5, label: 'Heading 5', prefix: '##### ' },
    { level: 6, label: 'Heading 6', prefix: '###### ' },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <ToggleGroup type="multiple" className="justify-start">
          {formatButtons.map(({ icon: Icon, label, prefix }) => (
            <ToggleGroupItem
              key={label}
              value={label.toLowerCase()}
              aria-label={`Toggle ${label}`}
              onClick={() => insertMarkdown(prefix)}
            >
              <Icon className="h-4 w-4" />
            </ToggleGroupItem>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToggleGroupItem
                value="heading"
                aria-label="Add heading"
                className="gap-1"
              >
                <Heading2 className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </ToggleGroupItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {headerLevels.map(({ level, label, prefix }) => (
                <DropdownMenuItem
                  key={level}
                  onClick={() => insertMarkdown(prefix)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </ToggleGroup>
        <Toggle
          pressed={isPreview}
          onPressedChange={setIsPreview}
          aria-label="Toggle markdown preview"
          className="ml-2"
        >
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Toggle>
      </div>
      
      {isPreview ? (
        <div className="min-h-[100px] p-3 bg-muted rounded-md">
          <MarkdownContent content={value} />
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] resize-y"
        />
      )}
    </div>
  )
} 
