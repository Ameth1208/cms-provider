import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { DeliveriesService } from './deliveries.service'
import { CreateDeliveryDto, UpdateDeliveryStatusDto, CreateTrackingEventDto } from './dto/delivery.dto'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Deliveries')
@ApiBearerAuth()
@UseGuards(HybridAuthGuard, PermissionGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private deliveries: DeliveriesService) {}

  @Get()
  @RequirePermission('orders', 'read')
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('driverId') driverId?: string,
  ) {
    return this.deliveries.findAll(user.organizationId, { status, driverId })
  }

  @Get('stats')
  @RequirePermission('orders', 'read')
  getStats(@CurrentUser() user: any) {
    return this.deliveries.getStats(user.organizationId)
  }

  @Get('my-orders')
  @RequirePermission('orders', 'read')
  getMyOrders(@CurrentUser() user: any) {
    // For drivers to see their assigned deliveries
    return this.deliveries.findByDriver(user.sub, user.organizationId)
  }

  @Get(':id')
  @RequirePermission('orders', 'read')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.deliveries.findOne(id, user.organizationId)
  }

  @Post()
  @RequirePermission('orders', 'update')
  create(@Body() dto: CreateDeliveryDto, @CurrentUser() user: any) {
    return this.deliveries.create(dto, user.organizationId)
  }

  @Put(':id/status')
  @RequirePermission('orders', 'update')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.deliveries.updateStatus(id, dto, user.organizationId)
  }

  @Post(':id/tracking')
  @RequirePermission('orders', 'update')
  addTrackingEvent(
    @Param('id') id: string,
    @Body() dto: CreateTrackingEventDto,
    @CurrentUser() user: any,
  ) {
    return this.deliveries.addTrackingEvent(id, dto, user.organizationId)
  }

  @Get(':id/tracking')
  @RequirePermission('orders', 'read')
  getTrackingEvents(@Param('id') id: string, @CurrentUser() user: any) {
    return this.deliveries.getTrackingEvents(id, user.organizationId)
  }

  @Post(':id/complete')
  @RequirePermission('orders', 'update')
  completeDelivery(
    @Param('id') id: string,
    @Body() body: { photoUrl?: string; signatureUrl?: string; deliveredTo?: string; notes?: string },
    @CurrentUser() user: any,
  ) {
    return this.deliveries.completeDelivery(id, body, user.organizationId)
  }
}
