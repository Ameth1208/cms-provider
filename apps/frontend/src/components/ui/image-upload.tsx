'use client'

import { useState, useRef } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  onUpload: (file: File) => Promise<string>
  className?: string
}

export function ImageUpload({ value, onChange, onUpload, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const url = await onUpload(file)
      onChange(url)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {value ? (
        <div className="relative group w-fit">
          <img
            src={value}
            alt="Preview"
            className="h-24 w-24 object-contain rounded-xl border border-border bg-background p-2"
          />
          <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20"
              onClick={() => inputRef.current?.click()}
            >
              <Icon icon="lucide:refresh-cw" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20"
              onClick={() => onChange(null)}
            >
              <Icon icon="lucide:trash-2" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors min-h-[120px]',
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          )}
        >
          {uploading ? (
            <>
              <Icon icon="lucide:loader-circle" className="h-8 w-8 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Subiendo...</p>
            </>
          ) : (
            <>
              <Icon icon="lucide:upload-cloud" className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Arrastra una imagen o haz clic para subir</p>
              <p className="text-xs text-muted-foreground/60">PNG, JPG, SVG hasta 5MB</p>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
