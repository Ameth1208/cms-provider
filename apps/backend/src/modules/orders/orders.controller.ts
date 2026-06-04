import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
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

  @Put(':id')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'update')
  update(
    @Param('id') id: string,
    @Body() body: {
      status?: string
      customerName?: string
      customerEmail?: string
      customerPhone?: string
      shippingAddress?: string
      shippingCity?: string
      shippingState?: string
      shippingZip?: string
      shippingCountry?: string
      carrier?: string
      trackingNumber?: string
      notes?: string
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.orders.update(id, body, orgId)
  }

  @Post(':id/status')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'update')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @CurrentUser('organizationId') orgId: string) {
    return this.orders.updateStatus(id, status, orgId)
  }

  @Post(':id/items')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'update')
  addItem(
    @Param('id') id: string,
    @Body() body: { catalogItemId: string; quantity: number },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.orders.addItem(id, body, orgId)
  }

  @Delete(':id/items/:itemId')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'update')
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.orders.removeItem(id, itemId, orgId)
  }
}
