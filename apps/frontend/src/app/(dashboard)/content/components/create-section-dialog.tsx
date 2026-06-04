'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useContent } from '../hooks/use-content'

const TYPES = [
  { value: 'hero', label: 'Carrusel principal', icon: 'lucide:images', desc: 'Slider de imágenes grande al inicio' },
  { value: 'featured', label: 'Destacados', icon: 'lucide:sparkles', desc: 'Productos que querés destacar' },
  { value: 'new_arrivals', label: 'Novedades', icon: 'lucide:package-plus', desc: 'Últimos productos agregados' },
  { value: 'promo', label: 'Promociones', icon: 'lucide:tag', desc: 'Ofertas y descuentos' },
  { value: 'collections', label: 'Colecciones', icon: 'lucide:layout-grid', desc: 'Grupos de productos' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateSectionDialog({ open, onOpenChange, onSuccess }: Props) {
  const content = useContent()
  const [type, setType] = useState('hero')
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    await content.createSection({ type, title: title || undefined })
    setSubmitting(false)
    onSuccess()
    onOpenChange(false)
    setType('hero')
    setTitle('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva sección</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Una sección es un bloque de contenido en tu página. Elegí el tipo:
          </p>

          <div className="grid gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  type === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${type === t.value ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon icon={t.icon} className={`h-5 w-5 ${type === t.value ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Título (opcional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ej: Nuestros favoritos" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear sección'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
