'use client'

import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useInventoryStore } from '../store/inventory-store'

function formatDate(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

export function InventoryDetail() {
  const selectedItem = useInventoryStore((s) => s.selectedItem)
  const batches = useInventoryStore((s) => s.batches)
  const movements = useInventoryStore((s) => s.movements)
  const detailLoading = useInventoryStore((s) => s.detailLoading)
  const detailOpen = useInventoryStore((s) => s.detailOpen)
  const setDetailOpen = useInventoryStore((s) => s.setDetailOpen)
  const setBatchFormOpen = useInventoryStore((s) => s.setBatchFormOpen)

  return (
    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
      <DialogContent className="rounded-2xl max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-medium">{selectedItem?.catalogItem.name}</DialogTitle>
        </DialogHeader>

        {detailLoading ? (
          <div className="py-8 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <div className="space-y-6 pt-2">
            <div className="flex gap-3">
              <Card className="flex-1 border-0 bg-muted/40">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Stock total</p>
                  <p className="text-2xl font-medium mt-1">{selectedItem?.quantity}</p>
                </CardContent>
              </Card>
              <Card className="flex-1 border-0 bg-muted/40">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Lotes</p>
                  <p className="text-2xl font-medium mt-1">{batches.length}</p>
                </CardContent>
              </Card>
              <Card className="flex-1 border-0 bg-muted/40">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Movimientos</p>
                  <p className="text-2xl font-medium mt-1">{movements.length}</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Lotes</h3>
                <Button size="sm" onClick={() => setBatchFormOpen(true)}>
                  <Icon icon="lucide:plus" className="h-4 w-4 mr-1" />
                  Agregar lote
                </Button>
              </div>
              {batches.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No hay lotes registrados</p>
              ) : (
                <div className="space-y-2">
                  {batches.map((batch) => (
                    <div key={batch.id} className="p-3 rounded-xl bg-muted/40 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{batch.batchNumber}</span>
                          {batch.expiresAt && new Date(batch.expiresAt) < new Date(Date.now() + 30 * 86400000) && (
                            <Badge variant="secondary" className="text-[10px] bg-red-500/15 text-red-500 border-0">
                              Próximo a vencer
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {batch.remainingQuantity} / {batch.quantity} unidades
                          {batch.costPerUnit ? ` · $${batch.costPerUnit}/u` : ''}
                          {batch.supplier ? ` · ${batch.supplier}` : ''}
                          {' · Vence: '}{formatDate(batch.expiresAt)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(batch.receivedAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Historial de movimientos</h3>
              {movements.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No hay movimientos</p>
              ) : (
                <div className="space-y-2">
                  {movements.map((m) => (
                    <div key={m.id} className="p-3 rounded-xl bg-muted/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          m.type === 'IN' ? 'bg-emerald-500/15 text-emerald-500' :
                          m.type === 'OUT' ? 'bg-red-500/15 text-red-500' :
                          'bg-amber-500/15 text-amber-500'
                        }`}>
                          <Icon icon={
                            m.type === 'IN' ? 'lucide:arrow-down-left' :
                            m.type === 'OUT' ? 'lucide:arrow-up-right' :
                            'lucide:equal'
                          } className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm">
                            {m.type === 'IN' ? 'Entrada' : m.type === 'OUT' ? 'Salida' : 'Ajuste'}
                            {' '}<span className="font-medium">{m.quantity}</span> unidades
                          </p>
                          <p className="text-xs text-muted-foreground">{m.reason || 'Sin motivo'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
