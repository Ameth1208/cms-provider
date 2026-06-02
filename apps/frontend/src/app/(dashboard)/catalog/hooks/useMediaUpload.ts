'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api-client'

export function useMediaUpload() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  const [uploading, setUploading] = useState(false)

  const upload = useCallback(async (catalogItemId: string, file: File) => {
    if (!token) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      return await api.upload(`/media/upload/${catalogItemId}`, formData, token)
    } finally {
      setUploading(false)
    }
  }, [token])

  const remove = useCallback(async (mediaId: string) => {
    if (!token) return
    await api.delete(`/media/${mediaId}`, token)
  }, [token])

  return { upload, remove, uploading }
}
