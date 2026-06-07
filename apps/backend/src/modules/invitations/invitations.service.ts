import { Injectable } from '@nestjs/common'
import { CreateInvitationDto } from './dto/invitation.dto'
import { FindAllInvitationsUseCase } from './use-cases/find-all-invitations.use-case'
import { CreateInvitationUseCase } from './use-cases/create-invitation.use-case'
import { ResendInvitationUseCase } from './use-cases/resend-invitation.use-case'
import { DeleteInvitationUseCase } from './use-cases/delete-invitation.use-case'

@Injectable()
export class InvitationsService {
  constructor(
    private findAllInvitations: FindAllInvitationsUseCase,
    private createInvitation: CreateInvitationUseCase,
    private resendInvitation: ResendInvitationUseCase,
    private deleteInvitation: DeleteInvitationUseCase,
  ) {}

  async findAll(organizationId: string) {
    return this.findAllInvitations.execute(organizationId)
  }

  async create(data: CreateInvitationDto, organizationId: string, invitedBy: string) {
    return this.createInvitation.execute(data, organizationId, invitedBy)
  }

  async resend(id: string, organizationId: string) {
    return this.resendInvitation.execute(id, organizationId)
  }

  async delete(id: string, organizationId: string) {
    return this.deleteInvitation.execute(id, organizationId)
  }
}
