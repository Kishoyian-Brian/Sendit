import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { 
  SendEmailDto, 
  SendBulkEmailDto,
  WelcomeEmailDto,
  ParcelCreatedEmailDto,
  StatusUpdateEmailDto,
  ForgotPasswordEmailDto
} from './dto/send-email.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/decorators/role.decorator';

@Controller('mailer')
@UseGuards(JwtAuthGuard, RoleGuard)
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send')
  @Roles('ADMIN')
  async sendEmail(@Body() dto: SendEmailDto) {
    const success = await this.mailerService.sendEmail(dto);
    return { success, message: success ? 'Email sent successfully' : 'Failed to send email' };
  }

  @Post('send-bulk')
  @Roles('ADMIN')
  async sendBulkEmail(@Body() dto: SendBulkEmailDto) {
    const result = await this.mailerService.sendBulkEmail(dto);
    return {
      ...result,
      message: `Bulk email sent. Success: ${result.success}, Failed: ${result.failed}`
    };
  }

  @Post('welcome')
  @Roles('ADMIN')
  async sendWelcomeEmail(@Body() dto: WelcomeEmailDto) {
    const success = await this.mailerService.sendWelcomeEmail(dto);
    return { success, message: success ? 'Welcome email sent' : 'Failed to send welcome email' };
  }

  @Post('parcel-created')
  @Roles('ADMIN')
  async sendParcelCreatedEmail(@Body() dto: ParcelCreatedEmailDto) {
    const success = await this.mailerService.sendParcelCreatedEmail(dto);
    return { success, message: success ? 'Parcel created email sent' : 'Failed to send parcel email' };
  }

  @Post('status-update')
  @Roles('ADMIN')
  async sendStatusUpdateEmail(@Body() dto: StatusUpdateEmailDto) {
    const success = await this.mailerService.sendStatusUpdateEmail(dto);
    return { success, message: success ? 'Status update email sent' : 'Failed to send status email' };
  }

  @Post('forgot-password')
  async sendForgotPasswordEmail(@Body() dto: ForgotPasswordEmailDto) {
    const success = await this.mailerService.sendForgotPasswordEmail(dto);
    return { success, message: success ? 'Password reset email sent' : 'Failed to send reset email' };
  }

  @Post('delivery-confirmation')
  @Roles('ADMIN')
  async sendDeliveryConfirmation(
    @Body() data: {
      to: string;
      recipientName: string;
      trackingNumber: string;
      deliveredAt: string;
      driverName: string;
    }
  ) {
    const success = await this.mailerService.sendDeliveryConfirmationEmail(
      data.to,
      data.recipientName,
      data.trackingNumber,
      data.deliveredAt,
      data.driverName
    );
    return { success, message: success ? 'Delivery confirmation sent' : 'Failed to send confirmation' };
  }

  @Post('driver-assignment')
  @Roles('ADMIN')
  async sendDriverAssignment(
    @Body() data: {
      to: string;
      recipientName: string;
      trackingNumber: string;
      driverName: string;
      driverPhone: string;
    }
  ) {
    const success = await this.mailerService.sendDriverAssignmentEmail(
      data.to,
      data.recipientName,
      data.trackingNumber,
      data.driverName,
      data.driverPhone
    );
    return { success, message: success ? 'Driver assignment email sent' : 'Failed to send assignment email' };
  }

  @Post('pickup-notification')
  @Roles('ADMIN')
  async sendPickupNotification(
    @Body() data: {
      to: string;
      recipientName: string;
      trackingNumber: string;
      pickupTime: string;
    }
  ) {
    const success = await this.mailerService.sendPickupNotificationEmail(
      data.to,
      data.recipientName,
      data.trackingNumber,
      data.pickupTime
    );
    return { success, message: success ? 'Pickup notification sent' : 'Failed to send pickup notification' };
  }

  @Get('test/:email')
  @Roles('ADMIN')
  async testEmail(@Param('email') email: string) {
    const success = await this.mailerService.sendTestEmail(email);
    return { success, message: success ? 'Test email sent' : 'Failed to send test email' };
  }
}
