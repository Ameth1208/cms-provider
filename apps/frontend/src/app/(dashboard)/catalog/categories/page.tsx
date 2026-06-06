'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/page-header'
import { useCategories, generateSlug } from './hooks/use-categories'
import { CategoryRow } from './components/category-row'

export default function CategoriesPage() {
  const { t } = useTranslation()
  const {
    loading,
    query,
    setQuery,
    createOpen,
    setCreateOpen,
    name,
    setName,
    slug,
    setSlug,
    handleCreate,
    handleCreateSub,
    handleDelete,
    visibleRoots,
    totalCount,
    token,
    fetch,
  } = useCategories()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={t('title')}
        description={`${totalCount} ${totalCount === 1 ? t('category_count') : t('categories_count')}`}
      >
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          <span className="hidden sm:inline">{t('new_category')}</span>
        </Button>
      </PageHeader>

      <div className="rounded-xl bg-card p-4">
        <div className="relative flex-1 max-w-md">
          <Icon
            icon="lucide:search"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder={t('search_categories')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('new_category')}</DialogTitle>
            <DialogDescription className="font-light">{t('category_description')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
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

      {totalCount === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Icon icon="lucide:folder-open" className="mx-auto h-10 w-10 mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground font-light">{t('empty')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('empty_desc')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="text-xs tracking-wider uppercase">{t('name')}</TableHead>
                  <TableHead className="text-xs tracking-wider uppercase w-40">{t('subcategories')}</TableHead>
                  <TableHead className="text-right text-xs tracking-wider uppercase w-32">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRoots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                      {t('no_results')}
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRoots.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      depth={0}
                      query={query}
                      onRefresh={fetch}
                      onCreateSub={handleCreateSub}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
