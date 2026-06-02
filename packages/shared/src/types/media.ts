export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'

export interface Media {
  id: string
  url: string
  type: MediaType
  alt: string | null
  order: number
  catalogItemId: string
  createdAt: string
}

export interface MediaUploadResult {
  id: string
  url: string
  type: MediaType
  filename: string
}
