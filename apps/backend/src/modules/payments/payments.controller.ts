import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { PaymentsService } from './payments.service'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Get()
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'read')
  findAll(
    @CurrentUser('organizationId') orgId: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
  ) {
    return this.payments.findAll(orgId, { status, method })
  }

  @Get('stats')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'read')
  getStats(@CurrentUser('organizationId') orgId: string) {
    return this.payments.getStats(orgId)
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'read')
  findOne(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.payments.findOne(id, orgId)
  }

  @Post()
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'create')
  create(
    @Body() body: {
      orderId: string
      method: string
      amount: number
      currency?: string
      reference?: string
      externalId?: string
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.payments.create(body, orgId)
  }

  @Put(':id/status')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'update')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.payments.updateStatus(id, status, orgId)
  }

  @Put(':id/refund')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'update')
  refund(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.payments.refund(id, amount, orgId)
  }
}
