import { Injectable } from '@angular/core';
import { Driver } from '../models/driver.model';
import { Parcel } from '../models/parcel.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private readonly DEFAULT_DRIVER = {
    id: 'DRV001',
    email: 'driver@sendit.com',
    password: 'Driver@123',
    firstName: 'John',
    lastName: 'Driver',
    phone: '+254712345678',
    status: 'active' as const,
    currentLocation: { lat: -1.2921, lng: 36.8219, address: 'Nairobi, Kenya' },
    rating: 4.8,
    deliveriesCompleted: 150,
    vehicleInfo: { type: 'Van', plateNumber: 'KBC 123X', model: 'Toyota HiAce 2022' }
  };

  getCurrentDriver(): Driver | null {
    const driverData = localStorage.getItem('driver_data');
    if (driverData) {
      return JSON.parse(driverData);
    }
    // For development, you can fall back to the default driver
    if (localStorage.getItem('drivers')) {
      return this.DEFAULT_DRIVER;
    }
    return null;
  }

  getDriverParcels(driverId: string): { active: Parcel[], history: Parcel[] } {
    const allParcels: Parcel[] = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    const driverParcels = allParcels.filter(p => p.driverId === driverId);

    const active = driverParcels.filter(p => p.status !== 'delivered');
    const history = driverParcels.filter(p => p.status === 'delivered');

    return { active, history };
  }

  getDriverStats(activeCount: number, historyCount: number, rating: number): any {
    return {
      todayDeliveries: activeCount,
      weeklyDeliveries: activeCount + historyCount,
      monthlyRating: rating,
      totalEarnings: (activeCount + historyCount) * 500
    };
  }

  updateDeliveryStatus(parcelId: string, newStatus: 'in_transit' | 'delivered'): void {
    const allParcels: Parcel[] = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    const parcelIndex = allParcels.findIndex(p => p.id === parcelId);

    if (parcelIndex !== -1) {
      allParcels[parcelIndex].status = newStatus;
      if (newStatus === 'delivered') {
        allParcels[parcelIndex].deliveredAt = new Date().toISOString();
      }
      localStorage.setItem('admin_parcels', JSON.stringify(allParcels));
    }
  }

  updateDriverStatus(driver: Driver, status: 'active' | 'inactive' | 'on_delivery'): Driver {
    driver.status = status;
    // In a real app, update this on the backend
    return driver;
  }

  updateParcelLocation(parcelId: string, newLocation: { lat: number, lng: number }) {
    const parcels: Parcel[] = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    const parcel = parcels.find(p => p.id === parcelId);
    if (parcel) {
      parcel.currentLocation = newLocation;
      if (!parcel.route) parcel.route = [];
      parcel.route.push({ ...newLocation, timestamp: new Date().toISOString() });
      localStorage.setItem('admin_parcels', JSON.stringify(parcels));
    }
  }
} 