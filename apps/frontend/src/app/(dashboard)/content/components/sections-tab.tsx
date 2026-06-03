'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ListSkeleton } from '@/components/skeletons'
import { useContent, type Section } from '../hooks/use-content'

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero / Carrusel principal' },
  { value: 'featured', label: 'Productos destacados' },
  { value: 'new_arrivals', label: 'Novedades' },
  { value: 'promo', label: 'Promociones' },
  { value: 'collections', label: 'Colecciones' },
]

export function SectionsTab() {
  const content = useContent()
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [formType, setFormType] = useState('hero')
  const [formTitle, setFormTitle] = useState('')

  const load = async () => {
    setLoading(true)
    const data = await content.fetchSections()
    setSections(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    await content.createSection({ type: formType, title: formTitle || undefined })
    setCreateOpen(false)
    setFormTitle('')
    load()
  }

  const toggleActive = async (section: Section) => {
    await content.updateSection(section.id, { active: !section.active })
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
          Nueva sección
        </Button>
      </div>

      {loading ? (
        <ListSkeleton count={5} />
      ) : sections.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No hay secciones</div>
      ) : (
        <div className="grid gap-3">
          {sections.map((section) => {
            const typeLabel = SECTION_TYPES.find((t) => t.value === section.type)?.label || section.type
            return (
              <Card key={section.id} className="border-0 bg-muted/40">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{section.title || typeLabel}</p>
                    <p className="text-xs text-muted-foreground">{typeLabel} · Orden {section.order}</p>
                  </div>
                  <button
                    onClick={() => toggleActive(section)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      section.active ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      section.active ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-medium">Nueva sección</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex flex-wrap gap-2">
                {SECTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFormType(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      formType === t.value ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título (opcional)</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="ej: Nuestros favoritos" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Crear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
