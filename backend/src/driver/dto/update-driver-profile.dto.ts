import { IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateDriverProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  vehicle?: string;

  @IsOptional()
  @IsString()
  status?: string;
} 