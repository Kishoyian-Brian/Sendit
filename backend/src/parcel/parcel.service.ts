import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateParcelDto, UpdateParcelDto, ParcelResponseDto, ParcelStatus } from '../dtos/parcel.dto';
import { ParcelWithRelations, ParcelStats, ParcelSearchFilters, ParcelTrackingResult } from '../interfaces/parcel.interface';
import { TrackingGateway } from '../tracking/tracking.gateway';

@Injectable()
export class ParcelService {
  private prisma = new PrismaClient();

  constructor(private readonly trackingGateway: TrackingGateway) {}

  async create(dto: CreateParcelDto): Promise<ParcelResponseDto> {
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

    const parcel = await this.prisma.parcel.create({
      data: {
        trackingNumber,
        senderId: dto.senderId,
        recipientName: dto.recipientName,
        recipientEmail: dto.recipientEmail,
        recipientPhone: dto.recipientPhone,
        pickupAddress: dto.pickupAddress,
        pickupLocation: dto.pickupLocation,
        deliveryAddress: dto.deliveryAddress,
        deliveryLocation: dto.deliveryLocation,
        driverId: dto.driverId,
        status: dto.status || ParcelStatus.PENDING,
        currentLat: dto.currentLat,
        currentLng: dto.currentLng,
        currentAddress: dto.currentAddress,
        weight: dto.weight,
        description: dto.description,
      }
    });

    return this.toResponseDto(parcel);
  }

