'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useContent, type Section, type Slide, type Banner } from '../hooks/use-content'
import { ImageUpload } from '@/components/image-upload'
import { useTranslation } from '@/i18n/use-translation'

interface EditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: { kind: 'section'; data: Section } | { kind: 'slide'; data: Slide } | { kind: 'banner'; data: Banner } | null
}

export function EditDrawer({ open, onOpenChange, item }: EditDrawerProps) {
  const { t } = useTranslation()
  const content = useContent()
  const [saving, setSaving] = useState(false)

  // Section form state
  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionActive, setSectionActive] = useState(true)

  // Slide form state
  const [slideImage, setSlideImage] = useState('')
  const [slideTitle, setSlideTitle] = useState('')
  const [slideSubtitle, setSlideSubtitle] = useState('')
  const [slideCtaText, setSlideCtaText] = useState('')
  const [slideCtaLink, setSlideCtaLink] = useState('')
  const [bgColor, setBgColor] = useState('#000000')
  const [textColor, setTextColor] = useState('#ffffff')
  const [buttonColor, setButtonColor] = useState('#2563eb')
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff')
  const [slideActive, setSlideActive] = useState(true)

  // Banner form state
  const [bannerImage, setBannerImage] = useState('')
  const [bannerTitle, setBannerTitle] = useState('')
  const [bannerDescription, setBannerDescription] = useState('')
  const [bannerLink, setBannerLink] = useState('')
  const [bannerPosition, setBannerPosition] = useState('top')
  const [bannerActive, setBannerActive] = useState(true)

  useEffect(() => {
    if (!item) return

    if (item.kind === 'section') {
      setSectionTitle(item.data.title || '')
      setSectionActive(item.data.active)
    } else if (item.kind === 'slide') {
      setSlideImage(item.data.imageUrl || '')
      setSlideTitle(item.data.title || '')
      setSlideSubtitle(item.data.subtitle || '')
      setSlideCtaText(item.data.ctaText || '')
      setSlideCtaLink(item.data.ctaLink || '')
      setBgColor(item.data.bgColor || '#000000')
      setTextColor(item.data.textColor || '#ffffff')
      setButtonColor(item.data.buttonColor || '#2563eb')
      setButtonTextColor(item.data.buttonTextColor || '#ffffff')
      setSlideActive(item.data.active)
    } else if (item.kind === 'banner') {
      setBannerImage(item.data.imageUrl || '')
      setBannerTitle(item.data.title || '')
      setBannerDescription(item.data.description || '')
      setBannerLink(item.data.link || '')
      setBannerPosition(item.data.position || 'top')
      setBannerActive(item.data.active)
    }
  }, [item])

  const handleSave = async () => {
    if (!item) return
    setSaving(true)

    try {
      if (item.kind === 'section') {
        await content.updateSection(item.data.id, {
          title: sectionTitle || undefined,
          active: sectionActive,
        })
      } else if (item.kind === 'slide') {
        await content.updateSlide(item.data.id, {
          imageUrl: slideImage,
          title: slideTitle || undefined,
          subtitle: slideSubtitle || undefined,
          ctaText: slideCtaText || undefined,
          ctaLink: slideCtaLink || undefined,
          bgColor,
          textColor,
          buttonColor,
          buttonTextColor,
          active: slideActive,
        })
      } else if (item.kind === 'banner') {
        await content.updateBanner(item.data.id, {
          imageUrl: bannerImage || undefined,
          title: bannerTitle || undefined,
          description: bannerDescription || undefined,
          link: bannerLink || undefined,
          position: bannerPosition,
          active: bannerActive,
        })
      }
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open && !!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {item && (
          <>
            <DialogHeader className="px-5 py-4 border-b border-border">
              <DialogTitle className="text-base font-semibold">
                {item.kind === 'section' && t('content_edit_section')}
                {item.kind === 'slide' && t('content_edit_slide')}
                {item.kind === 'banner' && t('content_edit_banner')}
              </DialogTitle>
            </DialogHeader>

            <div className="p-5 space-y-4">
          {/* Slide Preview with Controls */}
          {item.kind === 'slide' && (
            <div className="space-y-4">
              {/* Preview */}
              <div 
                className="relative rounded-xl overflow-hidden border border-border aspect-[16/9] shadow-lg"
                style={{ backgroundColor: bgColor }}
              >
                {slideImage ? (
                  <img src={slideImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                    <div className="text-center">
                      <Icon icon="lucide:image" className="h-16 w-16 mx-auto text-white/30" />
                      <p className="text-sm text-white/50 mt-2">Sin imagen de fondo</p>
                    </div>
                  </div>
                )}
                
                {/* Overlay with content */}
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                  style={{ backgroundColor: `${bgColor}99` }}
                >
                  <p 
                    className="text-3xl font-bold leading-tight"
                    style={{ color: textColor, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                  >
                    {slideTitle || 'Título del slide'}
                  </p>
                  <p 
                    className="text-lg mt-3 max-w-lg"
                    style={{ color: textColor, textShadow: '0 1px 4px rgba(0,0,0,0.3)', opacity: 0.9 }}
                  >
                    {slideSubtitle || 'Subtítulo descriptivo'}
                  </p>
                  {slideCtaText && (
                    <button
                      className="mt-6 px-6 py-2 rounded-sm text-sm font-semibold shadow-lg transition-transform hover:scale-105"
                      style={{ 
                        backgroundColor: buttonColor, 
                        color: buttonTextColor,
                        
                      }}
                    >
                      {slideCtaText}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Color Controls Row */}
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Fondo</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer shrink-0"
                    />
                    <Input 
                      value={bgColor} 
                      onChange={(e) => setBgColor(e.target.value)} 
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Texto</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer shrink-0"
                    />
                    <Input 
                      value={textColor} 
                      onChange={(e) => setTextColor(e.target.value)} 
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Botón</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer shrink-0"
                    />
                    <Input 
                      value={buttonColor} 
                      onChange={(e) => setButtonColor(e.target.value)} 
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Texto botón</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer shrink-0"
                    />
                    <Input 
                      value={buttonTextColor} 
                      onChange={(e) => setButtonTextColor(e.target.value)} 
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('content_slide_title_label')}</Label>
                <ImageUpload value={slideImage} onChange={setSlideImage} folder="slides" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              {item.kind === 'banner' && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">{t('content_banner_title_label')}</Label>
                  <ImageUpload value={bannerImage} onChange={setBannerImage} folder="banners" />
                </div>
              )}

              {item.kind === 'section' && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">{t('content_section_title_label')}</Label>
                  <Input
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder={t('content_section_title_label')}
                    className="h-9"
                  />
                </div>
              )}

              {(item.kind === 'slide' || item.kind === 'banner') && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{t('content_slide_title_label')}</Label>
                    <Input 
                      value={item.kind === 'slide' ? slideTitle : bannerTitle} 
                      onChange={(e) => item.kind === 'slide' ? setSlideTitle(e.target.value) : setBannerTitle(e.target.value)} 
                      placeholder={t('content_slide_title_placeholder')}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{item.kind === 'slide' ? t('content_slide_subtitle_label') : t('content_banner_description_label')}</Label>
                    <Input 
                      value={item.kind === 'slide' ? slideSubtitle : bannerDescription} 
                      onChange={(e) => item.kind === 'slide' ? setSlideSubtitle(e.target.value) : setBannerDescription(e.target.value)} 
                      placeholder={item.kind === 'slide' ? t('content_slide_subtitle_placeholder') : 'Descripción'}
                      className="h-9"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {item.kind === 'slide' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">{t('content_slide_button_label')}</Label>
                      <Input 
                        value={slideCtaText} 
                        onChange={(e) => setSlideCtaText(e.target.value)} 
                        placeholder={t('content_slide_button_placeholder')}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">{t('content_slide_link_label')}</Label>
                      <Input 
                        value={slideCtaLink} 
                        onChange={(e) => setSlideCtaLink(e.target.value)} 
                        placeholder={t('content_slide_link_placeholder')}
                        className="h-9"
                      />
                    </div>
                  </div>
                </>
              )}

              {item.kind === 'banner' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{t('content_banner_link_label')}</Label>
                    <Input 
                      value={bannerLink} 
                      onChange={(e) => setBannerLink(e.target.value)} 
                      placeholder="/promos"
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{t('content_banner_position_label')}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['top', 'middle', 'bottom'] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setBannerPosition(pos)}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            bannerPosition === pos ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'
                          }`}
                        >
                          {pos === 'top' && t('content_banner_position_top')}
                          {pos === 'middle' && t('content_banner_position_middle')}
                          {pos === 'bottom' && t('content_banner_position_bottom')}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{item.kind === 'section' ? t('content_section_active_label') : item.kind === 'slide' ? 'Activo' : t('content_banner_active_label')}</p>
                  <p className="text-xs text-muted-foreground">{item.kind === 'section' ? t('content_section_active_hint') : item.kind === 'slide' ? 'Mostrar en el carrusel' : t('content_banner_active_hint')}</p>
                </div>
                <Switch 
                  checked={item.kind === 'section' ? sectionActive : item.kind === 'slide' ? slideActive : bannerActive} 
                  onCheckedChange={item.kind === 'section' ? setSectionActive : item.kind === 'slide' ? setSlideActive : setBannerActive} 
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border mt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} size="sm">
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? (
                <>
                  <Icon icon="lucide:loader-2" className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  {t('loading')}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </div>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
