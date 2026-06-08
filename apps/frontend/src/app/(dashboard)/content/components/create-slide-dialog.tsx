'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useContent } from '../hooks/use-content'
import { ImageUpload } from '@/components/image-upload'
import { useTranslation } from '@/i18n/use-translation'

interface Props {
  sectionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateSlideDialog({ sectionId, open, onOpenChange, onSuccess }: Props) {
  const { t } = useTranslation()
  const content = useContent()
  const [image, setImage] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaLink, setCtaLink] = useState('')
  const [textColor, setTextColor] = useState('#ffffff')
  const [buttonColor, setButtonColor] = useState('#2563eb')
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff')
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
      bgColor: '#000000',
      textColor,
      buttonColor,
      buttonTextColor,
    })
    setSubmitting(false)
    onSuccess()
    onOpenChange(false)
    setImage('')
    setTitle('')
    setSubtitle('')
    setCtaText('')
    setCtaLink('')
    setTextColor('#ffffff')
    setButtonColor('#2563eb')
    setButtonTextColor('#ffffff')
  }

  const handleClose = () => {
    if (submitting) return
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-base font-semibold">{t('content_add_slide')}</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Preview - Always visible */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t('content_slide_preview')}</Label>
            <div className="relative rounded-lg overflow-hidden border border-border aspect-video bg-muted">
              {image ? (
                <img src={image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-center">
                    <Icon icon="lucide:image" className="h-12 w-12 mx-auto text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground mt-2">Sube una imagen para ver el preview</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-6 text-center">
                <p 
                  className="text-2xl font-bold"
                  style={{ color: textColor, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {title || 'Título del slide'}
                </p>
                <p 
                  className="text-base mt-2"
                  style={{ color: textColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {subtitle || 'Subtítulo descriptivo'}
                </p>
                {ctaText && (
                  <button
                    className="mt-4 px-6 py-2 rounded-md text-sm font-medium"
                    style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                  >
                    {ctaText}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('content_slide_title_label')} *</Label>
                <ImageUpload value={image} onChange={setImage} folder="slides" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('content_slide_title_label')}</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder={t('content_slide_title_placeholder')}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('content_slide_subtitle_label')}</Label>
                <Input 
                  value={subtitle} 
                  onChange={(e) => setSubtitle(e.target.value)} 
                  placeholder={t('content_slide_subtitle_placeholder')}
                  className="h-9"
                />
              </div>
            </div>

            {/* Right Column - Colors with live preview */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">{t('content_slide_button_label')}</Label>
                  <Input 
                    value={ctaText} 
                    onChange={(e) => setCtaText(e.target.value)} 
                    placeholder={t('content_slide_button_placeholder')}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">{t('content_slide_link_label')}</Label>
                  <Input 
                    value={ctaLink} 
                    onChange={(e) => setCtaLink(e.target.value)} 
                    placeholder={t('content_slide_link_placeholder')}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Color del texto</Label>
                  <p 
                    className="text-sm font-bold px-3 py-1 rounded"
                    style={{ color: textColor, backgroundColor: '#1a1a1a' }}
                  >
                    Preview
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5"
                  />
                  <Input 
                    value={textColor} 
                    onChange={(e) => setTextColor(e.target.value)} 
                    className="h-9 w-24 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Color del botón</Label>
                  <button
                    className="px-4 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                  >
                    Botón
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5"
                  />
                  <Input 
                    value={buttonColor} 
                    onChange={(e) => setButtonColor(e.target.value)} 
                    className="h-9 w-24 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Color texto del botón</Label>
                  <span 
                    className="px-3 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                  >
                    Texto
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={buttonTextColor}
                    onChange={(e) => setButtonTextColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5"
                  />
                  <Input 
                    value={buttonTextColor} 
                    onChange={(e) => setButtonTextColor(e.target.value)} 
                    className="h-9 w-24 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border mt-2">
            <Button variant="outline" onClick={handleClose} disabled={submitting} size="sm">
              {t('cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !image.trim()} size="sm">
              {submitting ? (
                <>
                  <Icon icon="lucide:loader-2" className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  {t('loading')}
                </>
              ) : (
                t('content_add_slide')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