  async findAll(page = 1, pageSize = 10, filters?: ParcelSearchFilters): Promise<{ data: ParcelResponseDto[]; total: number; page: number; pageSize: number }> {
    const skip = (page - 1) * pageSize;
    
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.driverId) where.driverId = filters.driverId;
    if (filters?.senderId) where.senderId = filters.senderId;
    if (filters?.trackingNumber) where.trackingNumber = { contains: filters.trackingNumber, mode: 'insensitive' };
    if (filters?.recipientEmail) where.recipientEmail = { contains: filters.recipientEmail, mode: 'insensitive' };
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const [parcels, total] = await Promise.all([
      this.prisma.parcel.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          driver: { select: { id: true, name: true, email: true, phone: true } },
          route: { orderBy: { timestamp: 'desc' } }
        }
      }),
      this.prisma.parcel.count({ where })
    ]);

    return {
      data: parcels.map(parcel => this.toResponseDto(parcel)),
      total,
      page,
      pageSize
    };
  }

  async findOne(id: number): Promise<ParcelResponseDto> {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, name: true, email: true, phone: true } },
        route: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    return this.toResponseDto(parcel);
  }

  async findByTrackingNumber(trackingNumber: string): Promise<ParcelTrackingResult> {
    const parcel = await this.prisma.parcel.findUnique({
      where: { trackingNumber },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, name: true, email: true, phone: true } },
        route: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!parcel) {
      return { success: false, message: 'Parcel not found' };
    }

    return { success: true, parcel: this.toResponseDto(parcel) as ParcelWithRelations };
  }

  async update(id: number, dto: UpdateParcelDto): Promise<ParcelResponseDto> {
    const parcel = await this.prisma.parcel.findUnique({ 
      where: { id },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, name: true, email: true, phone: true } },
        route: { orderBy: { timestamp: 'desc' } }
      }
    });
    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    // Handle status transitions
    let newStatus = dto.status;
    let deliveredAt = parcel.deliveredAt;

    if (dto.status && dto.status !== parcel.status) {
      // Validate status transition
      const validTransitions = {
        [ParcelStatus.PENDING]: [ParcelStatus.ASSIGNED, ParcelStatus.PENDING_PICKUP],
        [ParcelStatus.ASSIGNED]: [ParcelStatus.IN_TRANSIT, ParcelStatus.PENDING_PICKUP],
        [ParcelStatus.PENDING_PICKUP]: [ParcelStatus.IN_TRANSIT],
        [ParcelStatus.IN_TRANSIT]: [ParcelStatus.DELIVERED],
        [ParcelStatus.DELIVERED]: []
      };

      const allowedTransitions = validTransitions[parcel.status] || [];
      if (!allowedTransitions.includes(dto.status)) {
        throw new BadRequestException(`Invalid status transition from ${parcel.status} to ${dto.status}`);
      }

      // Set deliveredAt when status changes to DELIVERED
      if (dto.status === ParcelStatus.DELIVERED) {
        deliveredAt = new Date();
      }
    }

    // Handle driver assignment
    if (dto.driverId && dto.driverId !== parcel.driverId) {
      // Verify driver exists and is active
      const driver = await this.prisma.driver.findUnique({
        where: { id: dto.driverId }
      });
      if (!driver) {
        throw new BadRequestException('Driver not found');
      }
      if (driver.status !== 'active') {
        throw new BadRequestException('Driver is not active');
      }

      // Auto-assign status to ASSIGNED when driver is assigned
      if (!newStatus && parcel.status === ParcelStatus.PENDING) {
        newStatus = ParcelStatus.ASSIGNED;
      }
    }

    const updateData: any = { ...dto };
    if (newStatus) updateData.status = newStatus;
    if (deliveredAt !== parcel.deliveredAt) updateData.deliveredAt = deliveredAt;

    const updatedParcel = await this.prisma.parcel.update({
      where: { id },
      data: updateData,
      include: {
        sender: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, name: true, email: true, phone: true } },
        route: { orderBy: { timestamp: 'desc' } }
      }
    });

    return this.toResponseDto(updatedParcel);
  }

  async remove(id: number): Promise<void> {
    const parcel = await this.prisma.parcel.findUnique({ where: { id } });
    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    await this.prisma.parcel.delete({ where: { id } });
  }

  async getStats(): Promise<ParcelStats> {
    const [total, pending, inTransit, delivered, assigned, pendingPickup] = await Promise.all([
      this.prisma.parcel.count(),
      this.prisma.parcel.count({ where: { status: ParcelStatus.PENDING } }),
      this.prisma.parcel.count({ where: { status: ParcelStatus.IN_TRANSIT } }),
      this.prisma.parcel.count({ where: { status: ParcelStatus.DELIVERED } }),
      this.prisma.parcel.count({ where: { status: ParcelStatus.ASSIGNED } }),
      this.prisma.parcel.count({ where: { status: ParcelStatus.PENDING_PICKUP } })
    ]);

    return {
      total,
      pending,
      inTransit,
      delivered,
      assigned,
      pendingPickup
    };
  }

  async getParcelsByUser(userId: number): Promise<ParcelResponseDto[]> {
    const parcels = await this.prisma.parcel.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, name: true, email: true, phone: true } },
        route: { orderBy: { timestamp: 'desc' } }
      }
    });

    return parcels.map(parcel => this.toResponseDto(parcel));
  }

  async getParcelsByDriver(driverId: number): Promise<ParcelResponseDto[]> {
    const parcels = await this.prisma.parcel.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, name: true, email: true, phone: true } },
        route: { orderBy: { timestamp: 'desc' } }
      }
    });

    return parcels.map(parcel => this.toResponseDto(parcel));
  }

  async assignDriver(parcelId: number, driverId: number): Promise<ParcelResponseDto> {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, name: true, email: true, phone: true } },
        route: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    // Verify driver exists and is active
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId }
    });
    if (!driver) {
      throw new BadRequestException('Driver not found');
    }
    if (driver.status !== 'active') {
      throw new BadRequestException('Driver is not active');
    }

    // Update parcel with driver assignment and status change
    const updatedParcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: {
        driverId,
        status: ParcelStatus.ASSIGNED, // Auto-assign status when driver is assigned
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, name: true, email: true, phone: true } },
        route: { orderBy: { timestamp: 'desc' } }
      }
    });

    return this.toResponseDto(updatedParcel);
  }

  async updateStatus(id: number, status: string): Promise<ParcelResponseDto> {
    const parcel = await this.prisma.parcel.findUnique({ where: { id } });
    if (!parcel) throw new NotFoundException('Parcel not found');

    // Validate status transition
    const validTransitions = {
      'pending': ['assigned', 'pending_pickup'],
      'assigned': ['pending_pickup', 'in_transit'],
      'pending_pickup': ['in_transit'],
      'in_transit': ['delivered'],
      'delivered': []
    };

    const currentStatus = parcel.status;
    const allowedTransitions = validTransitions[currentStatus] || [];
    
    if (!allowedTransitions.includes(status)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${status}`);
    }

    const updateData: any = { status };
    
    // Set deliveredAt when status changes to delivered
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const updatedParcel = await this.prisma.parcel.update({
      where: { id },
      data: updateData
    });

    // Emit WebSocket status update
    this.trackingGateway.emitStatusUpdate(parcel.trackingNumber, {
      status: updatedParcel.status,
      deliveredAt: updatedParcel.deliveredAt
    });

    return this.toResponseDto(updatedParcel);
  }

  private toResponseDto(parcel: any): ParcelResponseDto {
    return {
      id: parcel.id,
      trackingNumber: parcel.trackingNumber,
      senderId: parcel.senderId,
      recipientName: parcel.recipientName,
      recipientEmail: parcel.recipientEmail,
      recipientPhone: parcel.recipientPhone,
      pickupAddress: parcel.pickupAddress,
      pickupLocation: parcel.pickupLocation,
      deliveryAddress: parcel.deliveryAddress,
      deliveryLocation: parcel.deliveryLocation,
      driverId: parcel.driverId,
      status: parcel.status as ParcelStatus,
      currentLat: parcel.currentLat,
      currentLng: parcel.currentLng,
      currentAddress: parcel.currentAddress,
      weight: parcel.weight,
      description: parcel.description,
      createdAt: parcel.createdAt,
      updatedAt: parcel.updatedAt,
      deliveredAt: parcel.deliveredAt,
      eta: parcel.eta
    };
  }
}
