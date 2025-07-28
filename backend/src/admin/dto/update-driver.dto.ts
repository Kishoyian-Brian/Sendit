import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateDriverDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() vehicle?: string;
  @IsOptional() @IsString() status?: string;
} 