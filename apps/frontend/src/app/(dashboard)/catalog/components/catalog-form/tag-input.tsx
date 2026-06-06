'use client'

import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'

interface TagInputProps {
  tags: { id: string; name: string }[]
  value: string[]
  onChange: (ids: string[]) => void
  onCreate: (name: string) => Promise<any>
  placeholder: string
}

const TAG_COLORS = [
  'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300',
  'bg-stone-500/15 text-stone-700 dark:text-stone-300',
  'bg-neutral-500/15 text-neutral-700 dark:text-neutral-300',
  'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'bg-amber-500/15 text-amber-700 dark:text-amber-300',
]

function getTagColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

export function TagInput({ tags, value, onChange, onCreate, placeholder }: TagInputProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedTags = tags.filter((t) => value.includes(t.id))
  const filtered = tags.filter(
    (t) => !value.includes(t.id) && t.name.toLowerCase().includes(query.toLowerCase())
  )
  const hasExact = tags.some((t) => t.name.toLowerCase() === query.toLowerCase().trim())
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

  function removeTag(id: string) {
    onChange(value.filter((v) => v !== id))
  }

  function addTag(id: string) {
    onChange([...value, id])
    setQuery('')
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Input with chips */}
      <div
        onClick={() => {
          setOpen(true)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        className="flex flex-wrap items-center gap-1.5 min-h-[46px] p-2 rounded-xl border border-border bg-background cursor-text hover:border-primary/30 transition-colors"
      >
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getTagColor(tag.name)}`}
          >
            {tag.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag.id)
              }}
              className="hover:opacity-70 rounded-sm"
            >
              <Icon icon="lucide:x" className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground h-7"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canCreate) {
              e.preventDefault()
              onCreate(query.trim()).then((tag: any) => {
                if (tag) addTag(tag.id)
                setQuery('')
              })
            }
            if (e.key === 'Escape') setOpen(false)
            if (e.key === 'Backspace' && !query && selectedTags.length > 0) {
              removeTag(selectedTags[selectedTags.length - 1].id)
            }
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (filtered.length > 0 || canCreate) && (
        <div className="absolute z-50 w-full mt-2 rounded-xl border bg-popover shadow-lg overflow-hidden">
          <div className="max-h-[200px] overflow-y-auto py-1">
            {filtered.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addTag(tag.id)}
                className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              >
                <span className={`h-2 w-2 rounded-full ${getTagColor(tag.name).split(' ')[0].replace('/15', '')}`} />
                <span className="flex-1 truncate">{tag.name}</span>
                <Icon icon="lucide:plus" className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
            {canCreate && (
              <button
                type="button"
                onClick={() => {
                  onCreate(query.trim()).then((tag: any) => {
                    if (tag) addTag(tag.id)
                    setQuery('')
                  })
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-primary hover:bg-accent transition-colors border-t"
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
