import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { AppMailerService } from '../mailer/mailer.service';

@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  constructor(private mailerService: AppMailerService) {}

  // Parcels
  async getParcels(page = 1, pageSize = 12) {
    console.log('AdminService.getParcels called with page:', page, 'pageSize:', pageSize);
    const skip = (page - 1) * pageSize;
    const [parcels, total] = await Promise.all([
      this.prisma.parcel.findMany({
        skip,
        take: pageSize,
        include: {
          sender: { select: { id: true, name: true, email: true } },
          driver: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.parcel.count()
    ]);
    
    const result = {
      data: parcels,
      total,
      page,
      pageSize
    };
    
    console.log('AdminService.getParcels result:', result);
    console.log('Parcels found:', parcels.length);
    console.log('Total parcels in DB:', total);
    
    return result;
  }
  async createParcel(dto: CreateParcelDto) {
    try {
      // Generate tracking number if not provided
      let trackingNumber = dto.trackingNumber;
      if (!trackingNumber) {
        trackingNumber = `SEXP-254-${Date.now()}`;
      }

      // Check if tracking number already exists
      const existingParcel = await this.prisma.parcel.findUnique({
        where: { trackingNumber }
      });
      if (existingParcel) {
        throw new BadRequestException('Tracking number already exists');
      }

      // Get sender details
      const sender = await this.prisma.user.findUnique({
        where: { id: dto.senderId },
        select: { id: true, name: true, email: true }
      });

      if (!sender) {
        throw new BadRequestException('Sender not found');
      }

      // Validate driver exists and is actually a driver
      const driver = await this.prisma.user.findFirst({
        where: { id: dto.driverId, role: 'DRIVER' },
        select: { id: true, name: true, email: true }
      });

      if (!driver) {
        throw new BadRequestException('Driver not found or user is not a driver');
      }

      // Create the parcel
      const parcel = await this.prisma.parcel.create({ 
        data: { ...dto, trackingNumber },
        include: {
          sender: { select: { id: true, name: true, email: true } }
        }
      });

      // Send email notifications
      try {
        // Send email to sender
        await this.mailerService.sendParcelCreatedEmail({
          toEmail: sender.email,
          toName: sender.name,
          trackingNumber: parcel.trackingNumber,
          recipientName: parcel.recipientName,
          recipientEmail: parcel.recipientEmail,
          pickupAddress: parcel.pickupAddress,
          deliveryAddress: parcel.deliveryAddress,
          weight: parcel.weight || 'Not specified',
          description: parcel.description || 'No description provided',
          createdAt: parcel.createdAt.toLocaleDateString(),
          isSender: true
        });

        // Send email to receiver
        await this.mailerService.sendParcelCreatedEmail({
          toEmail: parcel.recipientEmail,
          toName: parcel.recipientName,
          trackingNumber: parcel.trackingNumber,
          senderName: sender.name,
          senderEmail: sender.email,
          pickupAddress: parcel.pickupAddress,
          deliveryAddress: parcel.deliveryAddress,
          weight: parcel.weight || 'Not specified',
          description: parcel.description || 'No description provided',
          createdAt: parcel.createdAt.toLocaleDateString(),
          isSender: false
        });

        console.log(`Parcel creation emails sent for tracking number: ${parcel.trackingNumber}`);
      } catch (emailError) {
        console.error('Failed to send parcel creation emails:', emailError);
        // Don't fail the parcel creation if emails fail
      }

      return parcel;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  async updateParcel(id: string, update: UpdateParcelDto) {
    try {
      return await this.prisma.parcel.update({ where: { id: Number(id) }, data: update });
    } catch (e) {
      throw new NotFoundException('Parcel not found');
    }
  }
  async deleteParcel(id: string) {
    try {
      return await this.prisma.parcel.delete({ where: { id: Number(id) } });
    } catch (e) {
      throw new NotFoundException('Parcel not found');
    }
  }

  // Drivers
  async getDrivers() {
    return this.prisma.user.findMany({
      where: { role: 'DRIVER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
  }

  // Stats
  async getStats() {
    const [totalParcels, inTransit, delivered, pending, activeDrivers] = await Promise.all([
      this.prisma.parcel.count(),
      this.prisma.parcel.count({ where: { status: 'in_transit' } }),
      this.prisma.parcel.count({ where: { status: 'delivered' } }),
      this.prisma.parcel.count({ where: { status: 'pending' } }),
      this.prisma.user.count({ where: { role: 'DRIVER' } })
    ]);
    return { totalParcels, inTransit, delivered, pending, activeDrivers };
  }
}
