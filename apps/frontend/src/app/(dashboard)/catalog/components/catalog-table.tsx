'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import type { CatalogItem } from '@cms/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  items: CatalogItem[]
  onDelete: (id: string) => void
}

export function CatalogTable({ items, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Icon icon="lucide:package-open" className="mx-auto h-10 w-10 mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground font-light">No hay items en el catálogo</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left px-4 py-3.5 font-normal text-muted-foreground text-xs tracking-wider uppercase w-14">Img</th>
              <th className="text-left px-4 py-3.5 font-normal text-muted-foreground text-xs tracking-wider uppercase">Nombre</th>
              <th className="text-left px-4 py-3.5 font-normal text-muted-foreground text-xs tracking-wider uppercase">Tipo</th>
              <th className="text-left px-4 py-3.5 font-normal text-muted-foreground text-xs tracking-wider uppercase">Tags</th>
              <th className="text-left px-4 py-3.5 font-normal text-muted-foreground text-xs tracking-wider uppercase">Precio</th>
              <th className="text-left px-4 py-3.5 font-normal text-muted-foreground text-xs tracking-wider uppercase">SKU</th>
              <th className="text-left px-4 py-3.5 font-normal text-muted-foreground text-xs tracking-wider uppercase">Estado</th>
              <th className="text-right px-4 py-3.5 font-normal text-muted-foreground text-xs tracking-wider uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors duration-200">
                {/* Thumbnail */}
                <td className="px-4 py-3">
                  <Link href={`/catalog/${item.id}`}>
                    <div className="h-10 w-10 rounded-lg border bg-muted overflow-hidden">
                      {item.media && item.media.length > 0 ? (
                        <img
                          src={item.media[0].url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon icon="lucide:image" className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  </Link>
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <Link href={`/catalog/${item.id}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                    {item.name}
                  </Link>
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="font-light text-[10px]">
                    {item.type === 'PRODUCT' ? 'Producto' : 'Servicio'}
                  </Badge>
                </td>

                {/* Tags */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[140px]">
                    {item.tags?.slice(0, 2).map((t: any) => (
                      <Badge key={t.tag?.id || t.id} variant="outline" className="text-[9px] font-light px-1.5 py-0">
                        {t.tag?.name || t.name}
                      </Badge>
                    ))}
                    {item.tags?.length > 2 && (
                      <Badge variant="outline" className="text-[9px] font-light px-1.5 py-0">
                        +{item.tags.length - 2}
                      </Badge>
                    )}
                    {!item.tags?.length && (
                      <span className="text-muted-foreground text-[10px]">—</span>
                    )}
                  </div>
                </td>

                {/* Price */}
                <td className="px-4 py-3 font-light">${item.price.toFixed(2)}</td>

                {/* SKU */}
                <td className="px-4 py-3 text-muted-foreground font-light text-xs">{item.sku || '—'}</td>

                {/* Status */}
                <td className="px-4 py-3">
                  <Badge variant={item.active ? 'default' : 'secondary'} className="font-light text-[10px]">
                    {item.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/catalog/${item.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
                        <Icon icon="lucide:pencil" className="h-3.5 w-3.5 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(item.id)}>
                      <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
