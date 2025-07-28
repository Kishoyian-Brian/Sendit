import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { 
  SendEmailDto, 
  SendBulkEmailDto,
  WelcomeEmailDto,
  ParcelCreatedEmailDto,
  StatusUpdateEmailDto,
  ForgotPasswordEmailDto
} from './dto/send-email.dto';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly mailerService: NestMailerService) {}

  /**
   * Send a generic email using a template
   */
  async sendEmail(dto: SendEmailDto): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: dto.to,
        subject: dto.subject,
        template: dto.template,
        context: dto.context || {},
      });
      
      this.logger.log(`Email sent successfully to ${dto.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${dto.to}:`, error);
      return false;
    }
  }

  /**
   * Send bulk emails to multiple recipients
   */
  async sendBulkEmail(dto: SendBulkEmailDto): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const email of dto.to) {
      try {
        await this.mailerService.sendMail({
          to: email,
          subject: dto.subject,
          template: dto.template,
          context: dto.context || {},
        });
        success++;
        this.logger.log(`Bulk email sent successfully to ${email}`);
      } catch (error) {
        failed++;
        this.logger.error(`Failed to send bulk email to ${email}:`, error);
      }
    }

    return { success, failed };
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(dto: WelcomeEmailDto): Promise<boolean> {
    return this.sendEmail({
      to: dto.to,
      subject: 'Welcome to SendIt! 🚚',
      template: 'welcome',
      context: {
        name: dto.name,
        email: dto.email,
        role: dto.role,
        loginUrl: dto.loginUrl,
        createdAt: new Date().toLocaleDateString(),
      },
    });
  }

  /**
   * Send parcel created notification
   */
  async sendParcelCreatedEmail(dto: ParcelCreatedEmailDto): Promise<boolean> {
    return this.sendEmail({
      to: dto.to,
      subject: `Parcel Created - Tracking #${dto.trackingNumber}`,
      template: 'parcel-created',
      context: {
        recipientName: dto.recipientName,
        trackingNumber: dto.trackingNumber,
        pickupAddress: dto.pickupAddress,
        deliveryAddress: dto.deliveryAddress,
        status: dto.status,
        weight: dto.weight,
        description: dto.description,
        trackingUrl: dto.trackingUrl,
      },
    });
  }

  /**
   * Send parcel status update notification
   */
  async sendStatusUpdateEmail(dto: StatusUpdateEmailDto): Promise<boolean> {
    return this.sendEmail({
      to: dto.to,
      subject: `Parcel Status Update - ${dto.trackingNumber}`,
      template: 'status-update',
      context: {
        recipientName: dto.recipientName,
        trackingNumber: dto.trackingNumber,
        previousStatus: dto.previousStatus,
        newStatus: dto.newStatus,
        updatedAt: dto.updatedAt,
        driverName: dto.driverName,
        estimatedArrival: dto.estimatedArrival,
        statusMessage: dto.statusMessage,
        trackingUrl: dto.trackingUrl,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendForgotPasswordEmail(dto: ForgotPasswordEmailDto): Promise<boolean> {
    return this.sendEmail({
      to: dto.to,
      subject: 'Password Reset Request - SendIt',
      template: 'forgot-password',
      context: {
        name: dto.name,
        resetUrl: dto.resetUrl,
        expiryTime: dto.expiryTime,
      },
    });
  }

  /**
   * Send delivery confirmation email
   */
  async sendDeliveryConfirmationEmail(
    to: string,
    recipientName: string,
    trackingNumber: string,
    deliveredAt: string,
    driverName: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Parcel Delivered! - ${trackingNumber}`,
      template: 'status-update',
      context: {
        recipientName,
        trackingNumber,
        previousStatus: 'in_transit',
        newStatus: 'delivered',
        updatedAt: deliveredAt,
        driverName,
        statusMessage: 'Your parcel has been successfully delivered!',
        trackingUrl: `${process.env.FRONTEND_URL}/track/${trackingNumber}`,
      },
    });
  }

  /**
   * Send driver assignment notification
   */
  async sendDriverAssignmentEmail(
    to: string,
    recipientName: string,
    trackingNumber: string,
    driverName: string,
    driverPhone: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Driver Assigned - ${trackingNumber}`,
      template: 'status-update',
      context: {
        recipientName,
        trackingNumber,
        previousStatus: 'pending',
        newStatus: 'assigned',
        updatedAt: new Date().toLocaleString(),
        driverName,
        statusMessage: `Your parcel has been assigned to ${driverName}. Contact: ${driverPhone}`,
        trackingUrl: `${process.env.FRONTEND_URL}/track/${trackingNumber}`,
      },
    });
  }

  /**
   * Send pickup notification
   */
  async sendPickupNotificationEmail(
    to: string,
    recipientName: string,
    trackingNumber: string,
    pickupTime: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Parcel Picked Up - ${trackingNumber}`,
      template: 'status-update',
      context: {
        recipientName,
        trackingNumber,
        previousStatus: 'assigned',
        newStatus: 'in_transit',
        updatedAt: pickupTime,
        statusMessage: 'Your parcel has been picked up and is now in transit!',
        trackingUrl: `${process.env.FRONTEND_URL}/track/${trackingNumber}`,
      },
    });
  }

  /**
   * Test email functionality
   */
  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'SendIt Email Test',
      template: 'welcome',
      context: {
        name: 'Test User',
        email: to,
        role: 'USER',
        loginUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
        createdAt: new Date().toLocaleDateString(),
      },
    });
  }
}
