import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator'

export class CreateDriverDto {
  @IsString()
  name: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsString()
  phone: string

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
  @IsString()
  userId?: string
}
