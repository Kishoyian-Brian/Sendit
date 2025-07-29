import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface DriverProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  _count?: {
    parcels: number;
  };
}

export interface DriverStats {
  totalParcels: number;
  activeParcels: number;
  deliveredParcels: number;
  deliveryRate: number;
}

export interface DriverParcel {
  id: number;
  trackingNumber: string;
  sender: any;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  currentLat?: number;
  currentLng?: number;
  weight?: string;
  description?: string;
  createdAt: string;
}

export interface UpdateLocationDto {
  lat: number;
  lng: number;
}

export interface UpdateStatusDto {
  status: string;
  notes?: string;
}

export interface NearbyParcel {
  id: number;
  trackingNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  weight?: string;
  description?: string;
  distance?: number;
}

@Injectable({ providedIn: 'root' })
export class DriverService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Profile Management
  getProfile(): Observable<DriverProfile> {
    return this.http.get<DriverProfile>(`${this.API_URL}/driver/profile`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateProfile(profile: Partial<DriverProfile>): Observable<DriverProfile> {
    return this.http.patch<DriverProfile>(`${this.API_URL}/driver/profile`, profile, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Statistics
  getStats(): Observable<DriverStats> {
    return this.http.get<DriverStats>(`${this.API_URL}/driver/stats`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Parcel Management
  getParcels(): Observable<DriverParcel[]> {
    return this.http.get<DriverParcel[]>(`${this.API_URL}/driver/parcels`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateParcelLocation(parcelId: number, location: UpdateLocationDto): Observable<DriverParcel> {
    return this.http.patch<DriverParcel>(`${this.API_URL}/driver/parcels/${parcelId}/location`, location, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateParcelStatus(parcelId: number, status: UpdateStatusDto): Observable<DriverParcel> {
    return this.http.patch<DriverParcel>(`${this.API_URL}/driver/parcels/${parcelId}/status`, status, {
      headers: this.authService.getAuthHeaders()
    });
  }

  acceptParcel(parcelId: number): Observable<DriverParcel> {
    return this.http.post<DriverParcel>(`${this.API_URL}/driver/parcels/${parcelId}/accept`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Nearby Parcels
  getNearbyParcels(lat: number, lng: number, radius: number = 10): Observable<NearbyParcel[]> {
    return this.http.get<NearbyParcel[]>(`${this.API_URL}/driver/nearby-parcels?lat=${lat}&lng=${lng}&radius=${radius}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Update driver's own location
  updateDriverLocation(location: UpdateLocationDto): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/driver/location`, location, {
      headers: this.authService.getAuthHeaders()
    });
  }
} 