import { Injectable } from '@angular/core';
import { Driver } from '../models/driver.model';
import { User } from '../models/user.model';
import { Parcel } from '../models/parcel.model';
import { Admin } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  // --- PARCELS ---
  async getParcels(): Promise<Parcel[]> {
    return JSON.parse(localStorage.getItem('admin_parcels') || '[]') as Parcel[];
  }

  async saveParcels(parcels: Parcel[]): Promise<void> {
    localStorage.setItem('admin_parcels', JSON.stringify(parcels));
  }

  async updateParcel(id: string, update: Partial<Parcel>): Promise<void> {
    const parcels = await this.getParcels();
    const idx = parcels.findIndex((p: Parcel) => p.id === id);
    if (idx !== -1) {
      parcels[idx] = { ...parcels[idx], ...update };
      await this.saveParcels(parcels);
    }
  }

  async assignDriver(parcelId: string, driverName: string): Promise<void> {
    await this.updateParcel(parcelId, { driver: driverName, status: 'assigned' });
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    return JSON.parse(localStorage.getItem('users') || '[]') as User[];
  }

  // --- DRIVERS ---
  async getDrivers(): Promise<Driver[]> {
    return JSON.parse(localStorage.getItem('admin_drivers') || '[]') as Driver[];
  }

  async saveDrivers(drivers: Driver[]): Promise<void> {
    localStorage.setItem('admin_drivers', JSON.stringify(drivers));
  }

  async addDriverFromUser(user: User, password: string): Promise<{ success: boolean; message: string }> {
    const drivers = await this.getDrivers();
    if (drivers.some((d: Driver) => d.email.toLowerCase() === user.email.toLowerCase())) {
      return { success: false, message: 'User is already a driver.' };
    }
    const newDriver: Driver = {
      id: 'DRV' + Date.now(),
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ')[1] || '',
      email: user.email,
      phone: user.phone || '',
      password,
      status: 'active',
      rating: 0,
      deliveriesCompleted: 0,
      currentLocation: undefined,
      vehicleInfo: { type: '', plateNumber: '', model: '' }
    };
    drivers.push(newDriver);
    await this.saveDrivers(drivers);
    return { success: true, message: 'Driver added successfully.' };
  }

  async toggleDriverStatus(driverId: string): Promise<void> {
    const drivers = await this.getDrivers();
    const idx = drivers.findIndex((d: Driver) => d.id === driverId);
    if (idx !== -1) {
      drivers[idx].status = drivers[idx].status === 'active' ? 'inactive' : 'active';
      await this.saveDrivers(drivers);
    }
  }

  // --- STATS ---
  async getStats(): Promise<any> {
    // For now, just count from parcels/drivers
    const parcels = await this.getParcels();
    const drivers = await this.getDrivers();
    return {
      totalParcels: parcels.length,
      inTransit: parcels.filter((p: Parcel) => p.status === 'in_transit').length,
      delivered: parcels.filter((p: Parcel) => p.status === 'delivered').length,
      pending: parcels.filter((p: Parcel) => p.status === 'pending').length,
      activeDrivers: drivers.filter((d: Driver) => d.status === 'active').length
    };
  }

  // --- EXPORT ---
  async exportData(): Promise<void> {
    // For now, just log to console
    const parcels = await this.getParcels();
    const drivers = await this.getDrivers();
    console.log('Exporting data:', { parcels, drivers });
  }
} 