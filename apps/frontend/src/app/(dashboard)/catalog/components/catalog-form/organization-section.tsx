'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCatalogFormStore } from '../../store/catalog-form-store'
import { useInlineCreate } from '../../hooks/use-inline-create'
import { useTranslation } from '@/i18n/use-translation'
import { CategorySelect } from './category-select'
import { TagInput } from './tag-input'

export function OrganizationSection() {
  const categories = useCatalogFormStore((s) => s.categories)
  const tags = useCatalogFormStore((s) => s.tags)
  const categoryId = useCatalogFormStore((s) => s.form.categoryId)
  const tagIds = useCatalogFormStore((s) => s.form.tagIds)
  const setForm = useCatalogFormStore((s) => s.setForm)
  const { createTag, createCategory } = useInlineCreate()
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">{t('category')}</CardTitle>
          <CardDescription>{t('select_category_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <CategorySelect
            categories={categories}
            value={categoryId}
            onChange={(id) => setForm({ categoryId: id })}
            onCreate={async (name) => {
              const cat = await createCategory(name)
              if (cat) setForm({ categoryId: cat.id })
            }}
            placeholder={t('no_category')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">{t('tags')}</CardTitle>
          <CardDescription>{t('tags_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <TagInput
            tags={tags}
            value={tagIds}
            onChange={(ids) => setForm({ tagIds: ids })}
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
