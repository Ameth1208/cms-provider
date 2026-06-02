export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT'

export interface Inventory {
  id: string
  catalogItemId: string
  quantity: number
  lowStockThreshold: number
  catalogItem: { name: string; sku: string }
}

export interface StockMovement {
  id: string
  inventoryId: string
  type: MovementType
  quantity: number
  reason: string | null
  reference: string | null
  createdAt: string
}

export interface InventoryAdjustment {
  catalogItemId: string
  quantity: number
  type: MovementType
  reason?: string
}
