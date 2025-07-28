import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateLocationDto } from './dto/update-location.dto';
import { TrackingGateway } from '../tracking/tracking.gateway';
import fetch from 'node-fetch';

interface NominatimResponse {
  display_name?: string;
}

@Injectable()
export class DriverService {
  private prisma = new PrismaClient();

  constructor(private readonly trackingGateway: TrackingGateway) {}

  async updateParcelLocation(parcelId: number, dto: UpdateLocationDto) {
    const parcel = await this.prisma.parcel.findUnique({ 
      where: { id: parcelId },
      include: { route: { orderBy: { timestamp: 'desc' } } }
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
        route: { orderBy: { timestamp: 'desc' }, take: 10 }
      }
    });

    // Emit WebSocket event for real-time updates
    this.trackingGateway.emitLocationUpdate(parcel.trackingNumber, {
      currentLat: dto.lat,
      currentLng: dto.lng,
      currentAddress: address,
      status: updatedParcel.status,
      route: updatedParcel.route
    });

    return { 
      success: true, 
      address,
      trackingNumber: parcel.trackingNumber
    };
  }
}
