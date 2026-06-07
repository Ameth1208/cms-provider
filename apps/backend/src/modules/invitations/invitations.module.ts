import { Module } from '@nestjs/common'
import { InvitationsService } from './invitations.service'
import { InvitationsController } from './invitations.controller'
import { FindAllInvitationsUseCase } from './use-cases/find-all-invitations.use-case'
import { CreateInvitationUseCase } from './use-cases/create-invitation.use-case'
import { ResendInvitationUseCase } from './use-cases/resend-invitation.use-case'
import { DeleteInvitationUseCase } from './use-cases/delete-invitation.use-case'

@Module({
  controllers: [InvitationsController],
  providers: [
    InvitationsService,
    FindAllInvitationsUseCase,
    CreateInvitationUseCase,
    ResendInvitationUseCase,
    DeleteInvitationUseCase,
  ],
  exports: [InvitationsService],
})
export class InvitationsModule {}
