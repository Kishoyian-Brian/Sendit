import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class CreateParcelDto {
  @IsOptional() @IsString() trackingNumber?: string;
  @IsNumber() senderId: number;
  @IsString() recipientName: string;
  @IsEmail() recipientEmail: string;
  @IsOptional() @IsString() recipientPhone?: string;
  @IsString() pickupAddress: string;
  @IsOptional() @IsString() pickupLocation?: string;
  @IsString() deliveryAddress: string;
  @IsOptional() @IsString() deliveryLocation?: string;
  @IsOptional() @IsNumber() driverId?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() currentLat?: number;
  @IsOptional() @IsNumber() currentLng?: number;
  @IsOptional() @IsString() weight?: string;
  @IsOptional() @IsString() description?: string;
} 