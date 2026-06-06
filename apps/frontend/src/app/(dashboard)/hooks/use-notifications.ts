'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useNotificationsStore } from '@/store'
import { connectSocket, disconnectSocket } from '@/lib/websocket'
import { useTranslation } from '@/i18n/use-translation'

export function useNotifications() {
  const { t } = useTranslation()
  const { user, token } = useAuth()
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, addNotification } = useNotificationsStore()
  const intervalRef = useRef<NodeJS.Timeout>()
  const wsInitialized = useRef(false)

  useEffect(() => {
    if (!token) return

    // Initial fetch
    fetchNotifications(token)

    // Poll every 30 seconds as fallback
    intervalRef.current = setInterval(() => {
      fetchNotifications(token)
    }, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [token, fetchNotifications])

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!token || wsInitialized.current) return

    const orgId = user?.organizationId
    const isDriver = user?.roles?.includes('DRIVER')
    const driverId = isDriver ? user?.id : undefined

    const socket = connectSocket(token, orgId, driverId)
    wsInitialized.current = true

    // Listen for delivery events
    socket.on('delivery.assigned', (delivery: any) => {
      addNotification({
        id: `delivery-assigned-${delivery.id}-${Date.now()}`,
        title: t('delivery_assigned'),
        message: `${t('order')} #${delivery.order?.id?.slice(0, 8)} - ${delivery.driver?.name || t('driver')}`,
        type: 'order',
        read: false,
        createdAt: new Date().toISOString(),
        data: delivery,
      })
    })

    socket.on('delivery.started', (delivery: any) => {
      addNotification({
        id: `delivery-started-${delivery.id}-${Date.now()}`,
        title: t('delivery_in_progress'),
        message: `${t('order')} #${delivery.order?.id?.slice(0, 8)} - ${delivery.driver?.name || t('driver')}`,
        type: 'order',
        read: false,
        createdAt: new Date().toISOString(),
        data: delivery,
      })
    })

    socket.on('delivery.nearby', (delivery: any) => {
      addNotification({
        id: `delivery-nearby-${delivery.id}-${Date.now()}`,
        title: t('delivery_nearby'),
        message: `${t('order')} #${delivery.order?.id?.slice(0, 8)}`,
        type: 'order',
        read: false,
        createdAt: new Date().toISOString(),
        data: delivery,
      })
    })

    socket.on('delivery.completed', (delivery: any) => {
      addNotification({
        id: `delivery-completed-${delivery.id}-${Date.now()}`,
        title: t('delivery_completed'),
        message: `${t('order')} #${delivery.order?.id?.slice(0, 8)} - ${t('delivery_completed')}`,
        type: 'order',
        read: false,
        createdAt: new Date().toISOString(),
        data: delivery,
      })
    })

    socket.on('delivery.failed', (delivery: any) => {
      addNotification({
        id: `delivery-failed-${delivery.id}-${Date.now()}`,
        title: t('delivery_failed'),
        message: `${t('order')} #${delivery.order?.id?.slice(0, 8)}`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
        data: delivery,
      })
    })

    return () => {
      disconnectSocket()
      wsInitialized.current = false
    }
  }, [token, user, addNotification, t])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  }
}
