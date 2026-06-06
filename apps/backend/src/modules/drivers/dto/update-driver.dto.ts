import { IsString, IsOptional, IsBoolean, IsEmail, IsNumber } from 'class-validator'

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  licenseNumber?: string

  @IsOptional()
  @IsString()
  vehicleType?: string

  @IsOptional()
  @IsString()
  licensePlate?: string

  @IsOptional()
  @IsBoolean()
  active?: boolean

  @IsOptional()
  @IsNumber()
  currentLat?: number

  @IsOptional()
  @IsNumber()
  currentLng?: number
}
