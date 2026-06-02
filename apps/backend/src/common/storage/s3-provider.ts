import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'
import { IStorageProvider, UploadOptions } from './storage.interface'

@Injectable()
export class S3Provider implements IStorageProvider {
  private client: Minio.Client
  private defaultBucket: string
  private publicUrl: string

  constructor(config: ConfigService) {
    const endpoint = config.get('S3_ENDPOINT', 'http://localhost:9000')
    const url = new URL(endpoint)

    this.client = new Minio.Client({
      endPoint: url.hostname,
      port: url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80,
      useSSL: url.protocol === 'https:',
      accessKey: config.get('S3_ACCESS_KEY_ID', ''),
      secretKey: config.get('S3_SECRET_ACCESS_KEY', ''),
      region: config.get('S3_REGION', 'us-east-1'),
    })

    this.defaultBucket = config.get('S3_BUCKET', 'cms-media')
    this.publicUrl = config.get('S3_PUBLIC_URL', '')

    if (!this.publicUrl) {
      const bucket = this.defaultBucket
      this.publicUrl = `${url.protocol}//${url.host}/${bucket}`
    }
  }

  private async ensureBucket(bucket: string) {
    const exists = await this.client.bucketExists(bucket)
    if (!exists) {
      await this.client.makeBucket(bucket, process.env['S3_REGION'] || 'us-east-1')
    }
  }

  async upload(filename: string, buffer: Buffer, options?: UploadOptions): Promise<string> {
    const bucket = options?.bucket || this.defaultBucket
    await this.ensureBucket(bucket)

    const contentType = options?.contentType || 'application/octet-stream'
    await this.client.putObject(bucket, filename, buffer, buffer.length, {
      'Content-Type': contentType,
      ...options?.metadata,
    })

    return this.getUrl(filename, bucket)
  }

  async delete(filename: string, bucket?: string): Promise<void> {
    await this.client.removeObject(bucket || this.defaultBucket, filename)
  }

  getUrl(filename: string, bucket?: string): string {
    const bkt = bucket || this.defaultBucket
    if (this.publicUrl.includes(bkt)) {
      return `${this.publicUrl}/${filename}`
    }
    return `${this.publicUrl}/${bkt}/${filename}`
  }
}
