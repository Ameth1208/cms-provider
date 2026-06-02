'use client'

import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

interface SocketState {
  socket: Socket | null
  connected: boolean
  connect: (organizationId: string, token: string) => void
  disconnect: () => void
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,
  connect: (organizationId, token) => {
    const existing = get().socket
    if (existing?.connected) return

    const s = io(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4002'}/orders`, {
      auth: { token },
      query: { organizationId },
      transports: ['websocket'],
    })

    s.on('connect', () => set({ connected: true }))
    s.on('disconnect', () => set({ connected: false }))
    set({ socket: s })
  },
  disconnect: () => {
    const s = get().socket
    s?.disconnect()
    set({ socket: null, connected: false })
  },
}))
