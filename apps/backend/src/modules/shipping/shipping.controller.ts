import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ShippingService } from './shipping.service'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Shipping')
@ApiBearerAuth()
@Controller('shipping')
export class ShippingController {
  constructor(private shipping: ShippingService) {}

  @Get('methods')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'read')
  findAllMethods(@CurrentUser('organizationId') orgId: string) {
    return this.shipping.findAllMethods(orgId)
  }

  @Post('methods')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'create')
  createMethod(
    @Body() body: {
      name: string
      description?: string
      price: number
      estimatedDays?: number
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.shipping.createMethod(body, orgId)
  }

  @Put('methods/:id')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'update')
  updateMethod(
    @Param('id') id: string,
    @Body() body: {
      name?: string
      description?: string
      price?: number
      estimatedDays?: number
      active?: boolean
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.shipping.updateMethod(id, body, orgId)
  }

  @Delete('methods/:id')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('orders', 'delete')
  removeMethod(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.shipping.removeMethod(id, orgId)
  }
}
