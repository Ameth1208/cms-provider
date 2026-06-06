import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { InvitationsService } from './invitations.service'
import { CreateInvitationDto, ResendInvitationDto } from './dto/invitation.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private invitations: InvitationsService) {}

  @Get()
  @RequirePermission('users', 'read')
  findAll(@CurrentUser() user: any) {
    return this.invitations.findAll(user.organizationId)
  }

  @Post()
  @RequirePermission('users', 'create')
  create(
    @Body() data: CreateInvitationDto,
    @CurrentUser() user: any,
  ) {
    return this.invitations.create(data, user.organizationId, user.sub)
  }

  @Post(':id/resend')
  @RequirePermission('users', 'create')
  resend(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invitations.resend(id, user.organizationId)
  }

  @Delete(':id')
  @RequirePermission('users', 'delete')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invitations.delete(id, user.organizationId)
  }
}
