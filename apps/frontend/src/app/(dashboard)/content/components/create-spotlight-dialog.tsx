'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useContent } from '../hooks/use-content'
import { useCatalog } from '@/app/(dashboard)/catalog/hooks/use-catalog'
import { formatPrice } from '@/lib/utils'

interface Props {
  sectionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateSpotlightDialog({ sectionId, open, onOpenChange, onSuccess }: Props) {
  const content = useContent()
  const catalog = useCatalog()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setSearch('')
      setSelectedId('')
      catalog.fetchItems()
    }
  }, [open])

  const filtered = catalog.items
    .filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 20)

  const handleSubmit = async () => {
    if (!selectedId) return
    setSubmitting(true)
    await content.addSpotlight({ sectionId, catalogItemId: selectedId })
    setSubmitting(false)
    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar producto destacado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Buscar producto</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Escribí para buscar..."
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 rounded-lg border border-border p-1">
            {catalog.loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Cargando productos...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No se encontraron productos</p>
            ) : (
              filtered.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors flex items-center gap-3 ${
                    selectedId === p.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  {p.media?.[0]?.url ? (
                    <img src={p.media[0].url} alt="" className="h-8 w-8 rounded-md object-cover shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded-md bg-background/50 shrink-0 flex items-center justify-center">
                      <Icon icon="lucide:package" className="h-4 w-4 opacity-70" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className={`text-xs ${selectedId === p.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {formatPrice(p.price)}
                    </p>
                  </div>
                  {selectedId === p.id && <Icon icon="lucide:check" className="h-4 w-4 shrink-0" />}
                </button>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={submitting || !selectedId}>
              {submitting ? 'Agregando...' : 'Agregar producto'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
