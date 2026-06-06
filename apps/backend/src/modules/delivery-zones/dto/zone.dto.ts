import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator'

export class CreateZoneDto {
  @IsString()
  name: string

  @IsString()
  coordinates: string // JSON string of polygon coordinates

  @IsOptional()
  @IsNumber()
  shippingCost?: number

  @IsOptional()
  @IsNumber()
  estimatedDays?: number

  @IsOptional()
  @IsString()
  color?: string
}

export class UpdateZoneDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  coordinates?: string

  @IsOptional()
  @IsNumber()
  shippingCost?: number

  @IsOptional()
  @IsNumber()
  estimatedDays?: number

  @IsOptional()
  @IsString()
  color?: string

  @IsOptional()
  @IsBoolean()
  active?: boolean
}
