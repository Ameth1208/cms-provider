'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/use-translation'
import { useInventoryStore } from '../store/inventory-store'
import { useInventory } from '../hooks/use-inventory'

export function BatchForm() {
  const { t } = useTranslation()
  const batchFormOpen = useInventoryStore((s) => s.batchFormOpen)
  const setBatchFormOpen = useInventoryStore((s) => s.setBatchFormOpen)
  const { submitBatch } = useInventory()

  const [batchNumber, setBatchNumber] = useState('')
  const [quantity, setQuantity] = useState('')
  const [cost, setCost] = useState('')
  const [expires, setExpires] = useState('')
  const [supplier, setSupplier] = useState('')

  const reset = () => {
    setBatchNumber('')
    setQuantity('')
    setCost('')
    setExpires('')
    setSupplier('')
  }

  const handleSubmit = () => {
    submitBatch({
      batchNumber: batchNumber || `LOT-${Date.now()}`,
      quantity: parseInt(quantity),
      costPerUnit: cost ? parseFloat(cost) : undefined,
      expiresAt: expires || undefined,
      supplier: supplier || undefined,
    })
    reset()
  }

  return (
    <Dialog open={batchFormOpen} onOpenChange={setBatchFormOpen}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('inventory_add_batch')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>{t('inventory_batch_number')}</Label>
            <Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder={`LOT-${Date.now()}`} />
          </div>
          <div className="space-y-2">
            <Label>{t('inventory_quantity')}</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('inventory_cost_per_unit')}</Label>
            <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label>{t('inventory_expiration_date')}</Label>
            <Input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('inventory_supplier')}</Label>
            <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBatchFormOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleSubmit} disabled={!quantity}>{t('add')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
