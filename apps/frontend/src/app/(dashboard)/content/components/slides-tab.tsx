'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ListSkeleton } from '@/components/skeletons'
import { useContent, type Slide, type Section } from '../hooks/use-content'

export function SlidesTab() {
  const content = useContent()
  const [sections, setSections] = useState<Section[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState('')

  const [formImage, setFormImage] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formSubtitle, setFormSubtitle] = useState('')
  const [formCtaText, setFormCtaText] = useState('')
  const [formCtaLink, setFormCtaLink] = useState('')

  const load = async () => {
    setLoading(true)
    const secs = await content.fetchSections()
    setSections(secs || [])
    const hero = secs?.find((s) => s.type === 'hero')
    if (hero) {
      setSelectedSection(hero.id)
      const allSlides = await content.fetchSlides(hero.id)
      setSlides(allSlides || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSectionChange = async (id: string) => {
    setSelectedSection(id)
    const data = await content.fetchSlides(id)
    setSlides(data || [])
  }

  const handleCreate = async () => {
    if (!selectedSection) return
    await content.createSlide({
      sectionId: selectedSection,
      imageUrl: formImage,
      title: formTitle || undefined,
      subtitle: formSubtitle || undefined,
      ctaText: formCtaText || undefined,
      ctaLink: formCtaLink || undefined,
    })
    setCreateOpen(false)
    setFormImage('')
    setFormTitle('')
    setFormSubtitle('')
    setFormCtaText('')
    setFormCtaLink('')
    handleSectionChange(selectedSection)
  }

  const toggleActive = async (slide: Slide) => {
    await content.updateSlide(slide.id, { active: !slide.active })
    handleSectionChange(selectedSection)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select
          value={selectedSection}
          onChange={(e) => handleSectionChange(e.target.value)}
          className="h-9 px-3 rounded-lg bg-muted text-sm border-0"
        >
          {sections.filter((s) => s.type === 'hero').map((s) => (
            <option key={s.id} value={s.id}>{s.title || 'Hero'}</option>
          ))}
          {sections.filter((s) => s.type !== 'hero').map((s) => (
            <option key={s.id} value={s.id}>{s.title || s.type}</option>
          ))}
        </select>
        <Button onClick={() => setCreateOpen(true)} disabled={!selectedSection}>
          <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
          Nuevo slide
        </Button>
      </div>

      {loading ? (
        <ListSkeleton count={5} />
      ) : slides.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No hay slides</div>
      ) : (
        <div className="grid gap-3">
          {slides.map((slide) => (
            <Card key={slide.id} className="border-0 bg-muted/40 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {slide.imageUrl && (
                    <div className="w-32 h-20 bg-muted shrink-0">
                      <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{slide.title || 'Sin título'}</p>
                      <p className="text-xs text-muted-foreground">{slide.subtitle || 'Sin subtítulo'}</p>
                      {slide.ctaText && (
                        <span className="text-xs text-primary mt-1 inline-block">{slide.ctaText} →</span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleActive(slide)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        slide.active ? 'bg-primary' : 'bg-input'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        slide.active ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">Nuevo slide</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>URL de imagen</Label>
              <Input value={formImage} onChange={(e) => setFormImage(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input value={formSubtitle} onChange={(e) => setFormSubtitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Texto del botón</Label>
                <Input value={formCtaText} onChange={(e) => setFormCtaText(e.target.value)} placeholder="Ver más" />
              </div>
              <div className="space-y-2">
                <Label>Link del botón</Label>
                <Input value={formCtaLink} onChange={(e) => setFormCtaLink(e.target.value)} placeholder="/catalog/..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!formImage.trim()}>Crear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
