'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Return {
  id: string
  status: string
  reason: string
  quantity: number
  refundAmount?: number
  createdAt: string
  order?: {
    id: string
    customerName: string
  }
  pickupDriver?: {
    name: string
  }
}

interface Props {
  returns: Return[]
  onUpdateStatus: (id: string, status: string, notes?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ReturnsTable({ returns, onUpdateStatus, onDelete }: Props) {
  const { t } = useTranslation()

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      REQUESTED: 'bg-amber-100 text-amber-700',
      APPROVED: 'bg-blue-100 text-blue-700',
      REJECTED: 'bg-red-100 text-red-700',
      IN_TRANSIT: 'bg-purple-100 text-purple-700',
      RECEIVED: 'bg-emerald-100 text-emerald-700',
      REFUNDED: 'bg-green-100 text-green-700',
      EXCHANGED: 'bg-cyan-100 text-cyan-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-xs tracking-wider uppercase">{t('returns_order')}</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">{t('returns_reason')}</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">{t('returns_status')}</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">{t('returns_quantity')}</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">{t('returns_refund')}</TableHead>
              <TableHead className="text-right text-xs tracking-wider uppercase">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.map((ret) => (
              <TableRow key={ret.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{ret.order?.customerName || '-'}</p>
                    <p className="text-xs text-muted-foreground">#{ret.order?.id?.slice(0, 8)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{t(`return_reason_${ret.reason}`)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(ret.status)}>
                    {t(`return_status_${ret.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>{ret.quantity}</TableCell>
                <TableCell>
                  {ret.refundAmount ? formatPrice(ret.refundAmount) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {ret.status === 'REQUESTED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(ret.id, 'APPROVED')}
                      >
                        <Icon icon="lucide:check" className="h-4 w-4" />
                      </Button>
                    )}
                    {ret.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(ret.id, 'IN_TRANSIT')}
                      >
                        <Icon icon="lucide:truck" className="h-4 w-4" />
                      </Button>
                    )}
                    {ret.status === 'IN_TRANSIT' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(ret.id, 'RECEIVED')}
                      >
                        <Icon icon="lucide:package-check" className="h-4 w-4" />
                      </Button>
                    )}
                    {ret.status === 'RECEIVED' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(ret.id, 'REFUNDED')}
                        >
                          <Icon icon="lucide:banknote" className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(ret.id, 'EXCHANGED')}
                        >
                          <Icon icon="lucide:refresh-ccw" className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm(t('returns_delete_confirm'))) onDelete(ret.id)
                      }}
                    >
                      <Icon icon="lucide:trash-2" className="h-4 w-4" />
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
