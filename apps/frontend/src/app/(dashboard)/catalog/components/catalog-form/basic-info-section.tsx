'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCatalogFormStore } from '../../store/catalog-form-store'
import { useTranslation } from '@/i18n/use-translation'

interface Props {
  isNew: boolean
}

export function BasicInfoSection({ isNew }: Props) {
  const { form, setForm, setFormName } = useCatalogFormStore()
  const { t } = useTranslation()
  const [showDiscount, setShowDiscount] = useState(form.discountType !== '')

  const finalPrice =
    form.discountType && form.discountValue > 0
      ? form.discountType === 'PERCENTAGE'
        ? Math.round(form.price * (1 - form.discountValue / 100) * 100) / 100
        : Math.max(0, Math.round((form.price - form.discountValue) * 100) / 100)
      : form.price

  const discountLabel =
    form.discountType === 'PERCENTAGE'
      ? `-${form.discountValue}%`
      : form.discountType === 'FIXED'
      ? `-$${form.discountValue}`
      : ''

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Icon icon="lucide:info" className="h-4 w-4 text-muted-foreground" />
            {t('basic_info')}
          </CardTitle>
          <CardDescription>{t('basic_info_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')} *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setFormName(e.target.value, isNew)}
                placeholder={t('name_placeholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t('slug')} *</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm({ slug: e.target.value })}
                placeholder={t('slug_placeholder')}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ description: e.target.value })}
              placeholder={t('description_placeholder')}
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">{t('type')} *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ type: v as 'PRODUCT' | 'SERVICE' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCT">
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:package" className="h-4 w-4" />
                      {t('type_product')}
                    </div>
                  </SelectItem>
                  <SelectItem value="SERVICE">
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:concierge-bell" className="h-4 w-4" />
                      {t('type_service')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">{t('sku')}</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => setForm({ sku: e.target.value })}
                placeholder={t('sku_placeholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">{t('barcode')}</Label>
              <Input
                id="barcode"
                value={form.barcode}
                onChange={(e) => setForm({ barcode: e.target.value })}
                placeholder={t('barcode_placeholder')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Icon icon="lucide:tag" className="h-4 w-4 text-muted-foreground" />
            {t('pricing')}
          </CardTitle>
          <CardDescription>{t('pricing_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t('price')} *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ price: parseFloat(e.target.value) || 0 })}
                  className="pl-7 text-lg"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparePrice">{t('price_compare')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.comparePrice || ''}
                  onChange={(e) => setForm({ comparePrice: parseFloat(e.target.value) || 0 })}
                  className="pl-7"
                  placeholder={t('price_compare_placeholder')}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg p-3 bg-muted/30">
            <div>
              <Label className="text-sm font-medium">{t('apply_discount')}</Label>
              <p className="text-xs text-muted-foreground">{t('discount_desc')}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !showDiscount
                setShowDiscount(next)
                if (!next) setForm({ discountType: '', discountValue: 0 })
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showDiscount ? 'bg-primary' : 'bg-input'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showDiscount ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {showDiscount && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-accent/20">
              <div className="space-y-2">
                <Label>{t('discount_type')}</Label>
                <Select
                  value={form.discountType || 'PERCENTAGE'}
                  onValueChange={(v) => setForm({ discountType: v as 'PERCENTAGE' | 'FIXED' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">{t('percentage')}</SelectItem>
                    <SelectItem value="FIXED">{t('fixed_amount')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('discount_value')}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {form.discountType === 'PERCENTAGE' ? '%' : '$'}
                  </span>
                  <Input
                    type="number"
                    step={form.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                    min="0"
                    value={form.discountValue || ''}
                    onChange={(e) => setForm({ discountValue: parseFloat(e.target.value) || 0 })}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{t('final_price_preview')}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-medium">${finalPrice.toFixed(2)}</span>
                {form.comparePrice > 0 && form.comparePrice > finalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${form.comparePrice.toFixed(2)}
                  </span>
                )}
                {discountLabel && (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    {discountLabel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
