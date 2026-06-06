'use client'

import { Label } from '@/components/ui/label'

interface ChipGroupProps {
  options: { key: string; label: string }[]
  value: string
  onChange: (v: string) => void
  label: string
}

export function ChipGroup({ options, value, onChange, label }: ChipGroupProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(value === opt.key ? '' : opt.key)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              value === opt.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
