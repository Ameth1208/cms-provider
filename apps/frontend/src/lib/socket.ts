'use client'

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(token: string, organizationId: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(
      `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4002'}/orders`,
      {
        auth: { token },
        query: { organizationId },
        transports: ['websocket'],
      },
    )
  }
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
