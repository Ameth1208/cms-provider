import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface InvitationMail {
  to: string
  organizationName: string
  invitationUrl: string
}

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name)

  constructor(private config: ConfigService) {}

  async sendInvitation(data: InvitationMail): Promise<void> {
    const provider = this.config.get('MAIL_PROVIDER', 'log')

    if (provider === 'log') {
      this.logger.log(`📧 INVITATION EMAIL`)
      this.logger.log(`   To: ${data.to}`)
      this.logger.log(`   Organization: ${data.organizationName}`)
      this.logger.log(`   Link: ${data.invitationUrl}`)
      return
    }

    // TODO: integrate with actual email providers
    // Examples:
    // if (provider === 'resend') return this.sendWithResend(data)
    // if (provider === 'sendgrid') return this.sendWithSendGrid(data)
    // if (provider === 'smtp') return this.sendWithSMTP(data)

    throw new Error(`Unsupported mail provider: ${provider}`)
  }
}
