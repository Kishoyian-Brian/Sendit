import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateDriverDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() password: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() vehicle?: string;
  @IsOptional() @IsString() status?: string;
} 