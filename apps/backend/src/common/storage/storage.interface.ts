export interface UploadOptions {
  bucket?: string
  contentType?: string
  metadata?: Record<string, string>
}

export interface IStorageProvider {
  upload(filename: string, buffer: Buffer, options?: UploadOptions): Promise<string>
  delete(filename: string, bucket?: string): Promise<void>
  getUrl(filename: string, bucket?: string): string
}

export const STORAGE_PROVIDER_TOKEN = 'STORAGE_PROVIDER'
