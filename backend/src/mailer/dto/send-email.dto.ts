import { IsEmail, IsString, IsOptional, IsArray } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  template: string;

  @IsOptional()
  context?: Record<string, any>;
}

export class SendBulkEmailDto {
  @IsArray()
  @IsEmail({}, { each: true })
  to: string[];

  @IsString()
  subject: string;

  @IsString()
  template: string;

  @IsOptional()
  context?: Record<string, any>;
}

export class WelcomeEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  role: string;

  @IsString()
  loginUrl: string;
}

export class ParcelCreatedEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  recipientName: string;

  @IsString()
  trackingNumber: string;

  @IsString()
  pickupAddress: string;

  @IsString()
  deliveryAddress: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  trackingUrl: string;
}

export class StatusUpdateEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  recipientName: string;

  @IsString()
  trackingNumber: string;

  @IsString()
  previousStatus: string;

  @IsString()
  newStatus: string;

  @IsString()
  updatedAt: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  estimatedArrival?: string;

  @IsOptional()
  @IsString()
  statusMessage?: string;

  @IsString()
  trackingUrl: string;
}

export class ForgotPasswordEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  name: string;

  @IsString()
  resetUrl: string;

  @IsString()
  expiryTime: string;
} 