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
  imports: [CommonModule, FormsModule, Navbar, Toast, MapView],
  templateUrl: './driver-dashboard.html',
  styles: ``
})
export class DriverDashboard implements OnInit {
  @ViewChild('toast') toast!: Toast;
  currentDriver: any = null;
  activeDeliveries: any[] = [];
  deliveryHistory: any[] = [];
  stats: any = {};
  selectedParcelForUpdate: any = null;
  selectedSection: 'location' | 'active' | 'history' = 'location';

  setSection(section: 'location' | 'active' | 'history') {
    this.selectedSection = section;
  }

  constructor(private driverService: DriverService) {}

  ngOnInit() {
    this.loadDriverData();
  }

  loadDriverData() {
    // Load driver profile
    this.driverService.getProfile().subscribe(profile => {
      this.currentDriver = profile;
    });

    // Load driver stats
    this.driverService.getStats().subscribe(stats => {
      this.stats = stats;
    });

    // Load parcels
    this.loadParcels();
  }

  loadParcels() {
    this.driverService.getParcels().subscribe(parcels => {
      this.activeDeliveries = parcels.filter(p =>
        p.status === 'in_transit' || p.status === 'picked' || p.status === 'pending'
      );
      this.deliveryHistory = parcels.filter(p => p.status === 'delivered');
    });
  }

  toggleAvailability() {
    if (this.currentDriver) {
      const newStatus = this.currentDriver.status === 'active' ? 'inactive' : 'active';
      // Note: status field might not be available in DriverProfile interface
      // This would need to be handled by the backend API
      this.toast.show('Availability toggle not implemented in current API', 'info');
    }
  }

  startDelivery(delivery: any) {
    this.driverService.updateParcelStatus(delivery.id, { status: 'in_transit' }).subscribe(() => {
      this.loadParcels();
      this.toast.show('Delivery started!', 'success');
    });
  }

  completeDelivery(delivery: any) {
    this.driverService.updateParcelStatus(delivery.id, { status: 'delivered' }).subscribe(() => {
      this.loadParcels();
      this.toast.show('Delivery completed!', 'success');
    });
  }

  showUpdateLocation(parcel: any) {
    this.selectedParcelForUpdate = parcel;
  }

  onLocationUpdated(newLocation: { lat: number, lng: number }) {
    if (this.selectedParcelForUpdate) {
      this.driverService.updateParcelLocation(this.selectedParcelForUpdate.id, newLocation).subscribe(() => {
        this.toast.show('Location updated!', 'success');
        this.selectedParcelForUpdate = null;
        this.loadParcels();
      });
    }
  }

  // Update driver's own location
  updateDriverLocation(newLocation: { lat: number, lng: number }) {
    this.driverService.updateDriverLocation(newLocation).subscribe({
      next: (response) => {
        this.toast.show('Driver location updated successfully!', 'success');
        // Reload driver data to get updated location
        this.loadDriverData();
      },
      error: (error) => {
        console.error('Error updating driver location:', error);
        this.toast.show('Failed to update location', 'error');
      }
    });
  }

  // Show map for driver location update
  showDriverLocationMap() {
    this.selectedParcelForUpdate = { trackingNumber: 'DRIVER_LOCATION' }; // Use a special marker
  }
}
