import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { TrackingGateway } from '../tracking/tracking.gateway';
import fetch from 'node-fetch';

interface NominatimResponse {
  display_name?: string;
}

@Injectable()
export class DriverService {
  private prisma = new PrismaClient();

  constructor(private readonly trackingGateway: TrackingGateway) {}

  // Get driver's assigned parcels
  async getDriverParcels(driverId: number) {
    const parcels = await this.prisma.parcel.findMany({
      where: { driverId },
      include: {
        sender: { select: { id: true, name: true, email: true, phone: true } },
        route: { orderBy: { timestamp: 'desc' }, take: 5 }
      },
      orderBy: { createdAt: 'desc' }
    });

    return parcels;
  }

  // Get driver profile
  async getDriverProfile(driverId: number) {
    const driver = await this.prisma.user.findFirst({
      where: { id: driverId, role: 'DRIVER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  // Update driver profile
  async updateDriverProfile(driverId: number, updateData: any) {
    const driver = await this.prisma.user.update({
      where: { id: driverId, role: 'DRIVER' },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    return driver;
  }

  // Update parcel status (pickup, in-transit, delivered)
  async updateParcelStatus(parcelId: number, dto: UpdateParcelStatusDto) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: { sender: true, driver: true }
    });

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['in_transit', 'picked_up'],
      'picked_up': ['in_transit'],
      'in_transit': ['delivered', 'out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'delivered': []
    };

    const currentStatus = parcel.status;
    const newStatus = dto.status;

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    // Update parcel status
    const updatedParcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: {
        status: newStatus,
        deliveredAt: newStatus === 'delivered' ? new Date() : null,
        ...(dto.notes && { description: `${parcel.description || ''}\n\nStatus Update: ${dto.notes}` })
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, name: true } }
      }
    });

    // Emit WebSocket event for real-time status updates
    this.trackingGateway.emitStatusUpdate(parcel.trackingNumber, {
      status: newStatus,
      updatedAt: new Date(),
      notes: dto.notes
    });

    return {
      success: true,
      parcel: updatedParcel,
      message: `Parcel status updated to ${newStatus}`
    };
  }

  // Get driver statistics
  async getDriverStats(driverId: number) {
    const [
      totalParcels,
      activeParcels,
      deliveredParcels,
      todayDeliveries
    ] = await Promise.all([
      this.prisma.parcel.count({ where: { driverId } }),
      this.prisma.parcel.count({ 
        where: { 
          driverId, 
          status: { in: ['in_transit', 'out_for_delivery', 'picked_up'] } 
        } 
      }),
      this.prisma.parcel.count({ 
        where: { 
          driverId, 
          status: 'delivered' 
        } 
      }),
      this.prisma.parcel.count({
        where: {
          driverId,
          status: 'delivered',
          deliveredAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    return {
      totalParcels,
      activeParcels,
      deliveredParcels,
      todayDeliveries,
      deliveryRate: totalParcels > 0 ? Math.round((deliveredParcels / totalParcels) * 100) : 0
    };
  }

  // Update parcel location (enhanced version)
  async updateParcelLocation(parcelId: number, dto: UpdateLocationDto) {
    const parcel = await this.prisma.parcel.findUnique({ 
      where: { id: parcelId },
      include: { 
        route: { orderBy: { timestamp: 'desc' } },
        driver: true
      }
    });
    
    if (!parcel) throw new NotFoundException('Parcel not found');

    // Reverse geocode using OpenStreetMap Nominatim
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${dto.lat}&lon=${dto.lng}`;
    let address = '';
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'SendItApp/1.0' } });
      const data = await response.json() as NominatimResponse;
      address = data.display_name || '';
    } catch (e) {
      address = '';
    }

    // Update current location and address
    const updatedParcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: {
        currentLat: dto.lat,
        currentLng: dto.lng,
        currentAddress: address,
        route: {
          create: {
            lat: dto.lat,
            lng: dto.lng,
            timestamp: new Date().toISOString(),
          },
        },
      },
      include: {
        route: { orderBy: { timestamp: 'desc' }, take: 10 },
        sender: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, name: true } }
      }
    });

    // Emit WebSocket event for real-time updates
    this.trackingGateway.emitLocationUpdate(parcel.trackingNumber, {
      currentLat: dto.lat,
      currentLng: dto.lng,
      currentAddress: address,
      status: updatedParcel.status,
      route: updatedParcel.route,
      driver: updatedParcel.driver
    });

    return { 
      success: true, 
      address,
      trackingNumber: parcel.trackingNumber,
      location: {
        lat: dto.lat,
        lng: dto.lng,
        address
      }
    };
  }

  // Get nearby parcels for driver
  async getNearbyParcels(driverId: number, lat: number, lng: number, radius: number = 10) {
    // Simple distance calculation (in production, use proper geospatial queries)
    const parcels = await this.prisma.parcel.findMany({
      where: {
        driverId: null, // Unassigned parcels
        status: 'pending'
      },
      include: {
        sender: { select: { id: true, name: true, email: true } }
      }
    });

    // Filter by approximate distance (simplified)
    const nearbyParcels = parcels.filter(parcel => {
      // This is a simplified distance calculation
      // In production, use proper geospatial indexing
      return true; // For now, return all pending parcels
    });

    return nearbyParcels.slice(0, 10); // Limit to 10 nearby parcels
  }

  // Accept parcel assignment
  async acceptParcel(driverId: number, parcelId: number) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId }
    });

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    if (parcel.driverId) {
      throw new BadRequestException('Parcel is already assigned to a driver');
    }

    const updatedParcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: {
        driverId,
        status: 'assigned'
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, name: true } }
      }
    });

    return {
      success: true,
      parcel: updatedParcel,
      message: 'Parcel assigned successfully'
    };
  }
}
