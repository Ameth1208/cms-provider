'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useContent } from '../hooks/use-content'
import { ImageUpload } from '@/components/image-upload'

const POSITIONS = [
  { value: 'top', label: 'Arriba', desc: 'Aparece antes de todo el contenido', icon: 'lucide:arrow-up' },
  { value: 'middle', label: 'En medio', desc: 'Entre las secciones', icon: 'lucide:align-center-vertical' },
  { value: 'bottom', label: 'Abajo', desc: 'Al final de la página', icon: 'lucide:arrow-down' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateBannerDialog({ open, onOpenChange, onSuccess }: Props) {
  const content = useContent()
  const [image, setImage] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [position, setPosition] = useState('middle')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    await content.createBanner({
      imageUrl: image || undefined,
      title: title || undefined,
      description: description || undefined,
      link: link || undefined,
      position,
    })
    setSubmitting(false)
    onSuccess()
    onOpenChange(false)
    setImage('')
    setTitle('')
    setDescription('')
    setLink('')
    setPosition('middle')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo banner</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Los banners son anuncios que aparecen en la página, fuera de las secciones.
          </p>

          <div className="space-y-2">
            <Label>Imagen</Label>
            <ImageUpload value={image} onChange={setImage} folder="banners" />
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ej: Envío gratis" />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ej: En compras mayores a $50" />
          </div>
          <div className="space-y-2">
            <Label>Link</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/catalog/..." />
          </div>

          <div className="space-y-2">
            <Label>Dónde aparece</Label>
            <div className="grid gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setPosition(pos.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    position === pos.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${position === pos.value ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon icon={pos.icon} className={`h-4 w-4 ${position === pos.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pos.label}</p>
                    <p className="text-xs text-muted-foreground">{pos.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear banner'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
