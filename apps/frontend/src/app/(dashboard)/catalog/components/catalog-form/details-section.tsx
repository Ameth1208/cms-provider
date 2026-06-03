'use client'

import { useCatalogFormStore } from '../../store/catalog-form-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'

function ChipGroup({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: string; label: string }[]
  value: string
  onChange: (v: string) => void
  label: string
}) {
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

export function DetailsSection() {
  const { form, setForm } = useCatalogFormStore()
  const { t } = useTranslation()
  const isProduct = form.type === 'PRODUCT'

  if (!isProduct) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Icon icon="lucide:info" className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{t('details_only_product')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">{t('product_attributes')}</CardTitle>
          <CardDescription>{t('product_attributes_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">{t('brand')}</Label>
              <Input
                id="brand"
                value={form.brand}
                onChange={(e) => setForm({ brand: e.target.value })}
                placeholder={t('brand_placeholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material">{t('material')}</Label>
              <Input
                id="material"
                value={form.material}
                onChange={(e) => setForm({ material: e.target.value })}
                placeholder={t('material_placeholder')}
              />
            </div>
          </div>

          <ChipGroup
            label={t('gender')}
            options={[
              { key: 'Unisex', label: t('unisex') },
              { key: 'Hombre', label: t('men') },
              { key: 'Mujer', label: t('women') },
              { key: 'Niño', label: t('boy') },
              { key: 'Niña', label: t('girl') },
            ]}
            value={form.gender}
            onChange={(v) => setForm({ gender: v })}
          />

          <ChipGroup
            label={t('season')}
            options={[
              { key: 'Primavera', label: t('spring') },
              { key: 'Verano', label: t('summer') },
              { key: 'Otoño', label: t('fall') },
              { key: 'Invierno', label: t('winter') },
              { key: 'Todo el año', label: t('all_year') },
            ]}
            value={form.season}
            onChange={(v) => setForm({ season: v })}
          />

          <ChipGroup
            label={t('fit')}
            options={[
              { key: 'Slim', label: t('slim') },
              { key: 'Regular', label: t('regular') },
              { key: 'Oversize', label: t('oversize') },
              { key: 'Loose', label: t('loose') },
              { key: 'Skinny', label: t('skinny') },
            ]}
            value={form.fit}
            onChange={(v) => setForm({ fit: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">{t('shipping_care')}</CardTitle>
          <CardDescription>{t('shipping_care_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">{t('weight')}</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={form.weight || ''}
                onChange={(e) => setForm({ weight: parseFloat(e.target.value) || 0 })}
                placeholder={t('weight_placeholder')}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="dimensions">{t('dimensions')}</Label>
              <Input
                id="dimensions"
                value={form.dimensions}
                onChange={(e) => setForm({ dimensions: e.target.value })}
                placeholder={t('dimensions_placeholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">{t('origin_country')}</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setForm({ country: e.target.value })}
                placeholder={t('origin_country_placeholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="care">{t('care_instructions')}</Label>
            <Textarea
              id="care"
              value={form.careInstructions}
              onChange={(e) => setForm({ careInstructions: e.target.value })}
              placeholder={t('care_instructions_placeholder')}
              className="min-h-[80px] resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
