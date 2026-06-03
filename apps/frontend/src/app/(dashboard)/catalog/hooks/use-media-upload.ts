'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

export function useMediaUpload() {
  const { token } = useAuth()

  const uploadBatch = useCallback(
    async (catalogItemId: string, files: File[]) => {
      if (!token || files.length === 0) return []
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      return api.uploadBatch(`/media/upload-batch/${catalogItemId}`, formData, token)
    },
    [token]
  )

  const remove = useCallback(
    async (mediaId: string) => {
      if (!token) return
      await api.delete(`/media/${mediaId}`, token)
    },
    [token]
  )

  const reorder = useCallback(
    async (items: { id: string; order: number }[]) => {
      if (!token) return
      await api.post('/media/reorder', { items }, token)
    },
    [token]
  )

  return { uploadBatch, remove, reorder }
}
