import { Controller, Post, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { MediaService } from './media.service'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'

@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(HybridAuthGuard, PermissionGuard)
@Controller('media')
export class MediaController {
  constructor(private media: MediaService) {}

  @Post('upload')
  @RequirePermission('media', 'create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadGeneric(@UploadedFile() file: any, @Body('folder') folder?: string) {
    return this.media.uploadGeneric(file, folder)
  }

  @Post('upload/:catalogItemId')
  @RequirePermission('media', 'create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: any,
    @Param('catalogItemId') catalogItemId: string,
    @Body('order') order?: number,
  ) {
    return this.media.upload(file, catalogItemId, order)
  }

  @Post('upload-batch/:catalogItemId')
  @RequirePermission('media', 'create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadBatch(
    @UploadedFiles() files: any[],
    @Param('catalogItemId') catalogItemId: string,
  ) {
    return this.media.uploadBatch(files || [], catalogItemId)
  }

  @Delete(':id')
  @RequirePermission('media', 'delete')
  delete(@Param('id') id: string) {
    return this.media.delete(id)
  }

  @Post('reorder')
  @RequirePermission('media', 'update')
  reorder(@Body() body: { items: { id: string; order: number }[] }) {
    return this.media.reorder(body.items)
  }
}
