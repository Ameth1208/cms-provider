'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'

import { type Section, type Slide, type Banner, type Spotlight } from '../hooks/use-content'

interface ContentPreviewProps {
  sections: Section[]
  slides: Slide[]
  banners: Banner[]
  spotlights: Spotlight[]
}

export function ContentPreview({ sections, slides, banners, spotlights }: ContentPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [slides])

  const activeSections = sections.filter((s) => s.active)
  const activeSlides = slides.filter((s) => s.active)
  const activeBanners = banners.filter((b) => b.active)
  const topBanners = activeBanners.filter((b) => b.position === 'top')
  const middleBanners = activeBanners.filter((b) => b.position === 'middle')
  const bottomBanners = activeBanners.filter((b) => b.position === 'bottom')

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <Icon icon="lucide:eye" className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <p className="text-[11px] text-amber-800 dark:text-amber-400">
          Vista previa aproximada. El diseño final depende del tema.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Top Banners */}
        {topBanners.map((banner) => (
          <PreviewBanner key={banner.id} banner={banner} />
        ))}

        {/* Hero */}
        {activeSlides.length > 0 && (
          <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
            {activeSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                style={{ backgroundColor: slide.bgColor || undefined }}
              >
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Icon icon="lucide:image" className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p 
                    className="text-base font-bold"
                    style={{ color: slide.textColor || 'white' }}
                  >
                    {slide.title || 'Título'}
                  </p>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: slide.textColor ? `${slide.textColor}cc` : 'rgba(255,255,255,0.8)' }}
                  >
                    {slide.subtitle || 'Subtítulo'}
                  </p>
                  
                  {slide.ctaText && (
                    <button
                      className="mt-3 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: slide.buttonColor || '#fff',
                        color: slide.buttonTextColor || '#000',
                      }}
                    >
                      {slide.ctaText} →
                    </button>
                  )}
                </div>
              </div>
            ))}

            {activeSlides.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {activeSlides.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full ${i === currentSlide ? 'w-4 bg-white' : 'w-1 bg-white/50'}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Middle Banners */}
        {middleBanners.map((banner) => (
          <PreviewBanner key={banner.id} banner={banner} />
        ))}

        {/* Featured Products */}
        {spotlights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">Destacados</p>
              <span className="text-[10px] text-muted-foreground">Ver todos →</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {spotlights.slice(0, 3).map((s) => (
                <div key={s.id} className="bg-muted/40 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-muted">
                    {s.catalogItem?.media?.[0]?.url ? (
                      <img src={s.catalogItem.media[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon icon="lucide:package" className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-1.5">
                    <p className="text-[10px] font-medium truncate">{s.catalogItem?.name || 'Producto'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Banners */}
        {bottomBanners.map((banner) => (
          <PreviewBanner key={banner.id} banner={banner} />
        ))}

        {/* Empty */}
        {activeSections.length === 0 && activeSlides.length === 0 && activeBanners.length === 0 && spotlights.length === 0 && (
          <div className="py-8 text-center">
            <Icon icon="lucide:layout-template" className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Sin contenido activo</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PreviewBanner({ banner }: { banner: Banner }) {
  return (
    <div className="relative h-20 bg-muted rounded-lg overflow-hidden">
      {banner.imageUrl ? (
        <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-center">
          <Icon icon="lucide:panel-top" className="h-6 w-6 text-muted-foreground/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xs font-medium">{banner.title || 'Banner'}</p>
        </div>
      </div>
    </div>
  )
}
