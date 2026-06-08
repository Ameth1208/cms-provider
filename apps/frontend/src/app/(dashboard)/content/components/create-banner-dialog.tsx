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
  { value: 'top', label: 'Arriba', desc: 'Antes de todo el contenido', icon: 'lucide:arrow-up' },
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
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-base font-semibold">Nuevo banner</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Vista previa</Label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon icon="lucide:eye" className="h-3.5 w-3.5" />
                Vista previa en tiempo real
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-border aspect-[21/9] shadow-lg bg-muted">
              {image ? (
                <img src={image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Icon icon="lucide:image" className="h-16 w-16 mx-auto text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground mt-2">Sin imagen</p>
                  </div>
                </div>
              )}
              
              {/* Text overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex items-center p-8">
                <div className="max-w-md">
                  <p className="text-2xl font-bold text-white">
                    {title || 'Título del banner'}
                  </p>
                  <p className="text-base text-white/80 mt-2">
                    {description || 'Descripción del banner'}
                  </p>
                  {link && (
                    <span className="inline-block mt-4 px-5 py-2 rounded-lg bg-white text-black text-sm font-medium">
                      Ver más →
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Imagen</Label>
                <ImageUpload value={image} onChange={setImage} folder="banners" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Título</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="ej: Envío gratis"
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Descripción</Label>
                <Input 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="ej: En compras mayores a $50"
                  className="h-9"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Link</Label>
                <Input 
                  value={link} 
                  onChange={(e) => setLink(e.target.value)} 
                  placeholder="/catalog/..."
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Posición</Label>
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
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border mt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} size="sm">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} size="sm">
              {submitting ? (
                <>
                  <Icon icon="lucide:loader-2" className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear banner'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
