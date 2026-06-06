'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useParams } from 'next/navigation'

interface TrackingData {
  orderId: string
  status: string
  customerName: string
  address: string
  total: number
  createdAt: string
  deliveredAt?: string
  driver?: {
    name: string
    phone?: string
  }
  trackingEvents: {
    id: string
    status: string
    address?: string
    notes?: string
    timestamp: string
  }[]
}

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Pedido recibido', icon: 'lucide:clipboard-list' },
  { key: 'CONFIRMED', label: 'Confirmado', icon: 'lucide:check-circle' },
  { key: 'PROCESSING', label: 'En preparación', icon: 'lucide:package' },
  { key: 'SHIPPED', label: 'En camino', icon: 'lucide:truck' },
  { key: 'DELIVERED', label: 'Entregado', icon: 'lucide:check-circle' },
]

export default function TrackingPage() {
  const params = useParams()
  const orderId = params?.orderId as string
  const [data, setData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) return
    
    const fetchTracking = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracking/${orderId}`)
        const result = await res.json()
        if (result.error) {
          setError(result.error)
        } else {
          setData(result)
        }
      } catch (err) {
        setError('No se pudo cargar el tracking')
      } finally {
        setLoading(false)
      }
    }

    fetchTracking()
    // Poll every 30 seconds
    const interval = setInterval(fetchTracking, 30000)
    return () => clearInterval(interval)
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Icon icon="lucide:loader-circle" className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Icon icon="lucide:package-x" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === data.status)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Icon icon="lucide:truck" className="h-10 w-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Seguimiento de pedido</h1>
          <p className="text-primary-foreground/80">Orden #{data.orderId.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* Status Steps */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
          <div className="space-y-6">
            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= currentStepIndex
              const isCurrent = index === currentStepIndex
              
              return (
                <div key={step.key} className="relative flex items-start gap-4">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                  >
                    <Icon icon={step.icon} className="h-4 w-4" />
                  </div>
                  <div className="pt-1">
                    <p className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    {isCurrent && data.driver && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Repartidor: {data.driver.name}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tracking Events */}
        {data.trackingEvents.length > 0 && (
          <div className="bg-muted/50 rounded-xl p-4 space-y-4">
            <p className="font-medium">Historial de movimientos</p>
            <div className="space-y-3">
              {data.trackingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="text-sm font-medium">{event.status}</p>
                    {event.address && <p className="text-xs text-muted-foreground">{event.address}</p>}
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Info */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <p className="font-medium">Detalles del pedido</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span>{data.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dirección</span>
              <span>{data.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">${data.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
