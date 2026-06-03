'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useContent, type Section, type Slide, type Banner, type Spotlight } from '../hooks/use-content'
import { ContentPreview } from './content-preview'
import { ListSkeleton } from '@/components/skeletons'

type ContentItem = 
  | ({ kind: 'section' } & Section)
  | ({ kind: 'slide' } & Slide)
  | ({ kind: 'banner' } & Banner)
  | ({ kind: 'spotlight' } & Spotlight)

interface DraggableItemProps {
  item: ContentItem
  index: number
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDrop: () => void
  onToggle: (item: ContentItem) => void
  onEdit: (item: ContentItem) => void
  onDelete: (item: ContentItem) => void
}

function DraggableItem({ item, index, onDragStart, onDragOver, onDrop, onToggle, onEdit, onDelete }: DraggableItemProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart(index)
    e.dataTransfer.effectAllowed = 'move'
    // Set drag image
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    e.dataTransfer.setDragImage(e.target as HTMLElement, e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    onDragOver(index)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop()
  }

  const getIcon = () => {
    switch (item.kind) {
      case 'section':
        return 'lucide:layout-grid'
      case 'slide':
        return 'lucide:image'
      case 'banner':
        return 'lucide:panel-top'
      case 'spotlight':
        return 'lucide:sparkles'
    }
  }

  const getLabel = () => {
    switch (item.kind) {
      case 'section':
        return item.title || item.type
      case 'slide':
        return item.title || 'Slide'
      case 'banner':
        return item.title || 'Banner'
      case 'spotlight':
        return item.catalogItem?.name || 'Producto'
    }
  }

  const getSubtitle = () => {
    switch (item.kind) {
      case 'section':
        return `Orden: ${item.order}`
      case 'slide':
        return item.subtitle || ''
      case 'banner':
        return item.position || ''
      case 'spotlight':
        return `$${item.catalogItem?.price || 0}`
    }
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-move ${
        isDragging 
          ? 'opacity-50 border-primary shadow-lg' 
          : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted shrink-0">
        <Icon icon={getIcon()} className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{getLabel()}</p>
        <p className="text-xs text-muted-foreground">{getSubtitle()}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggle(item)}
          className={`p-1.5 rounded-md transition-colors ${
            'active' in item && item.active
              ? 'text-emerald-600 hover:bg-emerald-50'
              : 'text-muted-foreground hover:bg-muted'
          }`}
          title={('active' in item && item.active) ? 'Activo' : 'Inactivo'}
        >
          <Icon 
            icon={('active' in item && item.active) ? 'lucide:eye' : 'lucide:eye-off'} 
            className="h-3.5 w-3.5" 
          />
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          title="Editar"
        >
          <Icon icon="lucide:pencil" className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Eliminar"
        >
          <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="shrink-0 text-muted-foreground">
        <Icon icon="lucide:grip-vertical" className="h-4 w-4" />
      </div>
    </div>
  )
}

export function ContentBuilder() {
  const content = useContent()
  const { items, setItems, loading, refresh } = content
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  const [editItem, setEditItem] = useState<ContentItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return
    setDragOverIndex(index)
  }

  const handleDrop = () => {
    if (draggedIndex === null || dragOverIndex === null) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newItems = [...items]
    const [removed] = newItems.splice(draggedIndex, 1)
    newItems.splice(dragOverIndex, 0, removed)
    
    // Update order
    newItems.forEach((item, index) => {
      if ('order' in item) {
        item.order = index
      }
    })

    setItems(newItems)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleToggle = async (item: ContentItem) => {
    if (!('active' in item)) return
    
    const newActive = !item.active
    
    switch (item.kind) {
      case 'section':
        await content.updateSection(item.id, { active: newActive })
        break
      case 'slide':
        await content.updateSlide(item.id, { active: newActive })
        break
      case 'banner':
        await content.updateBanner(item.id, { active: newActive })
        break
    }
    
    refresh()
  }

  const handleEdit = (item: ContentItem) => {
    setEditItem(item)
    setEditOpen(true)
  }

  const handleDelete = async (item: ContentItem) => {
    if (!confirm('¿Eliminar este elemento?')) return
    
    switch (item.kind) {
      case 'section':
        await content.deleteSection(item.id)
        break
      case 'slide':
        await content.deleteSlide(item.id)
        break
      case 'banner':
        await content.deleteBanner(item.id)
        break
      case 'spotlight':
        await content.removeSpotlight(item.id)
        break
    }
    
    refresh()
  }

  const handleSaveEdit = async () => {
    if (!editItem) return
    
    // TODO: Implement save logic based on item type
    setEditOpen(false)
    setEditItem(null)
    refresh()
  }

  const filteredItems = activeFilter
    ? items.filter((item) => item.kind === activeFilter)
    : items

  const sections = items.filter((i): i is ContentItem & { kind: 'section' } => i.kind === 'section')
  const slides = items.filter((i): i is ContentItem & { kind: 'slide' } => i.kind === 'slide')
  const banners = items.filter((i): i is ContentItem & { kind: 'banner' } => i.kind === 'banner')
  const spotlights = items.filter((i): i is ContentItem & { kind: 'spotlight' } => i.kind === 'spotlight')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Contenido</h2>
          <Button size="sm">
            <Icon icon="lucide:plus" className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeFilter === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            onClick={() => setActiveFilter('section')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeFilter === 'section'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Secciones ({sections.length})
          </button>
          <button
            onClick={() => setActiveFilter('slide')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeFilter === 'slide'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Slides ({slides.length})
          </button>
          <button
            onClick={() => setActiveFilter('banner')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeFilter === 'banner'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Banners ({banners.length})
          </button>
          <button
            onClick={() => setActiveFilter('spotlight')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeFilter === 'spotlight'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Destacados ({spotlights.length})
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-2">
          {loading ? (
            <ListSkeleton count={5} />
          ) : filteredItems.length === 0 ? (
            <div className="py-8 text-center">
              <Icon icon="lucide:layout-template" className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No hay elementos</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <DraggableItem
                key={`${item.kind}-${item.id}`}
                item={item}
                index={index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Vista previa</h2>
        <ContentPreview
          sections={sections}
          slides={slides}
          banners={banners}
          spotlights={spotlights}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar {editItem?.kind}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* TODO: Dynamic form based on item type */}
            <p className="text-sm text-muted-foreground">Formulario de edición en desarrollo</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
