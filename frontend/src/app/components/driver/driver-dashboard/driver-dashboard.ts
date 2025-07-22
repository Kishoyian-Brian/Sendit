import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { Toast } from '../../toast/toast/toast';
import { Driver } from '../../../models/driver.model';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer, Toast],
  templateUrl: './driver-dashboard.html',
  styles: ``
})
export class DriverDashboard implements OnInit {
  private readonly DEFAULT_DRIVER = {
    id: 'DRV001',
    email: 'driver@sendit.com',
    password: 'Driver@123',
    firstName: 'John',
    lastName: 'Driver',
    phone: '+254712345678',
    status: 'active' as const,
    currentLocation: {
      lat: -1.2921,
      lng: 36.8219,
      address: 'Nairobi, Kenya'
    },
    rating: 4.8,
    deliveriesCompleted: 150,
    vehicleInfo: {
      type: 'Van',
      plateNumber: 'KBC 123X',
      model: 'Toyota HiAce 2022'
    }
  };

  currentDriver: Driver | null = null;
  activeDeliveries: any[] = [];
  deliveryHistory: any[] = [];

  // Statistics (can be updated to use real data)
  stats = {
    todayDeliveries: 0,
    weeklyDeliveries: 0,
    monthlyRating: 0,
    totalEarnings: 0
  };

  constructor() {}

  ngOnInit() {
    this.initDriver();
    this.loadDriverParcels();
    this.loadStats();
  }

  initDriver() {
    const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    if (drivers.length === 0) {
      localStorage.setItem('drivers', JSON.stringify([this.DEFAULT_DRIVER]));
    }
    const driverData = localStorage.getItem('driver_data');
    if (driverData) {
      this.currentDriver = JSON.parse(driverData);
    } else {
      this.currentDriver = this.DEFAULT_DRIVER;
    }
  }

  loadDriverParcels() {
    if (!this.currentDriver) return;
    const allParcels = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    const driverParcels = allParcels.filter((p: any) => p.driverId === this.currentDriver!.id);
    this.activeDeliveries = driverParcels.filter((p: any) => p.status !== 'delivered').map((p: any) => ({
      id: p.id,
      trackingNumber: p.trackingNumber,
      pickup: p.pickupAddress,
      destination: p.deliveryAddress,
      status: p.status === 'pending' ? 'pending_pickup' : p.status,
      customer: p.recipient,
      customerPhone: p.recipientPhone,
      estimatedDeliveryTime: p.eta || ''
    }));
    this.deliveryHistory = driverParcels.filter((p: any) => p.status === 'delivered').map((p: any) => ({
      id: p.id,
      trackingNumber: p.trackingNumber,
      pickup: p.pickupAddress,
      destination: p.deliveryAddress,
      status: p.status,
      customer: p.recipient,
      customerPhone: p.recipientPhone,
      deliveryTime: p.deliveredAt || ''
    }));
  }

  loadStats() {
    // Example: update stats based on deliveries
    this.stats.todayDeliveries = this.activeDeliveries.length;
    this.stats.weeklyDeliveries = this.activeDeliveries.length + this.deliveryHistory.length;
    this.stats.monthlyRating = this.currentDriver?.rating || 0;
    this.stats.totalEarnings = (this.activeDeliveries.length + this.deliveryHistory.length) * 500; // Example
  }

  updateDeliveryStatus(delivery: any, newStatus: string) {
    // Update in localStorage (or backend in future)
    const allParcels = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    const idx = allParcels.findIndex((p: any) => p.id === delivery.id);
    if (idx !== -1) {
      allParcels[idx].status = newStatus;
      if (newStatus === 'delivered') {
        allParcels[idx].deliveredAt = new Date().toISOString();
      }
      localStorage.setItem('admin_parcels', JSON.stringify(allParcels));
      this.loadDriverParcels();
      this.loadStats();
    }
  }

  updateLocation(address: string) {
    if (this.currentDriver && this.currentDriver.currentLocation) {
      this.currentDriver.currentLocation.address = address;
      // In a real app, update backend here
      console.log('Updated location:', address);
    }
  }

  toggleAvailability() {
    if (this.currentDriver) {
      this.currentDriver.status = this.currentDriver.status === 'active' ? 'inactive' : 'active';
      // In a real app, update backend here
      console.log('Toggled availability:', this.currentDriver.status);
    }
  }

  startDelivery(delivery: any) {
    this.updateDeliveryStatus(delivery, 'in_transit');
    if (this.currentDriver) {
      this.currentDriver.status = 'on_delivery';
    }
    // In a real app, update backend here
    console.log('Started delivery:', delivery);
  }

  completeDelivery(delivery: any) {
    this.updateDeliveryStatus(delivery, 'delivered');
    if (this.currentDriver) {
      this.currentDriver.status = 'active';
      this.currentDriver.deliveriesCompleted++;
    }
    // In a real app, update backend here
    console.log('Completed delivery:', delivery);
  }
}
