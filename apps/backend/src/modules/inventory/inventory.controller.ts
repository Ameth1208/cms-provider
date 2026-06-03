import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { InventoryService } from './inventory.service'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(HybridAuthGuard, PermissionGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventory: InventoryService) {}

  @Get()
  @RequirePermission('inventory', 'read')
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.inventory.findAll(orgId)
  }

  @Get('low-stock')
  @RequirePermission('inventory', 'read')
  getLowStock(@CurrentUser('organizationId') orgId: string) {
    return this.inventory.getLowStock(orgId)
  }

  @Get('expiring-batches')
  @RequirePermission('inventory', 'read')
  getExpiringBatches(
    @Query('days') days: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.inventory.getExpiringBatches(orgId, days ? parseInt(days, 10) : 30)
  }

  @Get(':catalogItemId')
  @RequirePermission('inventory', 'read')
  findByCatalogItem(@Param('catalogItemId') catalogItemId: string, @CurrentUser('organizationId') orgId: string) {
    return this.inventory.findByCatalogItem(catalogItemId, orgId)
  }

  @Get(':catalogItemId/movements')
  @RequirePermission('inventory', 'read')
  getMovements(@Param('catalogItemId') catalogItemId: string, @CurrentUser('organizationId') orgId: string) {
    return this.inventory.getMovements(catalogItemId, orgId)
  }

  @Post('adjust')
  @RequirePermission('inventory', 'update')
  adjust(@Body() body: {
    catalogItemId: string
    quantity: number
    type: 'IN' | 'OUT' | 'ADJUSTMENT'
    reason?: string
    batchNumber?: string
    costPerUnit?: number
    expiresAt?: string
    supplier?: string
  }, @CurrentUser('organizationId') orgId: string, @CurrentUser('sub') userId: string) {
    return this.inventory.adjust(body, orgId, userId)
  }

  @Post('threshold')
  @RequirePermission('inventory', 'update')
  setThreshold(@Body() body: { catalogItemId: string; threshold: number }, @CurrentUser('organizationId') orgId: string) {
    return this.inventory.setThreshold(body.catalogItemId, body.threshold, orgId)
  }

  // ─── Batches ───

  @Get(':catalogItemId/batches')
  @RequirePermission('batches', 'read')
  findBatches(@Param('catalogItemId') catalogItemId: string, @CurrentUser('organizationId') orgId: string) {
    return this.inventory.findBatches(catalogItemId, orgId)
  }

  @Post(':catalogItemId/batches')
  @RequirePermission('batches', 'create')
  createBatch(
    @Param('catalogItemId') catalogItemId: string,
    @Body() body: {
      batchNumber: string
      quantity: number
      costPerUnit?: number
      expiresAt?: string
      supplier?: string
      notes?: string
    },
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.inventory.createBatch({ ...body, catalogItemId }, orgId, userId)
  }

  @Get('batches/:batchId')
  @RequirePermission('batches', 'read')
  findBatch(@Param('batchId') batchId: string, @CurrentUser('organizationId') orgId: string) {
    return this.inventory.findBatch(batchId, orgId)
  }

  @Delete('batches/:batchId')
  @RequirePermission('batches', 'delete')
  deleteBatch(@Param('batchId') batchId: string, @CurrentUser('organizationId') orgId: string) {
    return this.inventory.deleteBatch(batchId, orgId)
  }
}
