'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Icon } from '@iconify/react'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSeo } from '@/hooks/useSeo'
import { useMediaUpload } from '../hooks/useMediaUpload'
import type { CatalogItem, Category, Tag, Media } from '@cms/shared'

export default function CatalogDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  const [pageLoaded, setPageLoaded] = useState(false)

  const [item, setItem] = useState<CatalogItem | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: 0,
    type: 'PRODUCT' as 'PRODUCT' | 'SERVICE', sku: '', active: true,
    categoryId: '', tagIds: [] as string[],
  })

  // Media state
  const [media, setMedia] = useState<Media[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])
  const { upload, remove, uploading } = useMediaUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const isNew = id === 'new'

  useEffect(() => {
    if (!token) return

    async function load() {
      const [cats, tgs] = await Promise.all([
        api.get<Category[]>('/catalog/categories/all', token),
        api.get<Tag[]>('/catalog/tags/all', token),
      ])
      setCategories(cats)
      setTags(tgs)

      if (!isNew) {
        const data = await api.get<CatalogItem>(`/catalog/${id}`, token)
        setItem(data)
        setForm({
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          price: data.price,
          type: data.type,
          sku: data.sku || '',
          active: data.active,
          categoryId: data.categoryId || '',
          tagIds: data.tags.map((t: any) => t.tag?.id ?? t.id),
        })
        setMedia(data.media || [])
      }
      setPageLoaded(true)
    }
    load()
  }, [id, token, isNew])

  useSeo(item?.seo ?? null)

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: isNew && !f.slug ? generateSlug(name) : f.slug,
    }))
  }

  function toggleTag(tagId: string) {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(tagId)
        ? f.tagIds.filter((id) => id !== tagId)
        : [...f.tagIds, tagId],
    }))
  }

  // Media handlers
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    setPendingFiles((prev) => [...prev, ...imageFiles])
    imageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPendingPreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const removePendingFile = useCallback((index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const removeExistingMedia = useCallback(async (mediaId: string) => {
    await remove(mediaId)
    setMedia((prev) => prev.filter((m) => m.id !== mediaId))
  }, [remove])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSaving(true)

    const body = {
      ...form,
      categoryId: form.categoryId || undefined,
      tagIds: form.tagIds.length ? form.tagIds : undefined,
    }

    try {
      let itemId: string

      if (isNew) {
        const created = await api.post<CatalogItem>('/catalog', body, token)
        itemId = created.id
      } else {
        await api.put(`/catalog/${id}`, body, token)
        itemId = id as string
      }

      // Upload pending images
      for (const file of pendingFiles) {
        await upload(itemId, file)
      }

      router.push('/catalog')
    } finally {
      setSaving(false)
    }
  }

  // Preview helpers
  const selectedTagNames = tags.filter((t) => form.tagIds.includes(t.id)).map((t) => t.name)
  const categoryName = categories.find((c) => c.id === form.categoryId)?.name
  const allImages = [...media.map((m) => m.url), ...pendingPreviews]

  if (!pageLoaded) {
    return (
      <div className="max-w-6xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">
            {isNew ? 'Nuevo item' : 'Editar item'}
          </h1>
          <p className="text-muted-foreground text-sm font-light">
            {isNew ? 'Agrega un producto o servicio al catálogo' : `SKU: ${item?.sku || 'Sin SKU'}`}
          </p>
        </div>
        {!isNew && (
          <Badge variant={form.active ? 'default' : 'secondary'}>
            {form.active ? 'Activo' : 'Inactivo'}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 font-medium">
                  <Icon icon="lucide:info" className="h-4 w-4" />
                  Información básica
                </CardTitle>
                <CardDescription>Nombre, descripción y tipo del item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ej: Camiseta básica"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="ej: camiseta-basica"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe el producto o servicio..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v as 'PRODUCT' | 'SERVICE' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRODUCT">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:package" className="h-4 w-4" />
                          Producto
                        </div>
                      </SelectItem>
                      <SelectItem value="SERVICE">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:concierge-bell" className="h-4 w-4" />
                          Servicio
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Precio y SKU */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 font-medium">
                  <Icon icon="lucide:dollar-sign" className="h-4 w-4" />
                  Precio y SKU
                </CardTitle>
                <CardDescription>Precio, código interno y estado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      placeholder="Ej: CAM-001"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm font-medium">Item activo</Label>
                    <p className="text-xs text-muted-foreground">Disponible para la venta</p>
                  </div>
                  <Switch
                    checked={form.active}
                    onCheckedChange={(v) => setForm({ ...form, active: v })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Imágenes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 font-medium">
                  <Icon icon="lucide:image" className="h-4 w-4" />
                  Imágenes
                </CardTitle>
                <CardDescription>Arrastra imágenes o haz click para subir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing + pending images */}
                {allImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {media.map((m, i) => (
                      <div key={m.id} className="relative aspect-square rounded-lg border overflow-hidden group">
                        <img src={m.url} alt={m.alt || ''} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingMedia(m.id)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Icon icon="lucide:x" className="h-3 w-3" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                    ))}
                    {pendingPreviews.map((preview, i) => (
                      <div key={`pending-${i}`} className="relative aspect-square rounded-lg border overflow-hidden group">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="text-white text-xs">Pendiente</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePendingFile(i)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Icon icon="lucide:x" className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={onDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <Icon icon="lucide:upload-cloud" className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">Haz click</span> o arrastra imágenes aquí
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </CardContent>
            </Card>

            {/* Categoría y Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 font-medium">
                  <Icon icon="lucide:folder-tree" className="h-4 w-4" />
                  Categoría y Tags
                </CardTitle>
                <CardDescription>Organización del catálogo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={form.categoryId || 'none'}
                    onValueChange={(v) => setForm({ ...form, categoryId: v === 'none' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin categoría</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:folder" className="h-4 w-4" />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  {tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Crea tags primero en Catálogo &gt; Tags
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const selected = form.tagIds.includes(tag.id)
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                              selected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background hover:bg-accent border-input'}`}
                          >
                            {selected && <Icon icon="lucide:check" className="h-3 w-3" />}
                            {tag.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/catalog')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving || uploading ? (
                  <Icon icon="lucide:loader-circle" className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icon icon={isNew ? 'lucide:plus' : 'lucide:save'} className="mr-2 h-4 w-4" />
                )}
                {isNew ? 'Crear item' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 font-medium">
                <Icon icon="lucide:eye" className="h-4 w-4" />
                Vista previa
              </CardTitle>
              <CardDescription>Así se verá tu item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image */}
              <div className="aspect-[4/3] rounded-xl border bg-muted overflow-hidden">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[0]}
                    alt={form.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Icon icon="lucide:image" className="h-12 w-12 opacity-30" />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2">
                  {allImages.slice(0, 4).map((url, i) => (
                    <div
                      key={i}
                      className={`h-12 w-12 rounded-lg border overflow-hidden ${i === 0 ? 'ring-2 ring-primary' : ''}`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {allImages.length > 4 && (
                    <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      +{allImages.length - 4}
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-[10px] mb-2">
                    {form.type === 'PRODUCT' ? 'Producto' : 'Servicio'}
                  </Badge>
                  <h3 className="text-lg font-medium leading-tight">{form.name || 'Sin nombre'}</h3>
                  {form.sku && (
                    <p className="text-xs text-muted-foreground mt-0.5">SKU: {form.sku}</p>
                  )}
                </div>

                <p className="text-2xl font-light">${form.price.toFixed(2)}</p>

                {form.description && (
                  <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                    {form.description}
                  </p>
                )}

                {categoryName && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon icon="lucide:folder" className="h-3.5 w-3.5" />
                    {categoryName}
                  </div>
                )}

                {selectedTagNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTagNames.map((name) => (
                      <Badge key={name} variant="outline" className="text-[10px] font-light">
                        {name}
                      </Badge>
                    ))}
                  </div>
                )}

                {!form.active && (
                  <Badge variant="secondary" className="text-[10px]">
                    Inactivo
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
