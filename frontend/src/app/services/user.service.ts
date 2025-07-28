import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserParcel {
  id: number;
  trackingNumber: string;
  sender: any;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  driver?: any;
  weight?: string;
  description?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface ParcelStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Profile Management
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/me`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateProfile(profile: Partial<User>): Observable<User> {
    const userId = this.authService.getCurrentUser()?.id;
    return this.http.patch<User>(`${this.API_URL}/users/${userId}`, profile, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Parcel Management
  getMyParcels(): Observable<UserParcel[]> {
    return this.http.get<UserParcel[]>(`${this.API_URL}/parcel/my-parcels`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getParcelStats(): Observable<ParcelStats> {
    return this.http.get<ParcelStats>(`${this.API_URL}/parcel/stats`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Tracking
  trackParcel(trackingNumber: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/parcel/track/${trackingNumber}`);
  }
} 