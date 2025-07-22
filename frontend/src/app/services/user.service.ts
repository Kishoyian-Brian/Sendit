import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Parcel } from '../models/parcel.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  async getSentParcels(): Promise<Parcel[]> {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}') as User;
    if (!userData || !userData.id) return [];
    const allParcels: Parcel[] = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    return allParcels.filter(p => p.senderId === userData.id);
  }

  async getReceivedParcels(): Promise<Parcel[]> {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}') as User;
    if (!userData || !userData.id) return [];
    const allParcels: Parcel[] = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    return allParcels.filter(p => p.recipientId === userData.id);
  }

  async trackParcel(trackingNumber: string): Promise<{ success: boolean; parcel?: Parcel; message: string }> {
    const allParcels: Parcel[] = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    const parcel = allParcels.find(p => p.trackingNumber === trackingNumber);
    if (!parcel) {
      return { success: false, message: 'Parcel not found' };
    }
    return { success: true, parcel, message: 'Parcel found' };
  }

  async getCurrentUser(): Promise<User | null> {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      return null;
    }
    return JSON.parse(userData) as User;
  }

  async updateProfile(update: Partial<User>): Promise<{ success: boolean; message: string }> {
    const userData = await this.getCurrentUser();
    if (!userData) {
      return { success: false, message: 'User not found' };
    }
    const updatedUser: User = { ...userData, ...update };
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    return { success: true, message: 'Profile updated successfully' };
  }
} 