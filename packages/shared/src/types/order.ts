export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  id: string
  status: OrderStatus
  total: number
  subtotal: number
  discount: number
  customerName: string
  customerEmail: string
  customerPhone: string | null
  notes: string | null
  couponCode: string | null
  organizationId: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  catalogItemId: string
  catalogItemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface CreateOrder {
  customerName: string
  customerEmail: string
  customerPhone?: string
  notes?: string
  items: { catalogItemId: string; quantity: number }[]
  couponCode?: string
}
