import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { ReturnsService } from './returns.service'
import { CreateReturnDto, UpdateReturnDto, UpdateReturnStatusDto } from './dto/return.dto'

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private returns: ReturnsService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.returns.findAll(user.organizationId, { status, orderId })
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.returns.getStats(user.organizationId)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.returns.findOne(id, user.organizationId)
  }

  @Post()
  create(@Body() data: CreateReturnDto, @CurrentUser() user: any) {
    return this.returns.create(data, user.organizationId)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateReturnDto, @CurrentUser() user: any) {
    return this.returns.update(id, data, user.organizationId)
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() data: UpdateReturnStatusDto, @CurrentUser() user: any) {
    return this.returns.updateStatus(id, data, user.organizationId)
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.returns.delete(id, user.organizationId)
  }
}
