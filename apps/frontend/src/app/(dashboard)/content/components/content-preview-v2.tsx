'use client'

import { useState, useEffect, useMemo } from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { type Section, type Slide, type Banner, type Spotlight } from '../hooks/use-content'

interface ContentPreviewV2Props {
  sections: Section[]
  slides: Slide[]
  banners: Banner[]
  spotlights: Spotlight[]
}

export function ContentPreviewV2({ sections, slides, banners, spotlights }: ContentPreviewV2Props) {
  const { t } = useTranslation()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Filter active items and sort by order
  const activeSections = useMemo(() => 
    sections.filter((s) => s.active).sort((a, b) => a.order - b.order),
    [sections]
  )
  
  const activeSlides = useMemo(() => 
    slides.filter((s) => s.active),
    [slides]
  )
  
  const activeBanners = useMemo(() => 
    banners.filter((b) => b.active).sort((a, b) => a.order - b.order),
    [banners]
  )

  // Auto-rotate slides
  useEffect(() => {
    if (activeSlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [activeSlides])

  // Group banners by position
  const topBanners = activeBanners.filter((b) => b.position === 'top')
  const middleBanners = activeBanners.filter((b) => b.position === 'middle')
  const bottomBanners = activeBanners.filter((b) => b.position === 'bottom')

  // Split middle banners between sections
  const middleBannersPerSection = Math.ceil(middleBanners.length / Math.max(activeSections.length, 1))

  const hasAnyContent = activeSections.length > 0 || activeBanners.length > 0

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm bg-background">
      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {hasAnyContent ? (
          <>
            {/* Top Banners */}
            {topBanners.map((banner) => (
              <PreviewBanner key={banner.id} banner={banner} />
            ))}

            {/* Sections */}
            {activeSections.map((section, sectionIndex) => {
              const sectionSlides = slides
                .filter((s) => s.sectionId === section.id && s.active)
                .sort((a, b) => a.order - b.order)

              const sectionSpotlights = spotlights
                .filter((s) => s.sectionId === section.id)
                .sort((a, b) => a.order - b.order)

              const startIdx = sectionIndex * middleBannersPerSection
              const sectionMiddleBanners = middleBanners.slice(startIdx, startIdx + middleBannersPerSection)

              return (
                <div key={section.id} className="space-y-3">
                  {/* Section Title */}
                  {(section.title || section.type !== 'hero') && (
                    <div className="flex items-center gap-2 pt-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.title || getSectionLabel(section.type, t)}
                      </p>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}

                  {/* Hero: Slides */}
                  {section.type === 'hero' && (
                    <>
                      {sectionSlides.length > 0 ? (
                        <div className="relative h-72 bg-muted rounded-lg overflow-hidden">
                          {sectionSlides.map((slide, index) => (
                            <div
                              key={slide.id}
                              className={`absolute inset-0 transition-opacity duration-500 ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0'
                              }`}
                              style={{ backgroundColor: slide.bgColor || '#000' }}
                            >
                              {slide.imageUrl ? (
                                <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                  <Icon icon="lucide:image" className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-5">
                                <p className="text-base font-bold" style={{ color: slide.textColor || 'white' }}>
                                  {slide.title || t('content_slide_title_label')}
                                </p>
                                <p
                                  className="text-sm mt-1"
                                  style={{
                                    color: slide.textColor ? `${slide.textColor}cc` : 'rgba(255,255,255,0.8)',
                                  }}
                                >
                                  {slide.subtitle || t('content_slide_subtitle_label')}
                                </p>
                                {slide.ctaText && (
                                  <button
                                    className="mt-3 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                    style={{
                                      backgroundColor: slide.buttonColor || '#fff',
                                      color: slide.buttonTextColor || '#000',
                                    }}
                                  >
                                    {slide.ctaText}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          {sectionSlides.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {sectionSlides.map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1 rounded-full ${
                                    i === currentSlide ? 'w-4 bg-white' : 'w-1 bg-white/50'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-32 bg-muted/60 rounded-lg flex items-center justify-center border border-dashed border-border">
                          <p className="text-xs text-muted-foreground">{t('content_no_slides')}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Featured/New Arrivals: Product Grid */}
                  {(section.type === 'featured' || section.type === 'new_arrivals') && (
                    <>
                      {sectionSpotlights.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {sectionSpotlights.slice(0, 6).map((spot) => (
                            <div key={spot.id} className="bg-muted/40 rounded-lg overflow-hidden">
                              <div className="aspect-square bg-muted">
                                {spot.catalogItem?.media?.[0]?.url ? (
                                  <img src={spot.catalogItem.media[0].url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Icon icon="lucide:package" className="h-6 w-6 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                              <div className="p-1.5">
                                <p className="text-[10px] font-medium truncate">
                                  {spot.catalogItem?.name || 'Producto'}
                                </p>
                                {spot.catalogItem?.price && (
                                  <p className="text-[10px] text-muted-foreground">${spot.catalogItem.price}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-24 bg-muted/60 rounded-lg flex items-center justify-center border border-dashed border-border">
                          <p className="text-xs text-muted-foreground">{t('content_no_spotlights')}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Promo/Collections */}
                  {(section.type === 'promo' || section.type === 'collections') && (
                    <div className="h-24 bg-muted/60 rounded-lg flex items-center justify-center border border-dashed border-border">
                      <div className="text-center">
                        <Icon icon="lucide:layout-grid" className="h-6 w-6 mx-auto mb-1 text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground">
                          {section.type === 'promo' ? t('content_section_promo') : t('content_section_collections')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Middle banners */}
                  {sectionMiddleBanners.map((banner) => (
                    <PreviewBanner key={banner.id} banner={banner} />
                  ))}
                </div>
              )
            })}

            {/* Bottom Banners */}
            {bottomBanners.map((banner) => (
              <PreviewBanner key={banner.id} banner={banner} />
            ))}
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Icon icon="lucide:layout-template" className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{t('content_no_active_content')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('content_add_sections_hint')}</p>
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
          {banner.description && <p className="text-[10px] opacity-80 mt-0.5">{banner.description}</p>}
        </div>
      </div>
    </div>
  )
}

function getSectionLabel(type: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    hero: t('content_section_hero'),
    featured: t('content_section_featured'),
    new_arrivals: t('content_section_new_arrivals'),
    promo: t('content_section_promo'),
    collections: t('content_section_collections'),
  }
  return labels[type] || type
}
