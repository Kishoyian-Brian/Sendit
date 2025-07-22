import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  // --- PARCELS ---
  async getSentParcels(): Promise<any[]> {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const allParcels = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    return allParcels.filter((p: any) => p.senderId === userData.id);
  }

  async getReceivedParcels(): Promise<any[]> {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const allParcels = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    return allParcels.filter((p: any) => p.recipientId === userData.id);
  }

  async trackParcel(trackingNumber: string): Promise<any> {
    const allParcels = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    const parcel = allParcels.find((p: any) => p.trackingNumber === trackingNumber);
    if (!parcel) {
      return { success: false, message: 'Parcel not found' };
    }
    return { success: true, parcel };
  }

  // --- USER PROFILE ---
  async getCurrentUser(): Promise<any> {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      return null;
    }
    return JSON.parse(userData);
  }

  async updateProfile(update: Partial<any>): Promise<{ success: boolean; message: string }> {
    const userData = await this.getCurrentUser();
    if (!userData) {
      return { success: false, message: 'User not found' };
    }
    
    const updatedUser = { ...userData, ...update };
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    return { success: true, message: 'Profile updated successfully' };
  }

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<any[]> {
    const userData = await this.getCurrentUser();
    if (!userData) {
      return [];
    }
    
    // For now, generate some mock notifications based on parcels
    const [sent, received] = await Promise.all([
      this.getSentParcels(),
      this.getReceivedParcels()
    ]);

    const notifications = [];
    
    // Add notifications for recent status changes
    for (const parcel of [...sent, ...received]) {
      notifications.push({
        id: `notif_${Date.now()}_${Math.random()}`,
        type: 'status_update',
        message: `Parcel ${parcel.trackingNumber} is ${parcel.status}`,
        timestamp: new Date(),
        read: false
      });
    }

    return notifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    // In a real app, this would update the notification in the backend
    console.log('Marking notification as read:', notificationId);
  }

  // --- DASHBOARD STATS ---
  async getDashboardStats(): Promise<any> {
    const [sent, received] = await Promise.all([
      this.getSentParcels(),
      this.getReceivedParcels()
    ]);

    return {
      totalParcels: sent.length + received.length,
      sentParcels: sent.length,
      receivedParcels: received.length,
      inTransit: [...sent, ...received].filter(p => p.status === 'in_transit').length,
      delivered: [...sent, ...received].filter(p => p.status === 'delivered').length
    };
  }
} 