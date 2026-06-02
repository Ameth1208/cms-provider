import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common'
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
  adjust(@Body() body: { catalogItemId: string; quantity: number; type: 'IN' | 'OUT' | 'ADJUSTMENT'; reason?: string }, @CurrentUser('organizationId') orgId: string) {
    return this.inventory.adjust(body, orgId)
  }

  @Post('threshold')
  @RequirePermission('inventory', 'update')
  setThreshold(@Body() body: { catalogItemId: string; threshold: number }, @CurrentUser('organizationId') orgId: string) {
    return this.inventory.setThreshold(body.catalogItemId, body.threshold, orgId)
  }
}
