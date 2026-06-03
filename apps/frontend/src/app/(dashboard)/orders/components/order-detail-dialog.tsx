'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useOrders } from '../hooks/use-orders'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

interface OrderDetailDialogProps {
  order: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  const { updateOrder } = useOrders()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: '',
    carrier: '',
    trackingNumber: '',
    notes: '',
  })

  if (!order) return null

  const startEditing = () => {
    setFormData({
      shippingAddress: order.shippingAddress || '',
      shippingCity: order.shippingCity || '',
      shippingState: order.shippingState || '',
      shippingZip: order.shippingZip || '',
      shippingCountry: order.shippingCountry || '',
      carrier: order.carrier || '',
      trackingNumber: order.trackingNumber || '',
      notes: order.notes || '',
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    await updateOrder(order.id, formData)
    setSaving(false)
    setIsEditing(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-medium">Pedido #{order.id.slice(0, 8)}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={`text-xs ${STATUS_COLORS[order.status] || ''}`}
            >
              {STATUS_LABELS[order.status] || order.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Customer Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Cliente</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="text-sm">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm">{order.customerEmail}</p>
              </div>
              {order.customerPhone && (
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm">{order.customerPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Productos</h3>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.catalogItemName}</p>
                    <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">${item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm font-medium">Total</p>
                <p className="text-lg font-medium">${order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Información de Envío</h3>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={startEditing}>
                  <Icon icon="lucide:pencil" className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Dirección</Label>
                    <Input
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      placeholder="Calle y número"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ciudad</Label>
                    <Input
                      value={formData.shippingCity}
                      onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                      placeholder="Ciudad"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Estado/Provincia</Label>
                    <Input
                      value={formData.shippingState}
                      onChange={(e) => setFormData({ ...formData, shippingState: e.target.value })}
                      placeholder="Estado"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Código Postal</Label>
                    <Input
                      value={formData.shippingZip}
                      onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
                      placeholder="CP"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">País</Label>
                    <Input
                      value={formData.shippingCountry}
                      onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                      placeholder="País"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Transportista</Label>
                    <Input
                      value={formData.carrier}
                      onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                      placeholder="Ej: FedEx, DHL"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Número de Tracking</Label>
                    <Input
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                      placeholder="# tracking"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Notas</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionales"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Dirección</p>
                  <p className="text-sm">{order.shippingAddress || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ciudad</p>
                  <p className="text-sm">{order.shippingCity || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado/CP</p>
                  <p className="text-sm">{order.shippingState || '—'} {order.shippingZip || ''}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">País</p>
                  <p className="text-sm">{order.shippingCountry || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transportista</p>
                  <p className="text-sm">{order.carrier || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tracking</p>
                  <p className="text-sm font-mono">{order.trackingNumber || '—'}</p>
                </div>
                {order.shippedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground">Enviado</p>
                    <p className="text-sm">{new Date(order.shippedAt).toLocaleDateString()}</p>
                  </div>
                )}
                {order.deliveredAt && (
                  <div>
                    <p className="text-xs text-muted-foreground">Entregado</p>
                    <p className="text-sm">{new Date(order.deliveredAt).toLocaleDateString()}</p>
                  </div>
                )}
                {order.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Notas</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
