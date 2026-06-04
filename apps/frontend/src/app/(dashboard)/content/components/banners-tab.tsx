'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ListSkeleton } from '@/components/skeletons'
import { useContent, type Banner } from '../hooks/use-content'
import { ImageUpload } from '@/components/image-upload'

export function BannersTab() {
  const content = useContent()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const [formImage, setFormImage] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formLink, setFormLink] = useState('')
  const [formPosition, setFormPosition] = useState('middle')

  const load = async () => {
    setLoading(true)
    const data = await content.fetchBanners()
    setBanners(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    await content.createBanner({
      imageUrl: formImage || undefined,
      title: formTitle || undefined,
      description: formDesc || undefined,
      link: formLink || undefined,
      position: formPosition,
    })
    setCreateOpen(false)
    setFormImage('')
    setFormTitle('')
    setFormDesc('')
    setFormLink('')
    setFormPosition('middle')
    load()
  }

  const toggleActive = async (banner: Banner) => {
    await content.updateBanner(banner.id, { active: !banner.active })
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
          Nuevo banner
        </Button>
      </div>

      {loading ? (
        <ListSkeleton count={5} />
      ) : banners.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No hay banners</div>
      ) : (
        <div className="grid gap-3">
          {banners.map((banner) => (
            <Card key={banner.id} className="border-0 bg-muted/40 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {banner.imageUrl && (
                    <div className="w-32 h-20 bg-muted shrink-0">
                      <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{banner.title || 'Sin título'}</p>
                      <p className="text-xs text-muted-foreground">{banner.description || 'Sin descripción'}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 inline-block uppercase tracking-wider">
                        {banner.position}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleActive(banner)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        banner.active ? 'bg-primary' : 'bg-input'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        banner.active ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">Nuevo banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Imagen</Label>
              <ImageUpload value={formImage} onChange={setFormImage} folder="banners" />
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input value={formLink} onChange={(e) => setFormLink(e.target.value)} placeholder="/catalog/..." />
            </div>
            <div className="space-y-2">
              <Label>Posición</Label>
              <div className="flex flex-wrap gap-2">
                {['top', 'middle', 'bottom'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setFormPosition(pos)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      formPosition === pos ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Crear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
