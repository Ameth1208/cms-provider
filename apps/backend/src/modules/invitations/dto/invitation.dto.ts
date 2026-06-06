import { IsString, IsOptional, IsArray, IsEmail } from 'class-validator'

export class CreateInvitationDto {
  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  name?: string

  @IsArray()
  roleIds: string[]

  @IsOptional()
  @IsArray()
  modulesEnabled?: string[]
}

export class ResendInvitationDto {
  @IsString()
  invitationId: string
}
