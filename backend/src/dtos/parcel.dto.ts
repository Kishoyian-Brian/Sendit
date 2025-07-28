import { IsString, IsOptional, IsNumber, IsEmail, IsEnum } from 'class-validator';

export enum ParcelStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  ASSIGNED = 'assigned',
  PENDING_PICKUP = 'pending_pickup'
}

export class CreateParcelDto {
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsNumber()
  senderId: number;

  @IsString()
  recipientName: string;

  @IsEmail()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsString()
  pickupAddress: string;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsString()
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  deliveryLocation?: string;

  @IsOptional()
  @IsNumber()
  driverId?: number;

  @IsOptional()
  @IsEnum(ParcelStatus)
  status?: ParcelStatus;

  @IsOptional()
  @IsNumber()
  currentLat?: number;

  @IsOptional()
  @IsNumber()
  currentLng?: number;

  @IsOptional()
  @IsString()
  currentAddress?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateParcelDto {
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsNumber()
  senderId?: number;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  pickupAddress?: string;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  deliveryLocation?: string;

  @IsOptional()
  @IsNumber()
  driverId?: number;

  @IsOptional()
  @IsEnum(ParcelStatus)
  status?: ParcelStatus;

  @IsOptional()
  @IsNumber()
  currentLat?: number;

  @IsOptional()
  @IsNumber()
  currentLng?: number;

  @IsOptional()
  @IsString()
  currentAddress?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ParcelResponseDto {
  id: number;
  trackingNumber: string;
  senderId: number;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  pickupAddress: string;
  pickupLocation?: string;
  deliveryAddress: string;
  deliveryLocation?: string;
  driverId?: number;
  status: ParcelStatus;
  currentLat?: number;
  currentLng?: number;
  currentAddress?: string;
  weight?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
  eta?: string;
} 