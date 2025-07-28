import { IsOptional, IsString, IsNumber, IsEmail } from 'class-validator';

export class UpdateParcelDto {
  @IsOptional() @IsString() trackingNumber?: string;
  @IsOptional() @IsNumber() senderId?: number;
  @IsOptional() @IsString() recipientName?: string;
  @IsOptional() @IsEmail() recipientEmail?: string;
  @IsOptional() @IsString() recipientPhone?: string;
  @IsOptional() @IsString() pickupAddress?: string;
  @IsOptional() @IsString() pickupLocation?: string;
  @IsOptional() @IsString() deliveryAddress?: string;
  @IsOptional() @IsString() deliveryLocation?: string;
  @IsOptional() @IsNumber() driverId?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() currentLat?: number;
  @IsOptional() @IsNumber() currentLng?: number;
  @IsOptional() @IsString() weight?: string;
  @IsOptional() @IsString() description?: string;
} 