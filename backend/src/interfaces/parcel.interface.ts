import { ParcelStatus } from '../dtos/parcel.dto';

export interface Parcel {
  id: number;
  trackingNumber: string;
  senderId: number;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  pickupAddress: string;
  pickupLocation?: string;
  deliveryAddress: string;
  deliveryLocation?: string;
  driverId?: number;
  status: ParcelStatus;
  currentLat?: number;
  currentLng?: number;
  currentAddress?: string;
  weight?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
  eta?: string;
}

export interface ParcelWithRelations extends Parcel {
  sender?: {
    id: number;
    name: string;
    email: string;
  };
  driver?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  route?: Array<{
    id: number;
    lat: number;
    lng: number;
    timestamp: string;
  }>;
}

export interface ParcelStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  assigned: number;
  pendingPickup: number;
}

export interface ParcelSearchFilters {
  status?: ParcelStatus;
  driverId?: number;
  senderId?: number;
  trackingNumber?: string;
  recipientEmail?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ParcelTrackingResult {
  success: boolean;
  parcel?: ParcelWithRelations;
  message?: string;
} 