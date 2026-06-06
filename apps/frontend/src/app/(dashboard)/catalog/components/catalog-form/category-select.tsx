'use client'

import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'

interface CategorySelectProps {
  categories: { id: string; name: string }[]
  value: string
  onChange: (id: string) => void
  onCreate: (name: string) => Promise<any>
  placeholder: string
}

export function CategorySelect({ categories, value, onChange, onCreate, placeholder }: CategorySelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = categories.find((c) => c.id === value)
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )
  const hasExact = categories.some((c) => c.name.toLowerCase() === query.toLowerCase().trim())
  const canCreate = !!query.trim() && !hasExact

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        className="flex items-center gap-3 w-full p-3 rounded-xl bg-muted hover:bg-accent/50 transition-colors text-left"
      >
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon icon="lucide:folder" className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {selected ? selected.name : placeholder}
          </p>
          {!selected && <p className="text-xs text-muted-foreground">{t('all_categories')}</p>}
        </div>
        <Icon icon="lucide:chevron-down" className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-2 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Icon icon="lucide:search" className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canCreate) {
                  e.preventDefault()
                  onCreate(query.trim()).then(() => {
                    setQuery('')
                    setOpen(false)
                  })
                }
                if (e.key === 'Escape') setOpen(false)
              }}
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            {filtered.length === 0 && !canCreate && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                {t('no_results')}
              </div>
            )}
            {filtered.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onChange(cat.id)
                  setOpen(false)
                  setQuery('')
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent ${value === cat.id ? 'bg-accent' : ''
                  }`}
              >
                <Icon icon="lucide:folder" className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate">{cat.name}</span>
                {value === cat.id && (
                  <Icon icon="lucide:check" className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
            {canCreate && (
              <button
                type="button"
                onClick={() => {
                  onCreate(query.trim()).then(() => {
                    setQuery('')
                    setOpen(false)
                  })
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-primary hover:bg-accent transition-colors border-t"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                <span>{t('create')} &quot;{query.trim()}&quot;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
