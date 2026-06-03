import { Injectable, BadRequestException, Inject } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { PrismaService } from '../../common/prisma.service'
import { IStorageProvider, STORAGE_PROVIDER_TOKEN } from '../../common/storage/storage.interface'

interface UploadedFile {
  buffer: Buffer
  originalname: string
  mimetype: string
}

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PROVIDER_TOKEN) private storage: IStorageProvider,
  ) {}

  private getMediaType(mimeType: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' {
    if (mimeType.startsWith('image/')) return 'IMAGE'
    if (mimeType.startsWith('video/')) return 'VIDEO'
    if (mimeType.startsWith('audio/')) return 'AUDIO'
    return 'DOCUMENT'
  }

  async upload(
    file: UploadedFile,
    catalogItemId: string,
    order?: number,
  ) {
    if (!file) throw new BadRequestException('File is required')

    const ext = file.originalname.split('.').pop()
    const filename = `${uuid()}.${ext}`
    const url = await this.storage.upload(filename, file.buffer, {
      contentType: file.mimetype,
    })

    const mediaType = this.getMediaType(file.mimetype)

    const maxOrder = await this.prisma.media.aggregate({
      where: { catalogItemId },
      _max: { order: true },
    })

    return this.prisma.media.create({
      data: {
        url,
        type: mediaType,
        alt: file.originalname,
        order: order ?? (maxOrder._max.order ?? -1) + 1,
        catalogItemId,
      },
    })
  }

  async uploadBatch(
    files: UploadedFile[],
    catalogItemId: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided')
    }

    const maxOrder = await this.prisma.media.aggregate({
      where: { catalogItemId },
      _max: { order: true },
    })

    let currentOrder = (maxOrder._max.order ?? -1) + 1
    const results = []

    for (const file of files) {
      const ext = file.originalname.split('.').pop()
      const filename = `${uuid()}.${ext}`
      const url = await this.storage.upload(filename, file.buffer, {
        contentType: file.mimetype,
      })

      const mediaType = this.getMediaType(file.mimetype)

      const media = await this.prisma.media.create({
        data: {
          url,
          type: mediaType,
          alt: file.originalname,
          order: currentOrder++,
          catalogItemId,
        },
      })
      results.push(media)
    }

    return results
  }

  async delete(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } })
    if (!media) throw new BadRequestException('Media not found')

    const filename = media.url.split('/').pop()
    if (filename) {
      await this.storage.delete(filename).catch(() => {})
    }

    await this.prisma.media.delete({ where: { id } })
    return { deleted: true }
  }

  async reorder(items: { id: string; order: number }[]) {
    for (const item of items) {
      await this.prisma.media.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    }
    return { reordered: true }
  }
}
