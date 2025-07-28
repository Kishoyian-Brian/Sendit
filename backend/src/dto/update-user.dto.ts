import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../interfaces/user.interface';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  role?: UserRole; // Only allow if admin is updating

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
} 