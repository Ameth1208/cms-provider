'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
import { useTags, generateSlug } from './hooks/use-tags'

export default function TagsPage() {
  const { t } = useTranslation()
  const {
    tags,
    loading,
    name,
    setName,
    slug,
    setSlug,
    handleCreate,
    handleDelete,
  } = useTags()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={t('title')}
        description={`${tags.length} ${tags.length === 1 ? t('tag_count') : t('tags_count')}`}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">{t('new_tag')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="space-y-2 flex-1 w-full">
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
            <div className="space-y-2 flex-1 w-full">
              <Label>{t('slug')}</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={t('slug_placeholder')}
                required
              />
            </div>
            <Button type="submit" className="gap-2 w-full sm:w-auto">
              <Icon icon="lucide:plus" className="h-4 w-4" />
              <span className="hidden sm:inline">{t('create')}</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {tags.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Icon icon="lucide:tags" className="mx-auto h-10 w-10 mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground font-light">{t('empty')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('empty_desc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Card key={tag.id} className="group relative">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:tag" className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{tag.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {tag._count?.catalogItems ?? 0} {t('items_count')}
                </Badge>
                <button
                  onClick={() => {
                    if (confirm(t('confirm_delete'))) handleDelete(tag.id)
                  }}
                  className="ml-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon icon="lucide:x" className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
