'use client'

import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCatalogFormStore } from '../../store/catalog-form-store'
import { useInlineCreate } from '../../hooks/use-inline-create'
import { useTranslation } from '@/i18n/use-translation'

interface CategorySelectProps {
  categories: { id: string; name: string }[]
  value: string
  onChange: (id: string) => void
  onCreate: (name: string) => Promise<any>
  placeholder: string
}

function CategorySelect({ categories, value, onChange, onCreate, placeholder }: CategorySelectProps) {
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
        <div className="absolute z-50 w-full mt-2 rounded-xl border bg-popover shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <Icon icon="lucide:search" className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
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
                Sin resultados
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
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent ${
                  value === cat.id ? 'bg-accent' : ''
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
                <span>Crear &quot;{query.trim()}&quot;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface TagInputProps {
  tags: { id: string; name: string }[]
  value: string[]
  onChange: (ids: string[]) => void
  onCreate: (name: string) => Promise<any>
  placeholder: string
}

const TAG_COLORS = [
  'bg-blue-500/15 text-blue-700',
  'bg-emerald-500/15 text-emerald-700',
  'bg-amber-500/15 text-amber-700',
  'bg-rose-500/15 text-rose-700',
  'bg-violet-500/15 text-violet-700',
  'bg-cyan-500/15 text-cyan-700',
  'bg-orange-500/15 text-orange-700',
  'bg-pink-500/15 text-pink-700',
]

function getTagColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

function TagInput({ tags, value, onChange, onCreate, placeholder }: TagInputProps) {
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
        className="flex flex-wrap items-center gap-1.5 min-h-[46px] p-2 rounded-xl border bg-background cursor-text hover:border-primary/30 transition-colors"
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
                <span>Crear &quot;{query.trim()}&quot;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function OrganizationSection() {
  const store = useCatalogFormStore()
  const { createTag, createCategory } = useInlineCreate()
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">{t('category')}</CardTitle>
          <CardDescription>Selecciona la categoría del producto</CardDescription>
        </CardHeader>
        <CardContent>
          <CategorySelect
            categories={store.categories}
            value={store.form.categoryId}
            onChange={(id) => store.setForm({ categoryId: id })}
            onCreate={async (name) => {
              const cat = await createCategory(name)
              if (cat) store.setForm({ categoryId: cat.id })
            }}
            placeholder={t('no_category')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">{t('tags')}</CardTitle>
          <CardDescription>Agrega tags para organizar mejor</CardDescription>
        </CardHeader>
        <CardContent>
          <TagInput
            tags={store.tags}
            value={store.form.tagIds}
            onChange={(ids) => store.setForm({ tagIds: ids })}
            onCreate={async (name) => {
              const tag = await createTag(name)
              return tag
            }}
            placeholder={t('no_tags')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
