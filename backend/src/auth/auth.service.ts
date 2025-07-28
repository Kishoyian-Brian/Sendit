import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailerService } from '../mailer/mailer.service';

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
    private readonly mailerService: MailerService
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email }
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

    // Send welcome email
    try {
      await this.mailerService.sendWelcomeEmail({
        to: user.email,
        name: user.name,
        email: user.email,
        role: user.role,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/login`,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail registration if email fails
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
    // Check admin first
    let user = await this.prisma.admin.findFirst({
      where: { email: dto.email }
    });

    if (user) {
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        userId: user.id,
        email: user.email,
        role: 'ADMIN',
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'ADMIN',
        },
      };
    }

    // Check driver
    user = await this.prisma.driver.findFirst({
      where: { email: dto.email }
    });

    if (user) {
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        userId: user.id,
        email: user.email,
        role: 'DRIVER',
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'DRIVER',
        },
      };
    }

    // Check regular user
    const regularUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
      }
    });

    if (!regularUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, regularUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: regularUser.id,
      email: regularUser.email,
      role: regularUser.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: regularUser.id,
        email: regularUser.email,
        name: regularUser.name,
        role: regularUser.role,
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
      const driver = await this.prisma.driver.findFirst({ where: { email } });
      if (driver) {
        userWithRole = {
          id: driver.id,
          email: driver.email,
          name: driver.name,
          role: 'DRIVER',
        };
      }
    }

    if (!userWithRole) {
      // Don't reveal if user exists or not for security
      return { message: 'If an account exists, a password reset email has been sent.' };
    }

    // Generate reset token (in production, use a proper token system)
    const resetToken = this.jwtService.sign(
      { userId: userWithRole.id, email: userWithRole.email },
      { expiresIn: '15m' }
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      await this.mailerService.sendForgotPasswordEmail({
        to: userWithRole.email,
        name: userWithRole.name,
        resetUrl,
        expiryTime: '15',
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    return { message: 'Password reset email sent successfully' };
  }
}
