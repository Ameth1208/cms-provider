import { IsString, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator'
import { ReturnStatus, ReturnReason } from '@prisma/client'

export class CreateReturnDto {
  @IsString()
  orderId: string

  @IsOptional()
  @IsString()
  orderItemId?: string

  @IsEnum(ReturnReason)
  reason: ReturnReason

  @IsOptional()
  @IsString()
  reasonDetails?: string

  @IsOptional()
  @IsArray()
  photos?: string[]

  @IsOptional()
  @IsNumber()
  quantity?: number

  @IsOptional()
  @IsNumber()
  refundAmount?: number

  @IsOptional()
  @IsString()
  pickupAddress?: string

  @IsOptional()
  @IsString()
  pickupDriverId?: string
}

export class UpdateReturnDto {
  @IsOptional()
  @IsEnum(ReturnStatus)
  status?: ReturnStatus

  @IsOptional()
  @IsString()
  condition?: string

  @IsOptional()
  @IsString()
  resolution?: string

  @IsOptional()
  @IsString()
  resolutionNotes?: string

  @IsOptional()
  @IsString()
  receivedBy?: string

  @IsOptional()
  @IsString()
  pickupDriverId?: string
}

export class UpdateReturnStatusDto {
  @IsEnum(ReturnStatus)
  status: ReturnStatus

  @IsOptional()
  @IsString()
  notes?: string
}
