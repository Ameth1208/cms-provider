import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { LocationsService } from './locations.service'
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(HybridAuthGuard, PermissionGuard)
@Controller('locations')
export class LocationsController {
  constructor(private locations: LocationsService) {}

  @Get()
  @RequirePermission('settings', 'read')
  findAll(@CurrentUser() user: any) {
    return this.locations.findAll(user.organizationId)
  }

  @Get(':id')
  @RequirePermission('settings', 'read')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.locations.findOne(id, user.organizationId)
  }

  @Post()
  @RequirePermission('settings', 'create')
  create(@Body() dto: CreateLocationDto, @CurrentUser() user: any) {
    return this.locations.create(dto, user.organizationId)
  }

  @Put(':id')
  @RequirePermission('settings', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto, @CurrentUser() user: any) {
    return this.locations.update(id, dto, user.organizationId)
  }

  @Delete(':id')
  @RequirePermission('settings', 'delete')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.locations.remove(id, user.organizationId)
  }
}
