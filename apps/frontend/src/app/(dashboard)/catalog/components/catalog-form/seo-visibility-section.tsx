'use client'

import { useCatalogFormStore } from '../../store/catalog-form-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/i18n/use-translation'

const labels = [
  { value: 'new', labelKey: 'new_label', color: 'bg-blue-500', selected: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30' },
  { value: 'bestseller', labelKey: 'bestseller_label', color: 'bg-amber-500', selected: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30' },
  { value: 'sale', labelKey: 'sale_label', color: 'bg-red-500', selected: 'bg-red-500/15 text-red-600 dark:text-red-400 ring-1 ring-red-500/30' },
  { value: 'limited', labelKey: 'limited_label', color: 'bg-purple-500', selected: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/30' },
]

export function SeoVisibilitySection() {
  const form = useCatalogFormStore((s) => s.form)
  const setForm = useCatalogFormStore((s) => s.setForm)
  const { t } = useTranslation()

  const charCount = form.metaDescription?.length || 0
  const isGoodLength = charCount >= 120 && charCount <= 160

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">{t('visibility')}</CardTitle>
          <CardDescription>{t('visibility_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
            <div>
              <Label className="text-sm font-medium">{t('active_product')}</Label>
              <p className="text-xs text-muted-foreground">
                {form.active ? t('active_product_desc') : t('inactive_product_desc')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ active: !form.active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.active ? 'bg-primary' : 'bg-input'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
            <div>
              <Label className="text-sm font-medium">{t('featured_product')}</Label>
              <p className="text-xs text-muted-foreground">{t('featured_product_desc')}</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ featured: !form.featured })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.featured ? 'bg-primary' : 'bg-input'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.featured ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <Label>{t('visibility')}</Label>
            <div className="flex gap-2">
              {[
                { value: 'visible', label: t('public_visibility'), desc: t('public_desc') },
                { value: 'hidden', label: t('hidden_visibility'), desc: t('hidden_desc') },
                { value: 'draft', label: t('draft_visibility'), desc: t('draft_desc') },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ visibility: opt.value })}
                  className={`flex-1 text-left p-3 rounded-lg transition-colors ${
                    form.visibility === opt.value
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted hover:bg-accent/50'
                  }`}
                >
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>{t('visual_label')}</Label>
            <p className="text-xs text-muted-foreground">{t('visual_label_desc')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setForm({ label: '' })}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  !form.label
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent'
                }`}
              >
                {t('no_label')}
              </button>
              {labels.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setForm({ label: l.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                    form.label === l.value
                      ? l.selected
                      : 'bg-muted hover:bg-accent'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${l.color}`} />
                  {t(l.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">{t('seo_title')}</CardTitle>
          <CardDescription>{t('seo_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">{t('meta_title')}</Label>
            <Input
              id="metaTitle"
              value={form.metaTitle}
              onChange={(e) => setForm({ metaTitle: e.target.value })}
              placeholder={form.name || t('meta_title_placeholder')}
            />
            <p className="text-xs text-muted-foreground">{t('seo_auto_title')}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaDescription">{t('meta_description')}</Label>
              <span className={`text-[10px] ${isGoodLength ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {charCount}/160
              </span>
            </div>
            <Textarea
              id="metaDescription"
              value={form.metaDescription}
              onChange={(e) => setForm({ metaDescription: e.target.value })}
              placeholder={t('meta_description_placeholder')}
              className="min-h-[100px] resize-none"
              maxLength={160}
            />
          </div>

          <div className="p-4 rounded-lg bg-muted/30 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {t('google_preview')}
            </p>
            <div className="space-y-1">
              <p className="text-sm text-primary truncate">
                {(form.metaTitle || form.name || t('title_placeholder')) + ' | ' + t('preview')}
              </p>
              <p className="text-xs text-emerald-500">
                {t('domain_preview')}/catalog/{form.slug || t('slug_placeholder')}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {form.metaDescription || form.description || t('description_placeholder_preview')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
