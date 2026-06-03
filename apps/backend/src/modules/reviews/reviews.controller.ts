import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ReviewsService } from './reviews.service'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(HybridAuthGuard, PermissionGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Get(':catalogItemId')
  @RequirePermission('catalog', 'read')
  findAll(@Param('catalogItemId') catalogItemId: string, @CurrentUser('organizationId') orgId: string) {
    return this.reviews.findAll(catalogItemId, orgId)
  }

  @Post()
  @RequirePermission('catalog', 'update')
  create(
    @Body() body: {
      catalogItemId: string
      userName: string
      userEmail?: string
      rating: number
      comment: string
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.reviews.create(body, orgId)
  }

  @Delete(':id')
  @RequirePermission('catalog', 'update')
  remove(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.reviews.remove(id, orgId)
  }
}
