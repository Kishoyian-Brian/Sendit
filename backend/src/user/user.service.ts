import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already exists');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({ data: { ...dto, password: hashed } });
    return this.toResponseDto(user);
  }

  async findAll(page = 1, pageSize = 10): Promise<{ data: UserResponseDto[]; total: number; page: number; pageSize: number }> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.user.count(),
    ]);
    return { data: users.map(this.toResponseDto), total, page, pageSize };
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.toResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toResponseDto(user) : null;
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    // Check if role is being changed
    if (dto.role) {
      const currentUser = await this.prisma.user.findUnique({ where: { id } });
      if (!currentUser) throw new NotFoundException('User not found');
      
      // Validate role transition
      if (currentUser.role === 'ADMIN' && dto.role !== 'ADMIN') {
        throw new Error('Cannot demote admin user');
      }
      
      // Only allow specific role transitions
      const validTransitions = {
        'USER': ['DRIVER'],
        'DRIVER': ['USER'],
        'ADMIN': ['ADMIN'] // Admin can only stay admin
      };
      
      const allowedTransitions = validTransitions[currentUser.role] || [];
      if (!allowedTransitions.includes(dto.role)) {
        throw new Error(`Invalid role transition from ${currentUser.role} to ${dto.role}`);
      }
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const user = await this.prisma.user.update({ where: { id }, data: dto });
    return this.toResponseDto(user);
  }

  async promoteToDriver(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    if (user.role === 'ADMIN') {
      throw new Error('Cannot change admin role');
    }
    
    if (user.role === 'DRIVER') {
      throw new Error('User is already a driver');
    }
    
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'DRIVER' }
    });
    
    return this.toResponseDto(updatedUser);
  }

  async demoteFromDriver(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    if (user.role === 'ADMIN') {
      throw new Error('Cannot change admin role');
    }
    
    if (user.role === 'USER') {
      throw new Error('User is already a regular user');
    }
    
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'USER' }
    });
    
    return this.toResponseDto(updatedUser);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async getMe(userId: number): Promise<UserResponseDto> {
    return this.findOne(userId);
  }

  private toResponseDto(user: any): UserResponseDto {
    // Exclude password from response
    const { password, ...rest } = user;
    return rest;
  }
}
