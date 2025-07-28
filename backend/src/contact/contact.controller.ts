import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AppMailerService } from '../mailer/mailer.service';

interface ContactData {
  name: string;
  email: string;
  message: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly mailerService: AppMailerService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async submitContactForm(@Body() contactData: ContactData) {
    try {
      await this.mailerService.sendContactFormEmail({
        name: contactData.name,
        email: contactData.email,
        message: contactData.message,
      });

      return {
        success: true,
        message: 'Thank you for your message. We will get back to you soon!'
      };
    } catch (error) {
      console.error('Contact form submission error:', error);
      return {
        success: false,
        message: 'Failed to send message. Please try again later.'
      };
    }
  }
} 