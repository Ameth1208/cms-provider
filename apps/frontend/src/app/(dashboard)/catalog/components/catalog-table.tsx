'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import type { CatalogItem } from '@cms/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="w-14 text-xs tracking-wider uppercase">Img</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">Nombre</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">Tipo</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">Tags</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">Precio</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">SKU</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">Estado</TableHead>
              <TableHead className="text-right text-xs tracking-wider uppercase">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
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
                </TableCell>

                <TableCell>
                  <Link href={`/catalog/${item.id}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                    {item.name}
                  </Link>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary" className="font-light text-[10px]">
                    {item.type === 'PRODUCT' ? 'Producto' : 'Servicio'}
                  </Badge>
                </TableCell>

                <TableCell>
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
                </TableCell>

                <TableCell>
                  {item.discountType && item.discountValue > 0 ? (
                    <div className="flex flex-col">
                      <span className="font-medium">
                        ${(
                          item.discountType === 'PERCENTAGE'
                            ? Math.round(item.price * (1 - item.discountValue / 100) * 100) / 100
                            : Math.max(0, item.price - item.discountValue)
                        ).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-through">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-light">${item.price.toFixed(2)}</span>
                  )}
                </TableCell>

                <TableCell className="text-muted-foreground font-light text-xs">{item.sku || '—'}</TableCell>

                <TableCell>
                  <Badge variant={item.active ? 'default' : 'secondary'} className="font-light text-[10px]">
                    {item.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
