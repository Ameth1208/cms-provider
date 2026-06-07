import { create } from 'zustand'

export interface Payment {
  id: string
  orderId: string
  method: string
  status: string
  amount: number
  currency: string
  reference?: string
  externalId?: string
  paidAt?: string
  refundedAt?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
  order?: {
    id: string
    customerName: string
    total: number
    status: string
  }
}

export interface PaymentStats {
  totalPayments: number
  totalPaid: number
  totalRefunded: number
  totalPending: number
}

interface PaymentsState {
  payments: Payment[]
  loading: boolean
  stats: PaymentStats
  setPayments: (payments: Payment[]) => void
  addPayment: (payment: Payment) => void
  updatePayment: (payment: Payment) => void
  setLoading: (loading: boolean) => void
  setStats: (stats: PaymentStats) => void
}

export const usePaymentsStore = create<PaymentsState>((set) => ({
  payments: [],
  loading: false,
  stats: {
    totalPayments: 0,
    totalPaid: 0,
    totalRefunded: 0,
    totalPending: 0,
  },
  setPayments: (payments) => set({ payments }),
  addPayment: (payment) => set((state) => ({
    payments: [payment, ...state.payments],
  })),
  updatePayment: (payment) => set((state) => ({
    payments: state.payments.map((p) => (p.id === payment.id ? payment : p)),
  })),
  setLoading: (loading) => set({ loading }),
  setStats: (stats) => set({ stats }),
}))
