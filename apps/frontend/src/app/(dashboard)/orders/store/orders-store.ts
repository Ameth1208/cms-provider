import { create } from 'zustand'

export interface OrderItem {
  id: string
  catalogItemId: string
  catalogItemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: string
  status: string
  paymentStatus: string
  shippingStatus: string
  subtotal: number
  discount: number
  tax: number
  shippingCost: number
  total: number
  overpaidAmount: number
  cancelledAt?: string
  cancellationReason?: string
  refundedAmount: number
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customer?: {
    id: string
    name: string
    email: string
    phone?: string
  }
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingZip?: string
  shippingCountry?: string
  shippingMethodId?: string
  shippingMethod?: {
    id: string
    name: string
    price: number
  }
  carrier?: string
  trackingNumber?: string
  shippedAt?: string
  deliveredAt?: string
  notes?: string
  internalNotes?: string
  couponCode?: string
  items: OrderItem[]
  payments?: {
    id: string
    status: string
    amount: number
    method: string
    createdAt: string
  }[]
  driver?: { id: string; name: string; phone?: string }
  delivery?: {
    status: string
    trackingEvents?: { id: string; status: string; timestamp: string; address?: string }[]
  }
  deliveryInstructions?: string
  proofOfDelivery?: string
  createdAt: string
  updatedAt: string
}

interface OrdersState {
  orders: Order[]
  loading: boolean
  stats: {
    totalOrders: number
    pendingOrders: number
    processingOrders: number
    shippedOrders: number
    deliveredOrders: number
    totalRevenue: number
  }
  selectedOrderId: string | null
  detailOpen: boolean
  createOpen: boolean
  viewMode: 'cards' | 'table' | 'kanban'
  statusFilter: string
  searchQuery: string
  dateFilter: string
  page: number
  pageSize: number
  totalOrders: number
  setOrders: (orders: Order[]) => void
  setLoading: (loading: boolean) => void
  setStats: (stats: OrdersState['stats']) => void
  updateOrder: (order: Order) => void
  setSelectedOrderId: (id: string | null) => void
  setDetailOpen: (open: boolean) => void
  setCreateOpen: (open: boolean) => void
  setViewMode: (mode: OrdersState['viewMode']) => void
  setStatusFilter: (filter: string) => void
  setSearchQuery: (query: string) => void
  setDateFilter: (filter: string) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setTotalOrders: (total: number) => void
  openDetail: (id: string) => void
  openCreate: () => void
  closeDetail: () => void
  closeCreate: () => void
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  loading: false,
  stats: {
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  },
  selectedOrderId: null,
  detailOpen: false,
  createOpen: false,
  viewMode: 'table',
  statusFilter: 'all',
  searchQuery: '',
  dateFilter: 'all',
  page: 1,
  pageSize: 10,
  totalOrders: 0,
  setOrders: (orders) => set({ orders }),
  setLoading: (loading) => set({ loading }),
  setStats: (stats) => set({ stats }),
  updateOrder: (order) => set((state) => ({
    orders: state.orders.map((o) => (o.id === order.id ? order : o)),
  })),
  setSelectedOrderId: (id) => set({ selectedOrderId: id }),
  setDetailOpen: (open) => set({ detailOpen: open }),
  setCreateOpen: (open) => set({ createOpen: open }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setStatusFilter: (filter) => set({ statusFilter: filter, page: 1 }),
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setDateFilter: (filter) => set({ dateFilter: filter, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setTotalOrders: (totalOrders) => set({ totalOrders }),
  openDetail: (id) => set({ selectedOrderId: id, detailOpen: true }),
  openCreate: () => set({ createOpen: true }),
  closeDetail: () => set({ detailOpen: false, selectedOrderId: null }),
  closeCreate: () => set({ createOpen: false }),
}))
