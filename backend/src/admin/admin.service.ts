import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  // Parcels
  async getParcels() {
    return this.prisma.parcel.findMany();
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

      return await this.prisma.parcel.create({ 
        data: { ...dto, trackingNumber }
      });
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
    return this.prisma.driver.findMany();
  }
  async createDriver(dto: CreateDriverDto) {
    try {
      return await this.prisma.driver.create({ data: dto });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  async updateDriver(id: string, update: UpdateDriverDto) {
    try {
      return await this.prisma.driver.update({ where: { id: Number(id) }, data: update });
    } catch (e) {
      throw new NotFoundException('Driver not found');
    }
  }
  async deleteDriver(id: string) {
    try {
      return await this.prisma.driver.delete({ where: { id: Number(id) } });
    } catch (e) {
      throw new NotFoundException('Driver not found');
    }
  }

  // Stats
  async getStats() {
    const [totalParcels, inTransit, delivered, pending, activeDrivers] = await Promise.all([
      this.prisma.parcel.count(),
      this.prisma.parcel.count({ where: { status: 'in_transit' } }),
      this.prisma.parcel.count({ where: { status: 'delivered' } }),
      this.prisma.parcel.count({ where: { status: 'pending' } }),
      this.prisma.driver.count({ where: { status: 'active' } })
    ]);
    return { totalParcels, inTransit, delivered, pending, activeDrivers };
  }
}
