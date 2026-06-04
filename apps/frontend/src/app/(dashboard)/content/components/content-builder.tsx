'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { useContent } from '../hooks/use-content'
import { SectionCard } from './section-card'
import { SlideItem } from './slide-item'
import { SpotlightItem } from './spotlight-item'
import { BannerCard } from './banner-card'
import { CreateSectionDialog } from './create-section-dialog'
import { CreateSlideDialog } from './create-slide-dialog'
import { CreateSpotlightDialog } from './create-spotlight-dialog'
import { CreateBannerDialog } from './create-banner-dialog'
import { ContentPreview } from './content-preview'
import { ListSkeleton } from '@/components/skeletons'

export function ContentBuilder() {
  const content = useContent()
  const { items, loading } = content

  const [createSectionOpen, setCreateSectionOpen] = useState(false)
  const [createSlideOpen, setCreateSlideOpen] = useState(false)
  const [createSpotlightOpen, setCreateSpotlightOpen] = useState(false)
  const [createBannerOpen, setCreateBannerOpen] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState('')

  const sections = items.filter((i) => i.kind === 'section')
  const slides = items.filter((i) => i.kind === 'slide')
  const banners = items.filter((i) => i.kind === 'banner')
  const spotlights = items.filter((i) => i.kind === 'spotlight')

  const getSlides = (id: string) => slides.filter((s) => s.sectionId === id).sort((a, b) => a.order - b.order)
  const getSpotlights = (id: string) => spotlights.filter((s) => s.sectionId === id).sort((a, b) => a.order - b.order)

  const handleAddSlide = (sectionId: string) => {
    setActiveSectionId(sectionId)
    setCreateSlideOpen(true)
  }

  const handleAddSpotlight = (sectionId: string) => {
    setActiveSectionId(sectionId)
    setCreateSpotlightOpen(true)
  }

  const refresh = () => content.refresh()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Contenido del sitio</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Organizá secciones y banners de tu homepage</p>
          </div>
          <Button size="sm" onClick={() => setCreateSectionOpen(true)}>
            <Icon icon="lucide:plus" className="h-4 w-4 mr-1.5" />
            Nueva sección
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:layout-grid" className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Secciones</p>
          </div>

          {loading ? (
            <ListSkeleton count={2} />
          ) : sections.length === 0 ? (
            <button
              onClick={() => setCreateSectionOpen(true)}
              className="w-full py-10 border-2 border-dashed border-border rounded-xl hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col items-center gap-3"
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Icon icon="lucide:plus" className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Creá tu primera sección</p>
              <p className="text-xs text-muted-foreground max-w-[240px] text-center">
                Una sección es un bloque de contenido, como un carrusel o productos destacados
              </p>
            </button>
          ) : (
            sections
              .sort((a, b) => a.order - b.order)
              .map((section) => {
                const sectionSlides = getSlides(section.id)
                const sectionSpotlights = getSpotlights(section.id)
                const hasSlides = section.type === 'hero'
                const hasSpotlights = section.type === 'featured' || section.type === 'new_arrivals'

                return (
                  <SectionCard key={section.id} section={section}>
                    {hasSlides && (
                      <>
                        {sectionSlides.length === 0 ? (
                          <button
                            onClick={() => handleAddSlide(section.id)}
                            className="w-full py-6 border-2 border-dashed border-border rounded-lg hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col items-center gap-2"
                          >
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <Icon icon="lucide:plus" className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">Agregar primera imagen al carrusel</p>
                            <p className="text-xs text-muted-foreground">Hacé click para subir una imagen</p>
                          </button>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-muted-foreground">Imágenes del carrusel</p>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleAddSlide(section.id)}>
                                <Icon icon="lucide:plus" className="h-3.5 w-3.5 mr-1" />
                                Agregar
                              </Button>
                            </div>
                            {sectionSlides.map((slide) => (
                              <SlideItem key={slide.id} slide={slide} />
                            ))}
                          </>
                        )}
                      </>
                    )}

                    {hasSpotlights && (
                      <>
                        {sectionSpotlights.length === 0 ? (
                          <button
                            onClick={() => handleAddSpotlight(section.id)}
                            className="w-full py-6 border-2 border-dashed border-border rounded-lg hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col items-center gap-2"
                          >
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <Icon icon="lucide:plus" className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">Agregar productos destacados</p>
                            <p className="text-xs text-muted-foreground">Hacé click para elegir productos del catálogo</p>
                          </button>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-muted-foreground">Productos destacados</p>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleAddSpotlight(section.id)}>
                                <Icon icon="lucide:plus" className="h-3.5 w-3.5 mr-1" />
                                Agregar
                              </Button>
                            </div>
                            {sectionSpotlights.map((spotlight) => (
                              <SpotlightItem key={spotlight.id} spotlight={spotlight} />
                            ))}
                          </>
                        )}
                      </>
                    )}

                    {!hasSlides && !hasSpotlights && (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Esta sección se renderiza automáticamente según su tipo.
                      </p>
                    )}
                  </SectionCard>
                )
              })
          )}
        </div>

        <div className="border-t border-border" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:panel-top" className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Banners</p>
            </div>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setCreateBannerOpen(true)}>
              <Icon icon="lucide:plus" className="h-3.5 w-3.5 mr-1" />
              Agregar banner
            </Button>
          </div>

          {banners.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No hay banners. Son anuncios que aparecen en distintas partes de la página.
            </p>
          ) : (
            <div className="space-y-2">
              {banners.map((banner) => (
                <BannerCard key={banner.id} banner={banner} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Vista previa</h2>
        <ContentPreview
          sections={sections as any}
          slides={slides as any}
          banners={banners as any}
          spotlights={spotlights as any}
        />
      </div>

      <CreateSectionDialog open={createSectionOpen} onOpenChange={setCreateSectionOpen} onSuccess={refresh} />
      <CreateSlideDialog sectionId={activeSectionId} open={createSlideOpen} onOpenChange={setCreateSlideOpen} onSuccess={refresh} />
      <CreateSpotlightDialog sectionId={activeSectionId} open={createSpotlightOpen} onOpenChange={setCreateSpotlightOpen} onSuccess={refresh} />
      <CreateBannerDialog open={createBannerOpen} onOpenChange={setCreateBannerOpen} onSuccess={refresh} />
    </div>
  )
}
