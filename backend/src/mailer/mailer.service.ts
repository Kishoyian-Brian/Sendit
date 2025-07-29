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

export interface ContactFormEmailData {
  name: string;
  email: string;
  message: string;
}

@Injectable()
export class AppMailerService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SendIt Express</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .email-container {
              background: white;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            h1 {
              font-size: 24px;
              font-weight: 600;
              color: #222;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
              margin-top: 0;
            }
            .divider {
              height: 1px;
              background: #eee;
              margin: 25px 0;
            }
            .welcome-message {
              font-size: 16px;
              margin-bottom: 25px;
            }
            .cta-button {
              display: inline-block;
              background: #991b1b; /* Updated to deep red */
              color: white !important;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
              transition: background-color 0.2s ease;
            }
            .cta-button:hover {
              background: #7a1616; /* Darker shade on hover */
            }
            .signature {
              font-family: 'Brush Script MT', cursive;
              font-size: 24px;
              color: #333;
              margin-top: 30px;
            }
            .footer {
              font-size: 14px;
              color: #999;
              text-align: center;
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Welcome to SendIt Express, ${data.name}!</h1>
              <p class="subtitle">We're glad you joined us at ${data.createdAt}.</p>
            </div>

            <div class="welcome-message">
              <p>Thanks for signing up! We're here to make shipping effortless for you.</p>
              <p>To get started, click below to login to your account:</p>
            </div>

            <div style="text-align: center;">
              <a href="${data.loginUrl}" class="cta-button">Login to Your Account</a>
            </div>

            <div class="divider"></div>

            <p><strong>Need help?</strong> Reply to this email—we're happy to assist.</p>

            <p class="signature">— The SendIt Team</p>

            <div class="footer">
              <p>SendIt Express · 123 Shipping Lane · San Francisco, CA</p>
              <p><a href="#" style="color: #999; text-decoration: underline;">Unsubscribe</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.mailerService.sendMail({
        to: data.email,
        subject: `Welcome to SendIt Express, ${data.name}!`,
        html: htmlContent,
      });
      console.log(`Welcome email sent to ${data.email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw - we don't want email failures to break registration
    }
  }

  async sendAdminUserRegisteredEmail(data: AdminUserRegisteredEmailData): Promise<void> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New User Registration - SendIt</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #BA0C2F; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SENDIT Admin</h1>
            </div>
            <div class="content">
              <h2>New User Registration</h2>
              <div class="alert">
                <strong>A new user has registered on SendIt Express.</strong>
              </div>
              
              <h3>User Details:</h3>
              <ul>
                <li><strong>Name:</strong> ${data.newUserName}</li>
                <li><strong>Email:</strong> ${data.newUserEmail}</li>
                <li><strong>Role:</strong> ${data.newUserRole}</li>
                <li><strong>Registration Date:</strong> ${data.registrationDate}</li>
              </ul>
              
              <p>This user can now access the platform with their registered credentials.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 SendIt Express. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.mailerService.sendMail({
        to: data.adminEmail,
        subject: `New User Registration - ${data.newUserName}`,
        html: htmlContent,
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

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body {
              font-family: 'Segoe UI', Roboto, sans-serif;
              line-height: 1.5;
              color: #333;
              background-color: #f9f9f9;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
            }
            .header {
              background-color: #BA0C2F;
              color: white;
              padding: 30px 0;
              text-align: center;
            }
            .content {
              padding: 30px;
            }
            h2 {
              color: #BA0C2F;
              margin-top: 0;
            }
            .info-card {
              background: white;
              padding: 20px;
              margin: 25px 0;
              box-shadow: 0 3px 10px rgba(0,0,0,0.05);
              border-radius: 8px;
            }
            .tracking-number {
              font-size: 20px;
              font-weight: bold;
              color: #BA0C2F;
              letter-spacing: 1px;
            }
            .status {
              display: inline-block;
              padding: 4px 12px;
              background: #f0f0f0;
              border-radius: 20px;
              font-size: 14px;
              margin-top: 10px;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin-bottom: 8px;
            }
            .action-buttons {
              display: flex;
              gap: 15px;
              margin: 30px 0;
            }
            .btn {
              display: inline-block;
              padding: 12px 25px;
              border-radius: 6px;
              font-weight: 600;
              text-decoration: none;
              text-align: center;
              flex: 1;
            }
            .btn-primary {
              background-color: #BA0C2F;
              color: white;
            }
            .btn-secondary {
              background-color: #f0f0f0;
              color: #333;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #999;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SENDIT</h1>
            </div>
            
            <div class="content">
              <h2>${subject}</h2>
              <p>Hello ${data.toName},</p>
              
              <div class="info-card">
                <h3>Tracking Information</h3>
                <p class="tracking-number">${data.trackingNumber}</p>
                <span class="status">${data.isSender ? 'Ready for pickup' : 'Incoming package'}</span>
                <p><small>Created: ${data.createdAt}</small></p>
              </div>
              
              <div class="info-card">
                <h3>Package Details</h3>
                <ul>
                  <li><strong>Weight:</strong> ${data.weight}</li>
                  <li><strong>Description:</strong> ${data.description}</li>
                  <li><strong>From:</strong> ${data.pickupAddress}</li>
                  <li><strong>To:</strong> ${data.deliveryAddress}</li>
                </ul>
              </div>
              
              <div class="info-card">
                ${data.isSender ? `
                  <h3>Recipient</h3>
                  <p>${data.recipientName || 'Not specified'}</p>
                  <p>${data.recipientEmail || ''}</p>
                ` : `
                  <h3>Sender</h3>
                  <p>${data.senderName || 'Not specified'}</p>
                  <p>${data.senderEmail || ''}</p>
                `}
              </div>

              <div class="action-buttons">
                <a href="https://sendit.com/login" class="btn btn-secondary">Login to Account</a>
                <a href="https://sendit.com/track/${data.trackingNumber}" class="btn btn-primary">Track Your Parcel</a>
              </div>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 SendIt Express</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.mailerService.sendMail({
        to: data.toEmail,
        subject: subject,
        html: htmlContent,
      });
      console.log(`Parcel creation email sent to ${data.toEmail}`);
    } catch (error) {
      console.error('Failed to send parcel creation email:', error);
    }
  }

  async sendStatusUpdateEmail(data: StatusUpdateEmailData): Promise<void> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Package Update - ${data.trackingNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #BA0C2F; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .status-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .details-box { background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SENDIT</h1>
            </div>
            <div class="content">
              <h2>Package Status Update</h2>
              <p>Hello ${data.recipientName},</p>
              
              <div class="status-box">
                <h3>Tracking Number: ${data.trackingNumber}</h3>
                <p><strong>Current Status:</strong> ${data.status}</p>
                <p><strong>Current Location:</strong> ${data.currentLocation}</p>
                <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
              </div>
              
              <div class="details-box">
                <h3>Package Information:</h3>
                <ul>
                  <li><strong>Recipient:</strong> ${data.recipientName}</li>
                  <li><strong>Email:</strong> ${data.recipientEmail}</li>
                  <li><strong>Tracking Number:</strong> ${data.trackingNumber}</li>
                </ul>
              </div>
              
              <p>Your package is on its way! You can continue to track its progress using the tracking number above.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 SendIt Express. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.mailerService.sendMail({
        to: data.recipientEmail,
        subject: `Package Update - ${data.trackingNumber}`,
        html: htmlContent,
      });
      console.log(`Status update email sent to ${data.recipientEmail}`);
    } catch (error) {
      console.error('Failed to send status update email:', error);
    }
  }

  async sendForgotPasswordEmail(email: string, otp: string, userName: string): Promise<void> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset OTP - SendIt</title>
          <style>
            body {
              font-family: 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f9f9f9;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #BA0C2F;
              color: white;
              padding: 30px 0;
              text-align: center;
            }
            .content {
              padding: 30px;
            }
            h2 {
              color: #BA0C2F;
              margin-top: 0;
              text-align: center;
            }
            .otp-box {
              background: #f8f9fa;
              border: 2px dashed #BA0C2F;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
              text-align: center;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #BA0C2F;
              letter-spacing: 4px;
              font-family: 'Courier New', monospace;
            }
            .alert {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 14px;
              background-color: #f8f9fa;
            }
            .warning {
              background-color: #f8d7da;
              border: 1px solid #f5c6cb;
              color: #721c24;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SENDIT</h1>
            </div>
            <div class="content">
              <h2>Password Reset OTP</h2>
              
              <p>Hello ${userName},</p>
              
              <div class="alert">
                <strong>You have requested to reset your password.</strong>
              </div>
              
              <p>We received a request to reset your password for your SendIt account. Use the OTP below to complete your password reset:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin-top: 10px; color: #666; font-size: 14px;">Enter this code in the password reset form</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This OTP will expire in 15 minutes</li>
                  <li>Never share this code with anyone</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                </ul>
              </div>
              
              <p style="text-align: center; margin-top: 30px;">
                <strong>Need help?</strong> Contact our support team if you have any questions.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2024 SendIt Express. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset OTP - SendIt Express',
        html: htmlContent,
      });
      console.log(`Password reset OTP email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send password reset OTP email:', error);
    }
  }

  async sendContactFormEmail(data: ContactFormEmailData): Promise<void> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@sendit.com';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Form Submission - SendIt</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #BA0C2F; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .message-box { background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SENDIT</h1>
            </div>
            <div class="content">
              <h2>New Contact Form Submission</h2>
              <p>A new contact form has been submitted on the SendIt website.</p>
              
              <h3>Contact Details:</h3>
              <ul>
                <li><strong>Name:</strong> ${data.name}</li>
                <li><strong>Email:</strong> ${data.email}</li>
              </ul>
              
              <h3>Message:</h3>
              <div class="message-box">
                <p>${data.message}</p>
              </div>
              
              <p>Please respond to this inquiry as soon as possible.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 SendIt Express. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      await this.mailerService.sendMail({
        to: adminEmail,
        subject: `New Contact Form Submission - ${data.name}`,
        html: htmlContent,
      });
      console.log(`Contact form email sent to admin from ${data.email}`);
    } catch (error) {
      console.error('Failed to send contact form email:', error);
    }
  }
} 