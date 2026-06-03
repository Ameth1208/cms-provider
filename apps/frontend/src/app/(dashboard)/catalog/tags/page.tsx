'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Icon } from '@iconify/react'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface TagWithCount {
  id: string
  name: string
  slug: string
  _count: { catalogItems: number }
}

export default function TagsPage() {
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

  function generateSlug(n: string) {
    return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

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
    if (!confirm('¿Eliminar tag?')) return
    await api.delete(`/catalog/tags/${id}`, token)
    fetch()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tags</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nuevo tag</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-3 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="tagName">Nombre</Label>
              <Input
                id="tagName"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!slug || slug === generateSlug(name)) setSlug(generateSlug(e.target.value))
                }}
                placeholder="Ej: Oferta"
                required
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="tagSlug">Slug</Label>
              <Input
                id="tagSlug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ej: oferta"
                required
              />
            </div>
            <Button type="submit">
              <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
              Crear
            </Button>
          </form>
        </CardContent>
      </Card>

      {tags.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Icon icon="lucide:tags" className="mx-auto h-8 w-8 mb-3 opacity-50" />
            <p>Sin tags</p>
            <p className="text-sm">Crea tu primer tag arriba</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Card key={tag.id} className="group relative">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:tag" className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{tag.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{tag._count?.catalogItems ?? 0}</Badge>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="ml-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon icon="lucide:x" className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
