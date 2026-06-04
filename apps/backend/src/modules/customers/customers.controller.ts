import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { CustomersService } from './customers.service'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private customers: CustomersService) {}

  @Get()
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('customers', 'read')
  findAll(
    @CurrentUser('organizationId') orgId: string,
    @Query('search') search?: string,
  ) {
    return this.customers.findAll(orgId, { search })
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('customers', 'read')
  findOne(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.customers.findOne(id, orgId)
  }

  @Post()
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('customers', 'create')
  create(
    @Body() body: {
      name: string
      email: string
      phone?: string
      document?: string
      documentType?: string
      notes?: string
      addresses?: {
        label: string
        street: string
        city: string
        state?: string
        zip?: string
        country?: string
        isDefault?: boolean
      }[]
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.customers.create(body, orgId)
  }

  @Put(':id')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('customers', 'update')
  update(
    @Param('id') id: string,
    @Body() body: {
      name?: string
      email?: string
      phone?: string
      document?: string
      documentType?: string
      notes?: string
      active?: boolean
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.customers.update(id, body, orgId)
  }

  @Delete(':id')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('customers', 'delete')
  remove(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.customers.remove(id, orgId)
  }

  // Addresses
  @Post(':id/addresses')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('customers', 'update')
  addAddress(
    @Param('id') customerId: string,
    @Body() body: {
      label: string
      street: string
      city: string
      state?: string
      zip?: string
      country?: string
      isDefault?: boolean
    },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.customers.addAddress(customerId, body, orgId)
  }

  @Delete(':id/addresses/:addressId')
  @UseGuards(HybridAuthGuard, PermissionGuard)
  @RequirePermission('customers', 'update')
  removeAddress(
    @Param('id') customerId: string,
    @Param('addressId') addressId: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.customers.removeAddress(customerId, addressId, orgId)
  }
}
