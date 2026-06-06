import { create } from 'zustand'
import { api } from '@/lib/api-client'

interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'payment' | 'system'
  read: boolean
  createdAt: string
  data?: any
}

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  lastChecked: Date | null
  fetchNotifications: (token: string) => Promise<void>
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Notification) => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  lastChecked: null,

  fetchNotifications: async (token) => {
    set({ loading: true })
    try {
      // Fetch pending orders as notifications
      const orders = await api.get<any[]>('/orders?status=PENDING&limit=10', token)
      
      const orderNotifications: Notification[] = orders.map((order) => ({
        id: `order-${order.id}`,
        title: 'Nuevo pedido',
        message: `${order.customerName} - $${order.total.toFixed(2)}`,
        type: 'order',
        read: false,
        createdAt: order.createdAt,
        data: order,
      }))

      set((state) => {
        // Merge with existing, avoiding duplicates
        const existingIds = new Set(state.notifications.map((n) => n.id))
        const newNotifications = orderNotifications.filter((n) => !existingIds.has(n.id))
        const allNotifications = [...newNotifications, ...state.notifications]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 50)

        const unreadCount = allNotifications.filter((n) => !n.read).length

        return {
          notifications: allNotifications,
          unreadCount,
          lastChecked: new Date(),
        }
      })
    } finally {
      set({ loading: false })
    }
  },

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      }
    })
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  addNotification: (notification) => {
    set((state) => {
      const exists = state.notifications.find((n) => n.id === notification.id)
      if (exists) return state
      
      const notifications = [notification, ...state.notifications].slice(0, 50)
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      }
    })
  },
}))
