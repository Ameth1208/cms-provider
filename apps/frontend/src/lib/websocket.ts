'use client'

import { io, Socket } from 'socket.io-client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4002'

let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

export function connectSocket(token: string, organizationId?: string, driverId?: string): Socket {
  if (socket?.connected) {
    return socket
  }

  socket = io(`${WS_URL}/deliveries`, {
    auth: { token },
    query: {
      ...(organizationId && { organizationId }),
      ...(driverId && { driverId }),
    },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    console.log('WebSocket connected')
  })

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected')
  })

  socket.on('connect_error', (err) => {
    console.error('WebSocket connection error:', err.message)
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
