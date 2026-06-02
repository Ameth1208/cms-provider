'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Icon } from '@iconify/react'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category } from '@cms/shared'

export default function CategoriesPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const fetch = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<Category[]>('/catalog/categories/all', token)
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetch() }, [fetch])

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !name || !slug) return
    await api.post('/catalog/categories', { name, slug }, token)
    setName('')
    setSlug('')
    fetch()
  }

  async function handleDelete(id: string) {
    if (!token) return
    if (!confirm('¿Eliminar categoría?')) return
    await api.delete(`/catalog/categories/${id}`, token)
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
      <h1 className="text-2xl font-bold">Categorías</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nueva categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-3 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="catName">Nombre</Label>
              <Input
                id="catName"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!slug || slug === generateSlug(name)) setSlug(generateSlug(e.target.value))
                }}
                placeholder="Ej: Ropa"
                required
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="catSlug">Slug</Label>
              <Input
                id="catSlug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ej: ropa"
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

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Icon icon="lucide:folder-open" className="mx-auto h-8 w-8 mb-3 opacity-50" />
            <p>Sin categorías</p>
            <p className="text-sm">Crea tu primera categoría arriba</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">Slug</th>
                  <th className="text-left px-4 py-3 font-medium">Subcategorías</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:folder" className="h-4 w-4 text-muted-foreground" />
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                    <td className="px-4 py-3">{cat.children?.length ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="text-destructive hover:text-destructive">
                        <Icon icon="lucide:trash-2" className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
