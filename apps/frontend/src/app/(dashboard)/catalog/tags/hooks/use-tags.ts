import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

export interface TagWithCount {
  id: string
  name: string
  slug: string
  _count: { catalogItems: number }
}

export function generateSlug(n: string) {
  return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function useTags() {
  const { token } = useAuth()
  const [tags, setTags] = useState<TagWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const fetch = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<TagWithCount[]>('/catalog/tags/all', token)
      setTags(data)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetch() }, [fetch])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !name || !slug) return
    await api.post('/catalog/tags', { name, slug }, token)
    setName('')
    setSlug('')
    fetch()
  }

  async function handleDelete(id: string) {
    if (!token) return
    await api.delete(`/catalog/tags/${id}`, token)
    fetch()
  }

  return {
    tags,
    loading,
    name,
    setName,
    slug,
    setSlug,
    fetch,
    handleCreate,
    handleDelete,
    token,
  }
}
