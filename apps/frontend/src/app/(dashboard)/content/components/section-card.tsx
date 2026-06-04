'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { useContent, type Section } from '../hooks/use-content'
import { useConfirm } from '@/components/confirm-dialog'

const LABELS: Record<string, string> = {
  hero: 'Carrusel principal',
  featured: 'Destacados',
  new_arrivals: 'Novedades',
  promo: 'Promociones',
  collections: 'Colecciones',
}

const ICONS: Record<string, string> = {
  hero: 'lucide:images',
  featured: 'lucide:sparkles',
  new_arrivals: 'lucide:package-plus',
  promo: 'lucide:tag',
  collections: 'lucide:layout-grid',
}

interface SectionCardProps {
  section: Section
  children?: React.ReactNode
}

export function SectionCard({ section, children }: SectionCardProps) {
  const content = useContent()
  const { confirm, dialog } = useConfirm()
  const [expanded, setExpanded] = useState(true)
  const label = LABELS[section.type] || section.type
  const icon = ICONS[section.type] || 'lucide:layout-grid'

  const handleToggle = async () => {
    await content.updateSection(section.id, { active: !section.active })
    content.refresh()
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Eliminar sección',
      message: `¿Estás seguro de que querés eliminar "${section.title || label}" y todo su contenido? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'destructive',
    })
    if (!confirmed) return
    await content.deleteSection(section.id)
    content.refresh()
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors shrink-0"
        >
          <Icon
            icon={expanded ? 'lucide:chevron-down' : 'lucide:chevron-right'}
            className="h-4 w-4 text-muted-foreground"
          />
        </button>

        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
          <Icon icon={icon} className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{section.title || label}</p>
          <p className="text-xs text-muted-foreground">{label} · Orden {section.order}</p>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={handleToggle}
            className={`p-2 rounded-lg transition-colors ${
              section.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground hover:bg-muted'
            }`}
            title={section.active ? 'Activo' : 'Inactivo'}
          >
            <Icon icon={section.active ? 'lucide:eye' : 'lucide:eye-off'} className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Eliminar sección"
          >
            <Icon icon="lucide:trash-2" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && children && (
        <div className="px-4 pb-4">
          <div className="pl-10 space-y-2">{children}</div>
        </div>
      )}
      {dialog}
    </div>
  )
}
