import { Controller, Post, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
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
