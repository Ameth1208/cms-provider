import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { CatalogService } from './catalog.service'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Catalog')
@ApiBearerAuth()
@UseGuards(HybridAuthGuard, PermissionGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private catalog: CatalogService) {}

  @Get()
  @RequirePermission('catalog', 'read')
  findAll(
    @CurrentUser('organizationId') orgId: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tagId') tagId?: string,
  ) {
    return this.catalog.findAll(orgId, { search, type, categoryId, tagId })
  }

  @Get('slug/:slug')
  @RequirePermission('catalog', 'read')
  findBySlug(@Param('slug') slug: string, @CurrentUser('organizationId') orgId: string) {
    return this.catalog.findBySlug(slug, orgId)
  }

  @Get(':id')
  @RequirePermission('catalog', 'read')
  findOne(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.catalog.findOne(id, orgId)
  }

  @Post()
  @RequirePermission('catalog', 'create')
  create(@Body() body: {
    name: string; slug: string; description?: string; price: number
    type: 'PRODUCT' | 'SERVICE'; sku?: string; categoryId?: string; tagIds?: string[]
  }, @CurrentUser('organizationId') orgId: string) {
    return this.catalog.create(body, orgId)
  }

  @Put(':id')
  @RequirePermission('catalog', 'update')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser('organizationId') orgId: string) {
    return this.catalog.update(id, body, orgId)
  }

  @Delete(':id')
  @RequirePermission('catalog', 'delete')
  remove(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.catalog.remove(id, orgId)
  }

  @Get('tags/all')
  @RequirePermission('catalog', 'read')
  findAllTags(@CurrentUser('organizationId') orgId: string) {
    return this.catalog.findAllTags(orgId)
  }

  @Post('tags')
  @RequirePermission('catalog', 'update')
  createTag(@Body() body: { name: string; slug: string }, @CurrentUser('organizationId') orgId: string) {
    return this.catalog.createTag(body, orgId)
  }

  @Delete('tags/:id')
  @RequirePermission('catalog', 'update')
  removeTag(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.catalog.removeTag(id, orgId)
  }

  @Get('categories/all')
  @RequirePermission('catalog', 'read')
  findAllCategories(@CurrentUser('organizationId') orgId: string) {
    return this.catalog.findAllCategories(orgId)
  }

  @Post('categories')
  @RequirePermission('catalog', 'update')
  createCategory(@Body() body: { name: string; slug: string; parentId?: string }, @CurrentUser('organizationId') orgId: string) {
    return this.catalog.createCategory(body, orgId)
  }

  @Delete('categories/:id')
  @RequirePermission('catalog', 'update')
  removeCategory(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.catalog.removeCategory(id, orgId)
  }
}
