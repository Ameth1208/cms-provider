'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useContent } from '../hooks/use-content'
import { ImageUpload } from '@/components/image-upload'

interface Props {
  sectionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const PRESET_COLORS = [
  { bg: '#000000', text: '#ffffff', btn: '#ffffff', btnText: '#000000' },
  { bg: '#ffffff', text: '#000000', btn: '#000000', btnText: '#ffffff' },
  { bg: '#dc2626', text: '#ffffff', btn: '#ffffff', btnText: '#dc2626' },
  { bg: '#2563eb', text: '#ffffff', btn: '#ffffff', btnText: '#2563eb' },
  { bg: '#059669', text: '#ffffff', btn: '#ffffff', btnText: '#059669' },
  { bg: '#7c3aed', text: '#ffffff', btn: '#ffffff', btnText: '#7c3aed' },
]

export function CreateSlideDialog({ sectionId, open, onOpenChange, onSuccess }: Props) {
  const content = useContent()
  const [image, setImage] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaLink, setCtaLink] = useState('')
  const [bgColor, setBgColor] = useState('#000000')
  const [textColor, setTextColor] = useState('#ffffff')
  const [buttonColor, setButtonColor] = useState('#ffffff')
  const [buttonTextColor, setButtonTextColor] = useState('#000000')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!image.trim()) return
    setSubmitting(true)
    await content.createSlide({
      sectionId,
      imageUrl: image,
      title: title || undefined,
      subtitle: subtitle || undefined,
      ctaText: ctaText || undefined,
      ctaLink: ctaLink || undefined,
      bgColor,
      textColor,
      buttonColor,
      buttonTextColor,
    })
    setSubmitting(false)
    onSuccess()
    onOpenChange(false)
    // Reset
    setImage('')
    setTitle('')
    setSubtitle('')
    setCtaText('')
    setCtaLink('')
    setBgColor('#000000')
    setTextColor('#ffffff')
    setButtonColor('#ffffff')
    setButtonTextColor('#000000')
  }

  const applyPreset = (preset: typeof PRESET_COLORS[0]) => {
    setBgColor(preset.bg)
    setTextColor(preset.text)
    setButtonColor(preset.btn)
    setButtonTextColor(preset.btnText)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva imagen del carrusel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Imagen *</Label>
            <ImageUpload value={image} onChange={setImage} folder="slides" />
          </div>

          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ej: Nueva colección 2024" />
          </div>

          <div className="space-y-2">
            <Label>Subtítulo</Label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="ej: Descubrí las últimas tendencias" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Texto del botón</Label>
              <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Ver más" />
            </div>
            <div className="space-y-2">
              <Label>Link del botón</Label>
              <Input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="/catalog/..." />
            </div>
          </div>

          {/* Preview */}
          {(image || title || subtitle || ctaText) && (
            <div className="space-y-2">
              <Label>Vista previa</Label>
              <div 
                className="relative h-32 rounded-lg overflow-hidden"
                style={{ backgroundColor: bgColor }}
              >
                {image && (
                  <img src={image} alt="" className="w-full h-full object-cover opacity-80" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-lg font-bold" style={{ color: textColor }}>
                    {title || 'Título'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: textColor, opacity: 0.8 }}>
                    {subtitle || 'Subtítulo'}
                  </p>
                  {ctaText && (
                    <button
                      className="mt-2 px-4 py-1 rounded-md text-sm font-medium"
                      style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                    >
                      {ctaText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Color presets */}
          <div className="space-y-2">
            <Label>Colores rápidos</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => applyPreset(preset)}
                  className="h-8 w-8 rounded-lg border-2 border-border hover:border-primary transition-colors"
                  style={{ backgroundColor: preset.bg }}
                  title="Aplicar combinación"
                />
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fondo</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-9 rounded-md border border-border cursor-pointer"
                />
                <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Texto</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-9 w-9 rounded-md border border-border cursor-pointer"
                />
                <Input value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Botón</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  className="h-9 w-9 rounded-md border border-border cursor-pointer"
                />
                <Input value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Texto del botón</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={buttonTextColor}
                  onChange={(e) => setButtonTextColor(e.target.value)}
                  className="h-9 w-9 rounded-md border border-border cursor-pointer"
                />
                <Input value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={submitting || !image.trim()}>
              {submitting ? 'Creando...' : 'Agregar imagen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
