import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ContentService } from './content.service'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Content')
@ApiBearerAuth()
@UseGuards(HybridAuthGuard, PermissionGuard)
@Controller('content')
export class ContentController {
  constructor(private content: ContentService) {}

  // ─── Sections ───

  @Get('sections')
  @RequirePermission('content', 'read')
  findSections(
    @Query('type') type: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.content.findSections(orgId, type)
  }

  @Get('sections/:id')
  @RequirePermission('content', 'read')
  findSection(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.content.findSection(id, orgId)
  }

  @Post('sections')
  @RequirePermission('content', 'create')
  createSection(
    @Body() body: { type: string; title?: string; order?: number; active?: boolean },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.content.createSection(body, orgId)
  }

  @Put('sections/:id')
  @RequirePermission('content', 'update')
  updateSection(
    @Param('id') id: string,
    @Body() body: { title?: string; order?: number; active?: boolean },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.content.updateSection(id, body, orgId)
  }

  @Delete('sections/:id')
  @RequirePermission('content', 'delete')
  deleteSection(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.content.deleteSection(id, orgId)
  }

  // ─── Slides ───

  @Post('slides')
  @RequirePermission('content', 'create')
  createSlide(
    @Body() body: {
      sectionId: string
      imageUrl: string
      title?: string
      subtitle?: string
      ctaText?: string
      ctaLink?: string
      bgColor?: string
      buttonColor?: string
      buttonTextColor?: string
      textColor?: string
      order?: number
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.content.createSlide(body, orgId)
  }

  @Put('slides/:id')
  @RequirePermission('content', 'update')
  updateSlide(
    @Param('id') id: string,
    @Body() body: {
      imageUrl?: string
      title?: string
      subtitle?: string
      ctaText?: string
      ctaLink?: string
      bgColor?: string
      buttonColor?: string
      buttonTextColor?: string
      textColor?: string
      order?: number
      active?: boolean
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.content.updateSlide(id, body, orgId)
  }

  @Delete('slides/:id')
  @RequirePermission('content', 'delete')
  deleteSlide(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.content.deleteSlide(id, orgId)
  }

  // ─── Product Spotlights ───

  @Post('spotlights')
  @RequirePermission('content', 'create')
  addProductToSection(
    @Body() body: { sectionId: string; catalogItemId: string; order?: number },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.content.addProductToSection(body, orgId)
  }

  @Delete('spotlights/:id')
  @RequirePermission('content', 'delete')
  removeProductFromSection(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.content.removeProductFromSection(id, orgId)
  }

  @Post('spotlights/reorder')
  @RequirePermission('content', 'update')
  reorderSpotlights(
    @Body() body: { sectionId: string; orders: { id: string; order: number }[] },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.content.reorderSpotlights(body.sectionId, body.orders, orgId)
  }

  // ─── Banners ───

  @Get('banners')
  @RequirePermission('content', 'read')
  findBanners(
    @Query('position') position: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.content.findBanners(orgId, position)
  }

  @Post('banners')
  @RequirePermission('content', 'create')
  createBanner(
    @Body() body: {
      sectionId?: string
      imageUrl?: string
      title?: string
      description?: string
      link?: string
      position?: string
      order?: number
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.content.createBanner(body, orgId)
  }

  @Put('banners/:id')
  @RequirePermission('content', 'update')
  updateBanner(
    @Param('id') id: string,
    @Body() body: {
      sectionId?: string | null
      imageUrl?: string
      title?: string
      description?: string
      link?: string
      position?: string
      order?: number
      active?: boolean
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.content.updateBanner(id, body, orgId)
  }

  @Delete('banners/:id')
  @RequirePermission('content', 'delete')
  deleteBanner(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.content.deleteBanner(id, orgId)
  }

  // ─── Public ───

  @Get('public')
  getPublicContent(@CurrentUser('organizationId') orgId: string) {
    return this.content.getPublicContent(orgId)
  }
}
