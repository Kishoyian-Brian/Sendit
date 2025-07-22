import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { Toast } from '../../toast/toast/toast';
import { Driver } from '../../../models/driver.model';
import { DriverService } from '../../../services/driver.service';
import { MapView } from '../../map/map-view/map-view';
import { Parcel } from '../../../models/parcel.model';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer, Toast, MapView],
  templateUrl: './driver-dashboard.html',
  styles: ``
})
export class DriverDashboard implements OnInit {
  @ViewChild('toast') toast!: Toast;
  currentDriver: Driver | null = null;
  activeDeliveries: Parcel[] = [];
  deliveryHistory: Parcel[] = [];
  stats: any = {};
  selectedParcelForUpdate: Parcel | null = null;

  constructor(private driverService: DriverService) {}

  ngOnInit() {
    this.currentDriver = this.driverService.getCurrentDriver();
    if (this.currentDriver) {
      this.loadParcels();
      this.stats = this.driverService.getDriverStats(
        this.activeDeliveries.length,
        this.deliveryHistory.length,
        this.currentDriver.rating || 0
      );
    }
  }

  loadParcels() {
    if (!this.currentDriver) return;
    const { active, history } = this.driverService.getDriverParcels(this.currentDriver.id);
    this.activeDeliveries = active;
    this.deliveryHistory = history;
  }

  toggleAvailability() {
    if (this.currentDriver) {
      const newStatus = this.currentDriver.status === 'active' ? 'inactive' : 'active';
      this.currentDriver = this.driverService.updateDriverStatus(this.currentDriver, newStatus);
    }
  }

  startDelivery(delivery: Parcel) {
    this.driverService.updateDeliveryStatus(delivery.id, 'in_transit');
    if (this.currentDriver) {
      this.currentDriver = this.driverService.updateDriverStatus(this.currentDriver, 'on_delivery');
    }
    this.loadParcels();
    this.toast.show('Delivery started!', 'success');
  }

  completeDelivery(delivery: Parcel) {
    this.driverService.updateDeliveryStatus(delivery.id, 'delivered');
    if (this.currentDriver) {
      this.currentDriver = this.driverService.updateDriverStatus(this.currentDriver, 'active');
    }
    this.loadParcels();
    this.toast.show('Delivery completed!', 'success');
  }

  showUpdateLocation(parcel: Parcel) {
    this.selectedParcelForUpdate = parcel;
  }

  onLocationUpdated(newLocation: { lat: number, lng: number }) {
    if (this.selectedParcelForUpdate) {
      this.driverService.updateParcelLocation(this.selectedParcelForUpdate.id, newLocation);
      this.toast.show('Location updated!', 'success');
      this.selectedParcelForUpdate = null;
      this.loadParcels();
    }
  }
}
