import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Get()
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'read')
  findAll(
    @CurrentUser('organizationId') orgId: string,
    @Query('status') status?: string,
  ) {
    return this.orders.findAll(orgId, { status })
  }

  @Get('stats')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'read')
  getStats(@CurrentUser('organizationId') orgId: string) {
    return this.orders.getStats(orgId)
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'read')
  findOne(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.orders.findOne(id, orgId)
  }

  @Post()
  create(@Body() body: {
    customerName: string; customerEmail: string; customerPhone?: string
    notes?: string; items: { catalogItemId: string; quantity: number }[]
    couponCode?: string
  }, @CurrentUser('organizationId') orgId: string) {
    return this.orders.create(body, orgId)
  }

  @Post(':id/status')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'update')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @CurrentUser('organizationId') orgId: string) {
    return this.orders.updateStatus(id, status, orgId)
  }
}
