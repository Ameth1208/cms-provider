'use client'

import { useRef } from 'react'
import { Icon } from '@iconify/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCatalogFormStore } from '../../store/catalog-form-store'
import { useMediaUpload } from '../../hooks/use-media-upload'
import { useTranslation } from '@/i18n/use-translation'

export function MediaSection() {
  const media = useCatalogFormStore((s) => s.media)
  const pendingPreviews = useCatalogFormStore((s) => s.pendingPreviews)
  const dragOver = useCatalogFormStore((s) => s.dragOver)
  const setDragOver = useCatalogFormStore((s) => s.setDragOver)
  const addPendingFiles = useCatalogFormStore((s) => s.addPendingFiles)
  const removePendingFile = useCatalogFormStore((s) => s.removePendingFile)
  const removeMediaById = useCatalogFormStore((s) => s.removeMediaById)
  const moveMedia = useCatalogFormStore((s) => s.moveMedia)
  const { remove, reorder } = useMediaUpload()
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  // Separate media by type
  const images = media.filter((m) => m.type === 'IMAGE')
  const videos = media.filter((m) => m.type === 'VIDEO')
  const documents = media.filter((m) => m.type === 'DOCUMENT')
  const imagePreviews = pendingPreviews.filter((p) => p.file.type.startsWith('image/') || p.file.type.startsWith('video/'))
  const docPreviews = pendingPreviews.filter((p) =>
    p.file.type === 'application/pdf' ||
    p.file.type.includes('document') ||
    p.file.type.includes('sheet')
  )

  const allMedia = [
    ...images.map((m) => ({ ...m, isVideo: false, isPending: false, isDocument: false })),
    ...videos.map((m) => ({ ...m, isVideo: true, isPending: false, isDocument: false })),
    ...imagePreviews.map((p, i) => ({
      id: `pending-img-${i}`,
      url: p.preview,
      alt: p.file.name,
      isVideo: p.file.type.startsWith('video/'),
      isPending: true,
      isDocument: false,
    })),
  ]

  const allDocs = [
    ...documents.map((m) => ({ ...m, isPending: false })),
    ...docPreviews.map((p, i) => ({
      id: `pending-doc-${i}`,
      url: p.preview,
      name: p.file.name,
      isPending: true,
    })),
  ]

  async function handleRemoveExisting(id: string) {
    await remove(id)
    removeMediaById(id)
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    moveMedia(index, direction)
    const newMedia = useCatalogFormStore.getState().media
    await reorder(newMedia.map((m, i) => ({ id: m.id, order: i })))
  }

  function handleRemovePending(index: number) {
    removePendingFile(index)
  }

  return (
    <div className="space-y-6">
      {/* Photos & Videos */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">{t('photos')}</CardTitle>
          <CardDescription>{t('photos_videos_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allMedia.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {allMedia.map((m, index) => (
                <div
                  key={m.id}
                  className="relative aspect-square rounded-lg overflow-hidden group bg-muted"
                >
                  {m.isVideo ? (
                    <video src={m.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={m.url} alt={m.alt || ''} className="w-full h-full object-cover" />
                  )}
                  {m.isPending && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[10px] font-medium">{t('pending')}</span>
                    </div>
                  )}
                  {!m.isPending && m.isVideo && (
                    <div className="absolute top-1.5 left-1.5 bg-black/60 text-white rounded px-1.5 py-0.5 text-[10px]">
                      <Icon icon="lucide:play" className="h-3 w-3" />
                    </div>
                  )}
                  {index === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                      {t('main')}
                    </span>
                  )}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!m.isPending && index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        className="h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                      >
                        <Icon icon="lucide:arrow-up" className="h-3 w-3" />
                      </button>
                    )}
                    {!m.isPending && index < media.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        className="h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                      >
                        <Icon icon="lucide:arrow-down" className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        m.isPending
                          ? handleRemovePending(Number(m.id.split('-')[2]))
                          : handleRemoveExisting(m.id)
                      }
                      className="h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500"
                    >
                      <Icon icon="lucide:x" className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              addPendingFiles(e.dataTransfer.files)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <Icon icon="lucide:upload-cloud" className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{t('click_or_drag')}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t('supported_formats')}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => addPendingFiles(e.target.files)}
          />
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">{t('documents')}</CardTitle>
          <CardDescription>{t('documents_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allDocs.length > 0 ? (
            <div className="space-y-2">
              {allDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:file-text" className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{(doc as any).name || (doc as any).alt || t('technical_sheet')}</p>
                    {doc.isPending && (
                      <p className="text-[10px] text-muted-foreground">{t('pending')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                      title={t('download')}
                    >
                      <Icon icon="lucide:download" className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        doc.isPending
                          ? handleRemovePending(Number(doc.id.split('-')[2]))
                          : handleRemoveExisting(doc.id)
                      }
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Icon icon="lucide:trash-2" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon icon="lucide:file-text" className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">{t('no_documents')}</p>
            </div>
          )}

          <div
            onClick={() => docInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors border-border hover:border-primary/50 hover:bg-accent/50"
          >
            <Icon icon="lucide:file-up" className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{t('upload_document')}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF</p>
          </div>
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => addPendingFiles(e.target.files)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
