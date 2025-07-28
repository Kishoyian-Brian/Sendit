import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export interface WelcomeEmailData {
  name: string;
  email: string;
  role: string;
  createdAt: string;
  loginUrl: string;
}

export interface ParcelCreatedEmailData {
  toEmail: string;
  toName: string;
  trackingNumber: string;
  recipientName?: string;
  recipientEmail?: string;
  senderName?: string;
  senderEmail?: string;
  pickupAddress: string;
  deliveryAddress: string;
  weight: string;
  description: string;
  createdAt: string;
  isSender: boolean;
}

export interface StatusUpdateEmailData {
  recipientName: string;
  recipientEmail: string;
  trackingNumber: string;
  status: string;
  currentLocation: string;
  estimatedDelivery: string;
}

export interface AdminUserRegisteredEmailData {
  adminEmail: string;
  newUserName: string;
  newUserEmail: string;
  newUserRole: string;
  registrationDate: string;
}

@Injectable()
export class AppMailerService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: `Welcome to SendIt, ${data.name}!`,
        template: 'welcome',
        context: {
          name: data.name,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt,
          loginUrl: data.loginUrl,
        },
      });
      console.log(`Welcome email sent to ${data.email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw - we don't want email failures to break registration
    }
  }

  async sendAdminUserRegisteredEmail(data: AdminUserRegisteredEmailData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.adminEmail,
        subject: `New User Registration - ${data.newUserName}`,
        template: 'admin-user-registered',
        context: {
          adminEmail: data.adminEmail,
          newUserName: data.newUserName,
          newUserEmail: data.newUserEmail,
          newUserRole: data.newUserRole,
          registrationDate: data.registrationDate,
        },
      });
      console.log(`Admin notification email sent to ${data.adminEmail}`);
    } catch (error) {
      console.error('Failed to send admin notification email:', error);
    }
  }

  async sendParcelCreatedEmail(data: ParcelCreatedEmailData): Promise<void> {
    try {
      const subject = data.isSender 
        ? `Package Created - Tracking #${data.trackingNumber}`
        : `Package Incoming - Tracking #${data.trackingNumber}`;

      await this.mailerService.sendMail({
        to: data.toEmail,
        subject: subject,
        template: 'parcel-created',
        context: {
          toName: data.toName,
          trackingNumber: data.trackingNumber,
          recipientName: data.recipientName,
          recipientEmail: data.recipientEmail,
          senderName: data.senderName,
          senderEmail: data.senderEmail,
          pickupAddress: data.pickupAddress,
          deliveryAddress: data.deliveryAddress,
          weight: data.weight,
          description: data.description,
          createdAt: data.createdAt,
          isSender: data.isSender,
        },
      });
      console.log(`Parcel creation email sent to ${data.toEmail}`);
    } catch (error) {
      console.error('Failed to send parcel creation email:', error);
    }
  }

  async sendStatusUpdateEmail(data: StatusUpdateEmailData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.recipientEmail,
        subject: `Package Update - ${data.trackingNumber}`,
        template: 'status-update',
        context: {
          recipientName: data.recipientName,
          recipientEmail: data.recipientEmail,
          trackingNumber: data.trackingNumber,
          status: data.status,
          currentLocation: data.currentLocation,
          estimatedDelivery: data.estimatedDelivery,
        },
      });
      console.log(`Status update email sent to ${data.recipientEmail}`);
    } catch (error) {
      console.error('Failed to send status update email:', error);
    }
  }

  async sendForgotPasswordEmail(email: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request - SendIt',
        template: 'forgot-password',
        context: {
          email,
          resetUrl,
        },
      });
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }
} 