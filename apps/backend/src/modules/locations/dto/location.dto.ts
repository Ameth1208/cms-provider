import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator'

export class CreateLocationDto {
  @IsString()
  name: string

  @IsString()
  address: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  state?: string

  @IsOptional()
  @IsString()
  zip?: string

  @IsOptional()
  @IsString()
  country?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number

  @IsOptional()
  @IsBoolean()
  isMain?: boolean
}

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  state?: string

  @IsOptional()
  @IsString()
  zip?: string

  @IsOptional()
  @IsString()
  country?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number

  @IsOptional()
  @IsBoolean()
  isMain?: boolean

  @IsOptional()
  @IsBoolean()
  active?: boolean
}
