'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCatalogFormStore } from '../../store/catalog-form-store'
import { useTranslation } from '@/i18n/use-translation'
import { formatPriceInput, handlePriceInput } from '@/lib/utils'

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única']

const PRESET_COLORS = [
  { name: 'Negro', hex: '#1a1a1a' },
  { name: 'Blanco', hex: '#f5f5f5' },
  { name: 'Gris', hex: '#888888' },
  { name: 'Rojo', hex: '#dc2626' },
  { name: 'Azul', hex: '#2563eb' },
  { name: 'Verde', hex: '#16a34a' },
  { name: 'Amarillo', hex: '#eab308' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Morado', hex: '#9333ea' },
  { name: 'Beige', hex: '#d4c4a8' },
  { name: 'Marrón', hex: '#92400e' },
  { name: 'Azul marino', hex: '#1e3a5f' },
]

function generateId() {
  return crypto.randomUUID()
}

export function VariantsSection() {
  const form = useCatalogFormStore((s) => s.form)
  const variants = useCatalogFormStore((s) => s.variants)
  const setVariants = useCatalogFormStore((s) => s.setVariants)
  const { t } = useTranslation()
  const isProduct = form.type === 'PRODUCT'

  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [customColor, setCustomColor] = useState('#000000')
  const [customColorName, setCustomColorName] = useState('')
  const [showGenerator, setShowGenerator] = useState(variants.length === 0)

  function addCustomColor() {
    if (!customColorName.trim()) return
    const newColor = { name: customColorName.trim(), hex: customColor }
    if (!selectedColors.find((c) => c.name === newColor.name)) {
      setSelectedColors([...selectedColors, newColor])
    }
    setCustomColorName('')
  }

  function removeColor(name: string) {
    setSelectedColors(selectedColors.filter((c) => c.name !== name))
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  function generateVariants() {
    if (selectedColors.length === 0 || selectedSizes.length === 0) return

    const newVariants = selectedColors.flatMap((color) =>
      selectedSizes.map((size) => ({
        id: generateId(),
        name: `${color.name} / ${size}`,
        color: color.name,
        colorHex: color.hex,
        size,
        sku: `${form.sku || ''}-${color.name.slice(0, 3).toUpperCase()}-${size}`.replace(/^-/, ''),
        price: form.price || 0,
        stock: 0,
        active: true,
      }))
    )

    setVariants(newVariants)
    setShowGenerator(false)
  }

  function updateVariant(id: string, partial: Partial<typeof variants[0]>) {
    setVariants(variants.map((v) => (v.id === id ? { ...v, ...partial } : v)))
  }

  function removeVariant(id: string) {
    setVariants(variants.filter((v) => v.id !== id))
  }

  function toggleAllActive() {
    const allActive = variants.every((v) => v.active)
    setVariants(variants.map((v) => ({ ...v, active: !allActive })))
  }

  if (!isProduct) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Icon icon="lucide:info" className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{t('variants_only_product')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {showGenerator ? (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">{t('generate_variants')}</CardTitle>
            <CardDescription>{t('select_colors_sizes')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>{t('colors_available')}</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => {
                  const selected = selectedColors.find((c) => c.name === color.name)
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() =>
                        selected
                          ? removeColor(color.name)
                          : setSelectedColors([...selectedColors, color])
                      }
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                        selected
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted hover:bg-accent'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-9 w-9 rounded cursor-pointer border border-border p-0.5"
                />
                <Input
                  value={customColorName}
                  onChange={(e) => setCustomColorName(e.target.value)}
                  placeholder={t('custom_color_name')}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomColor}>
                  <Icon icon="lucide:plus" className="h-4 w-4" />
                </Button>
              </div>

              {selectedColors.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon icon="lucide:check-circle" className="h-4 w-4 text-emerald-500" />
                  {selectedColors.length === 1
                    ? t('color_selected', { count: selectedColors.length })
                    : t('colors_selected', { count: selectedColors.length })}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>{t('sizes_available')}</Label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SIZES.map((size) => {
                  const selected = selectedSizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`min-w-[48px] px-3 py-2 rounded-lg text-sm transition-colors ${
                        selected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-accent'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              {selectedSizes.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon icon="lucide:check-circle" className="h-4 w-4 text-emerald-500" />
                  {selectedSizes.length === 1
                    ? t('size_selected', { count: selectedSizes.length })
                    : t('sizes_selected', { count: selectedSizes.length })}
                </div>
              )}
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={selectedColors.length === 0 || selectedSizes.length === 0}
              onClick={generateVariants}
            >
              <Icon icon="lucide:sparkles" className="h-4 w-4 mr-1.5" />
              {t('generate_n_variants').replace('{count}', String(selectedColors.length * selectedSizes.length))}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">
                  {t('variants_count').replace('{count}', String(variants.length))}
                </CardTitle>
                <CardDescription>{t('manage_variants')}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={toggleAllActive}>
                  {variants.every((v) => v.active) ? t('deactivate_all') : t('activate_all')}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowGenerator(true)}>
                  <Icon icon="lucide:refresh-cw" className="h-4 w-4 mr-1" />
                  {t('regenerate')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {variants.map((variant, idx) => (
              <div
                key={variant.id}
                className={`p-3 rounded-lg bg-muted/30 transition-opacity ${
                  !variant.active ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-muted-foreground font-mono w-6">#{idx + 1}</span>
                  {variant.colorHex && (
                    <span
                      className="h-5 w-5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: variant.colorHex }}
                      title={variant.color || ''}
                    />
                  )}
                  <span className="text-sm font-medium flex-1">
                    {variant.color} · {variant.size}
                  </span>
                  <Switch
                    checked={variant.active}
                    onCheckedChange={(v) => updateVariant(variant.id!, { active: v })}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(variant.id!)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Icon icon="lucide:trash-2" className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-9">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{t('sku_variant')}</Label>
                    <Input
                      value={variant.sku || ''}
                      onChange={(e) => updateVariant(variant.id!, { sku: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{t('price_variant')}</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatPriceInput(variant.price)}
                      onChange={(e) => {
                        const { numeric } = handlePriceInput(e.target.value)
                        updateVariant(variant.id!, { price: numeric })
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{t('stock_variant')}</Label>
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(variant.id!, { stock: parseInt(e.target.value) || 0 })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{t('color_name')}</Label>
                    <Input
                      value={variant.color || ''}
                      onChange={(e) => updateVariant(variant.id!, { color: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
