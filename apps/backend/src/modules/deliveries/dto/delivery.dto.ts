import { IsString, IsOptional, IsEnum } from 'class-validator'
import { DeliveryStatus } from '@prisma/client'

export class CreateDeliveryDto {
  @IsString()
  orderId: string

  @IsString()
  driverId: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdateDeliveryStatusDto {
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  failureReason?: string
}

export class CreateTrackingEventDto {
  @IsString()
  status: string

  @IsOptional()
  latitude?: number

  @IsOptional()
  longitude?: number

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  notes?: string
}
