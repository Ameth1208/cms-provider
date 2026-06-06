'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Category } from '@cms/shared'
import { generateSlug } from '../hooks/use-categories'

interface CategoryRowProps {
  category: Category
  depth: number
  query: string
  onRefresh: () => void
  onCreateSub: (parentId: string, name: string, slug: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function CategoryRow({ category, depth, query, onRefresh, onCreateSub, onDelete }: CategoryRowProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const hasChildren = (category.children?.length ?? 0) > 0

  const isSearching = query.length > 0
  const forceExpand = isSearching
  const showChildren = hasChildren && (forceExpand || expanded)

  async function handleCreateSub(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !slug) return
    await onCreateSub(category.id, name, slug)
    setCreateOpen(false)
    setName('')
    setSlug('')
    onRefresh()
  }

  async function handleDelete() {
    if (!confirm(`${t('confirm_delete')} "${category.name}"?`)) return
    await onDelete(category.id)
    onRefresh()
  }

  return (
    <>
      <TableRow className="hover:bg-muted/30 transition-colors duration-200">
        <TableCell className="py-3.5">
          <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 24}px` }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center justify-center h-5 w-5 rounded-md hover:bg-muted transition-colors shrink-0"
              >
                <Icon
                  icon={showChildren ? 'lucide:chevron-down' : 'lucide:chevron-right'}
                  className="h-3.5 w-3.5 text-muted-foreground"
                />
              </button>
            ) : (
              <div className="w-5 shrink-0" />
            )}
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Icon icon="lucide:folder" className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{category.name}</p>
              <p className="text-xs text-muted-foreground font-mono truncate">/{category.slug}</p>
            </div>
          </div>
        </TableCell>

        <TableCell className="w-40">
          {hasChildren ? (
            <Badge variant="secondary" className="font-light text-[10px]">
              {category.children!.length} {t('subcategories')}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>

        <TableCell className="text-right w-32">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-foreground gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <Icon icon="lucide:plus" className="h-3.5 w-3.5" />
              {t('subcategories')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {hasChildren && showChildren &&
        category.children!.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={depth + 1}
            query={query}
            onRefresh={onRefresh}
            onCreateSub={onCreateSub}
            onDelete={onDelete}
          />
        ))}

      {/* Create subcategory dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('new_subcategory')}</DialogTitle>
            <DialogDescription className="font-light">
              {t('inside')} <span className="font-medium text-foreground">{category.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSub} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('name')}</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!slug || slug === generateSlug(name)) setSlug(generateSlug(e.target.value))
                }}
                placeholder={t('name_placeholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('slug')}</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={t('slug_placeholder')}
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-lg" onClick={() => setCreateOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="rounded-lg">
                {t('create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
