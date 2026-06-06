import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator'
import { RouteStatus } from '@prisma/client'

export class CreateRouteDto {
  @IsString()
  name: string

  @IsString()
  driverId: string

  @IsOptional()
  @IsArray()
  orderIds?: string[]

  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  driverId?: string

  @IsOptional()
  @IsArray()
  orderIds?: string[]

  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus

  @IsOptional()
  @IsString()
  notes?: string
}
