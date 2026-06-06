'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useInventoryStore } from '../store/inventory-store'
import { useInventory } from '../hooks/use-inventory'

export function InventoryList() {
  const { t } = useTranslation()
  const items = useInventoryStore((s) => s.items)
  const { selectItem } = useInventory()

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('inventory_product')}</TableHead>
              <TableHead>{t('inventory_sku')}</TableHead>
              <TableHead>{t('inventory_stock_total')}</TableHead>
              <TableHead>{t('inventory_minimum')}</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((inv) => (
              <TableRow
                key={inv.id}
                className="cursor-pointer"
                onClick={() => selectItem(inv)}
              >
                <TableCell className="font-medium">{inv.catalogItem.name}</TableCell>
                <TableCell className="text-muted-foreground">{inv.catalogItem.sku || t('na')}</TableCell>
                <TableCell>
                  <span className={inv.quantity <= inv.lowStockThreshold ? 'text-red-500 font-medium' : ''}>
                    {inv.quantity}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{inv.lowStockThreshold}</TableCell>
                <TableCell className="text-right">
                  <Icon icon="lucide:chevron-right" className="h-4 w-4 text-muted-foreground inline-block" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
