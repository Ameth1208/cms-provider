'use client'

import { useCallback } from 'react'

interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    // Simple toast using alert for now — can be replaced with a proper toast library
    if (options.variant === 'destructive') {
      console.error(options.title, options.description || '')
    } else {
      console.log(options.title, options.description || '')
    }
    // In a real implementation, this would show a toast notification
    // For now we just log to console to avoid build errors
  }, [])

  return { toast }
}
