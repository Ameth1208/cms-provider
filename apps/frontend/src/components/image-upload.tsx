'use client'

import { useState, useRef, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  className?: string
}

export function ImageUpload({ value, onChange, folder = 'general', className = '' }: ImageUploadProps) {
  const { token } = useAuth()
  const [mode, setMode] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState(value || '')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }
    if (!token) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const data = await api.upload('/media/upload', formData, token)
      onChange(data.url)
      setUrlInput(data.url)
    } catch (err) {
      console.error('Upload error:', err)
      alert('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [token])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleUrlChange = (val: string) => {
    setUrlInput(val)
    onChange(val)
  }

  const clear = () => {
    onChange('')
    setUrlInput('')
  }

  const hasImage = value && value.trim().length > 0

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tabs */}
      <div className="flex gap-1 p-0.5 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setMode('file')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            mode === 'file' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Subir archivo
        </button>
        <button
          onClick={() => setMode('url')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            mode === 'url' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pegar URL
        </button>
      </div>

      {mode === 'file' && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40 hover:bg-muted/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Icon icon="lucide:loader-2" className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
            </div>
          ) : hasImage ? (
            <div className="relative group">
              <img
                src={value}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = ''
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
                  <Icon icon="lucide:refresh-cw" className="h-3.5 w-3.5 mr-1" />
                  Cambiar
                </Button>
                <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); clear() }}>
                  <Icon icon="lucide:trash-2" className="h-3.5 w-3.5 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Icon icon="lucide:upload" className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Arrastrá o hacé click para subir</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP hasta 5MB</p>
            </div>
          )}
        </div>
      )}

      {mode === 'url' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="flex-1"
            />
            {hasImage && (
              <Button variant="ghost" size="icon" onClick={clear} className="shrink-0">
                <Icon icon="lucide:x" className="h-4 w-4" />
              </Button>
            )}
          </div>

          {hasImage && (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img
                src={value}
                alt="Preview"
                className="w-full h-40 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
