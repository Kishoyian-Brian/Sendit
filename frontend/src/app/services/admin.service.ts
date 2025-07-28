import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

export interface Parcel {
  id?: number;
  trackingNumber: string;
  senderId: number;
  sender?: any;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  pickupAddress: string;
  pickupLocation?: string;
  deliveryAddress: string;
  deliveryLocation?: string;
  driverId?: number;
  driver?: any;
  status: string;
  currentLat?: number;
  currentLng?: number;
  currentAddress?: string;
  weight?: string;
  description?: string;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export interface CreateParcelDto {
  trackingNumber?: string;
  senderId: number;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  pickupAddress: string;
  pickupLocation?: string;
  deliveryAddress: string;
  deliveryLocation?: string;
  driverId: number;
  status?: string;
  currentLat?: number;
  currentLng?: number;
  weight?: string;
  description?: string;
}

export interface UpdateParcelDto {
  trackingNumber?: string;
  senderId?: number;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  pickupAddress?: string;
  pickupLocation?: string;
  deliveryAddress?: string;
  deliveryLocation?: string;
  driverId?: number;
  status?: string;
  currentLat?: number;
  currentLng?: number;
  weight?: string;
  description?: string;
}

export interface AdminStats {
  totalParcels: number;
  inTransit: number;
  delivered: number;
  pending: number;
  activeDrivers: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Parcel Management
  getParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.API_URL}/admin/parcels`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createParcel(parcel: CreateParcelDto): Observable<Parcel> {
    return this.http.post<Parcel>(`${this.API_URL}/admin/parcels`, parcel, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateParcel(id: string, parcel: UpdateParcelDto): Observable<Parcel> {
    return this.http.patch<Parcel>(`${this.API_URL}/admin/parcels/${id}`, parcel, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteParcel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/admin/parcels/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Driver Management
  getDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.API_URL}/admin/drivers`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Statistics
  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.API_URL}/admin/stats`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // User Management
  getUsers(): Observable<any[]> {
    return this.http.get<any>(`${this.API_URL}/users`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(response => response.data?.data || [])
    );
  }

  promoteToDriver(userId: string): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/users/${userId}/promote-to-driver`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  demoteFromDriver(userId: string): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/users/${userId}/demote-from-driver`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }
} 