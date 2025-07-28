import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AppMailerService } from '../mailer/mailer.service';

interface UserWithRole {
  id: number;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor(
    private readonly jwtService: JwtService,
    private readonly mailerService: AppMailerService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user with default role
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: 'USER', // Default role for new users
      },
    });

    // Send welcome email to the new user
    try {
      await this.mailerService.sendWelcomeEmail({
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toLocaleDateString(),
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/login`,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw - we don't want email failures to break registration
    }

    // Send notification email to admin
    try {
      // Get admin email from environment or use a default
      const adminEmail = process.env.ADMIN_EMAIL || 'kishoyianbrianmwangi@gmail.com';
      
      await this.mailerService.sendAdminUserRegisteredEmail({
        adminEmail: adminEmail,
        newUserName: user.name,
        newUserEmail: user.email,
        newUserRole: user.role,
        registrationDate: user.createdAt.toLocaleDateString(),
      });
    } catch (error) {
      console.error('Failed to send admin notification email:', error);
      // Don't throw - we don't want email failures to break registration
    }

    // Generate JWT token
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    // Check regular user (including drivers)
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string) {
    // Find user by email
    let userWithRole: UserWithRole | null = null;

    const regularUser = await this.prisma.user.findFirst({ where: { email } });
    if (regularUser) {
      userWithRole = {
        id: regularUser.id,
        email: regularUser.email,
        name: regularUser.name,
        role: regularUser.role,
      };
    }

    if (!userWithRole) {
      const admin = await this.prisma.admin.findFirst({ where: { email } });
      if (admin) {
        userWithRole = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'ADMIN',
        };
      }
    }

    if (!userWithRole) {
      // Don't reveal if user exists or not for security
      return {
        message: 'If an account exists, a password reset email has been sent.',
      };
    }

    // Generate reset token (in production, use a proper token system)
    const resetToken = this.jwtService.sign(
      { userId: userWithRole.id, email: userWithRole.email },
      { expiresIn: '15m' },
    );

    // Send password reset email
    try {
      await this.mailerService.sendForgotPasswordEmail(email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw - we don't want email failures to break the process
    }

    return { message: 'Password reset email sent successfully' };
  }

  async verifyOtp(email: string, otp: string) {
    // Find user by email
    const user = await this.prisma.user.findFirst({ where: { email } });
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or OTP');
    }

    // In a real implementation, you would store and verify OTP from database
    // For now, we'll use a simple verification (you should implement proper OTP storage)
    // This is a placeholder - replace with actual OTP verification logic
    const expectedOtp = '123456'; // This should come from your OTP storage system
    
    if (otp !== expectedOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    // Find user by email
    const user = await this.prisma.user.findFirst({ where: { email } });
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or OTP');
    }

    // Verify OTP again (in production, check against stored OTP)
    const expectedOtp = '123456'; // This should come from your OTP storage system
    
    if (otp !== expectedOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successfully' };
  }
}
