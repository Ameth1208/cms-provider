'use client'

import { useState } from 'react'
import {
  Search,
  Pencil,
  UserCheck,
  UserX,
  Mail,
  Phone,
  FileText,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslation } from '@/i18n/use-translation'
import { useCustomers } from '../hooks/use-customers'

export function CustomersList() {
  const { t } = useTranslation()
  const { customers, loading, openEdit, toggleActive } = useCustomers()
  const [query, setQuery] = useState('')

  const filtered = customers.filter((c) => {
    const q = query.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.document?.toLowerCase().includes(q) ?? false) ||
      (c.phone?.toLowerCase().includes(q) ?? false)
    )
  })

  if (loading && customers.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          {t('loading')}
        </CardContent>
      </Card>
    )
  }

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          {t('customers_no_customers')}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-card p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('customers_search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="text-xs tracking-wider uppercase">{t('customers_name')}</TableHead>
                <TableHead className="text-xs tracking-wider uppercase">{t('customers_contact')}</TableHead>
                <TableHead className="text-xs tracking-wider uppercase">{t('customers_document')}</TableHead>
                <TableHead className="text-xs tracking-wider uppercase">{t('customers_orders')}</TableHead>
                <TableHead className="text-xs tracking-wider uppercase w-24">{t('customers_status')}</TableHead>
                <TableHead className="text-xs tracking-wider uppercase text-right w-28">{t('customers_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{customer.name}</p>
                      {customer.notes && (
                        <p className="text-xs text-muted-foreground truncate">{customer.notes}</p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {customer.document ? (
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{customer.document}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{customer._count?.orders || 0}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={customer.active ? 'default' : 'secondary'}
                      className="text-[10px] font-light"
                    >
                      {customer.active ? t('customers_active') : t('customers_inactive')}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-muted-foreground hover:text-foreground gap-1.5"
                        onClick={() => openEdit(customer)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {t('edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleActive(customer)}
                      >
                        {customer.active ? (
                          <UserX className="h-4 w-4 text-orange-500" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {t('customers_no_results')}
        </div>
      )}
    </div>
  )
}
