import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { Toast } from '../../toast/toast/toast';
import { ParcelStatusPipe } from '../../../pipes/parcel-status-pipe';
import { AdminService } from '../../../services/admin.service';
import { Parcel } from '../../../models/parcel.model';
import { MapView } from '../../map/map-view/map-view';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    Navbar,
    Footer,
    Toast,
    ParcelStatusPipe,
    MapView
  ],
  templateUrl: './admin-dashboard.html',
  styles: ``
})
export class AdminDashboard implements OnInit {
  @ViewChild('toast') toast!: Toast;

  stats: any = {};
  currentSection: 'overview' | 'parcels' | 'drivers' | 'reports' | 'map' = 'overview';
  searchTerm = '';
  statusFilter: string = 'all';
  dateFilter: string = 'all';
  parcels: any[] = [];
  drivers: any[] = [];
  showCreateParcelModal = false;
  showAddDriverModal = false;
  eligibleUsers: any[] = [];
  selectedUserEmail = '';
  trackedParcel: Parcel | null = null;
  editingParcel: any = null;
  showDeleteConfirmModal = false;
  parcelToDelete: any = null;

  // Create Parcel form fields
  senderName = '';
  senderEmail = '';
  senderPhone = '';
  pickupAddress = '';
  receiverName = '';
  receiverEmail = '';
  receiverPhone = '';
  deliveryAddress = '';
  packageWeight = '';
  packageDescription = '';
  driverId = '';
  pickupLocation: { lat: number; lng: number } | null = null;
  deliveryLocation: { lat: number; lng: number } | null = null;
  showLocationMapModal: boolean = false;
  locationTypeBeingSet: 'pickup' | 'delivery' | null = null;

  openLocationMap(type: 'pickup' | 'delivery') {
    this.locationTypeBeingSet = type;
    this.showLocationMapModal = true;
  }

  closeLocationMap() {
    this.showLocationMapModal = false;
    this.locationTypeBeingSet = null;
  }

  onMapLocationSelected(location: { lat: number; lng: number }) {
    if (this.locationTypeBeingSet === 'pickup') {
      this.pickupLocation = location;
    } else if (this.locationTypeBeingSet === 'delivery') {
      this.deliveryLocation = location;
    }
    this.closeLocationMap();
  }

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.adminService.getParcels().subscribe(parcels => this.parcels = parcels);
    this.adminService.getDrivers().subscribe(drivers => this.drivers = drivers);
    this.adminService.getStats().subscribe(stats => this.stats = stats);
  }

  showSection(section: 'overview' | 'parcels' | 'drivers' | 'reports' | 'map') {
    this.currentSection = section;
  }

  assignDriver(parcel: any, driver: any) {
    this.adminService.updateParcel(parcel.id, { driverId: driver.id }).subscribe(() => {
      this.loadAll();
      this.toast.show('Driver assigned!', 'success');
    });
  }

  updateParcelStatus(parcel: Parcel, newStatus: Parcel['status']) {
    this.adminService.updateParcel(parcel.id?.toString() || '', { status: newStatus }).subscribe({
      next: () => {
        this.loadAll();
        this.toast.show('Parcel status updated!', 'success');
      },
      error: (error) => {
        console.error('Error updating parcel status:', error);
        this.toast.show('Failed to update parcel status', 'error');
      }
    });
  }

  toggleDriverStatus(driver: any) {
    // Use demoteFromDriver to toggle driver status
    this.adminService.demoteFromDriver(driver.id).subscribe(() => {
      this.loadAll();
      this.toast.show('Driver status updated!', 'success');
    });
  }

  filterParcels() {
    let filtered = [...this.parcels];
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.trackingNumber.toLowerCase().includes(search) ||
        p.recipientName.toLowerCase().includes(search) ||
        p.recipientEmail.toLowerCase().includes(search)
      );
    }
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.statusFilter);
    }
    // dateFilter logic can be added here
    return filtered;
  }

  exportData() {
    // Export functionality not available in current service
    this.toast.show('Export functionality not implemented', 'info');
  }

  openCreateParcelModal() {
    this.editingParcel = null;
    this.resetForm();
    this.showCreateParcelModal = true;
  }

  closeCreateParcelModal() {
    this.showCreateParcelModal = false;
    this.pickupLocation = null;
    this.deliveryLocation = null;
    this.editingParcel = null;
  }

  closeTrackParcelModal() {
    this.trackedParcel = null;
  }

  // Edit Parcel functionality
  openEditParcelModal(parcel: any) {
    // Populate form with parcel data
    this.senderName = parcel.senderName || '';
    this.senderEmail = parcel.senderEmail || '';
    this.senderPhone = parcel.senderPhone || '';
    this.pickupAddress = parcel.pickupAddress || '';
    this.receiverName = parcel.recipientName || '';
    this.receiverEmail = parcel.recipientEmail || '';
    this.receiverPhone = parcel.recipientPhone || '';
    this.deliveryAddress = parcel.deliveryAddress || '';
    this.packageWeight = parcel.weight || '';
    this.packageDescription = parcel.description || '';
    this.driverId = parcel.driverId?.toString() || '';
    
    // Set locations if available
    if (parcel.pickupLocation) {
      const [lat, lng] = parcel.pickupLocation.split(',').map(Number);
      this.pickupLocation = { lat, lng };
    }
    if (parcel.deliveryLocation) {
      const [lat, lng] = parcel.deliveryLocation.split(',').map(Number);
      this.deliveryLocation = { lat, lng };
    }
    
    this.editingParcel = parcel;
    this.showCreateParcelModal = true;
  }

  // Delete Parcel functionality
  deleteParcel(parcel: any) {
    this.parcelToDelete = parcel;
    this.showDeleteConfirmModal = true;
  }

  confirmDelete() {
    if (this.parcelToDelete) {
      this.adminService.deleteParcel(this.parcelToDelete.id?.toString() || '').subscribe({
        next: () => {
          this.toast.show('Parcel deleted successfully!', 'success');
          this.loadAll();
          this.showDeleteConfirmModal = false;
          this.parcelToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting parcel:', error);
          this.toast.show('Failed to delete parcel', 'error');
          this.showDeleteConfirmModal = false;
          this.parcelToDelete = null;
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteConfirmModal = false;
    this.parcelToDelete = null;
  }

  // Update createOrder to handle both create and edit
  createOrder() {
    if (!this.senderName || !this.senderEmail || !this.senderPhone || !this.pickupAddress ||
        !this.receiverName || !this.receiverEmail || !this.receiverPhone || !this.deliveryAddress ||
        !this.packageWeight || !this.packageDescription || !this.driverId) {
      this.toast.show('Please fill in all fields.', 'error');
      return;
    }

    const driver = this.drivers.find(d => d.id.toString() === this.driverId);
    if (!driver) {
      this.toast.show('Please select a valid driver.', 'error');
      return;
    }

    const parcelData = {
      senderId: 1, // Default sender ID for admin-created parcels
      recipientName: this.receiverName,
      recipientEmail: this.receiverEmail,
      recipientPhone: this.receiverPhone,
      pickupAddress: this.pickupAddress,
      pickupLocation: this.pickupLocation ? `${this.pickupLocation.lat},${this.pickupLocation.lng}` : undefined,
      deliveryAddress: this.deliveryAddress,
      deliveryLocation: this.deliveryLocation ? `${this.deliveryLocation.lat},${this.deliveryLocation.lng}` : undefined,
      driverId: parseInt(this.driverId),
      weight: this.packageWeight,
      description: this.packageDescription,
      status: 'pending'
    };

    if (this.editingParcel) {
      // Update existing parcel
      this.adminService.updateParcel(this.editingParcel.id?.toString() || '', parcelData).subscribe({
        next: (response) => {
          this.toast.show('Parcel updated successfully!', 'success');
          this.closeCreateParcelModal();
          this.loadAll();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating parcel:', error);
          this.toast.show('Failed to update parcel. Please try again.', 'error');
        }
      });
    } else {
      // Create new parcel
      this.adminService.createParcel(parcelData).subscribe({
        next: (response) => {
          this.toast.show('Order created successfully!', 'success');
          this.closeCreateParcelModal();
          this.loadAll();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating parcel:', error);
          this.toast.show('Failed to create order. Please try again.', 'error');
        }
      });
    }
  }

  // Helper method to reset form
  private resetForm() {
    this.senderName = this.senderEmail = this.senderPhone = this.pickupAddress = '';
    this.receiverName = this.receiverEmail = this.receiverPhone = this.deliveryAddress = '';
    this.packageWeight = this.packageDescription = '';
    this.driverId = '';
    this.pickupLocation = null;
    this.deliveryLocation = null;
    this.editingParcel = null;
  }

  openAddDriverModal() {
    // Get all users and drivers, filter users not already drivers
    this.adminService.getUsers().subscribe({
      next: (users) => {
        console.log('Users received:', users);
        this.adminService.getDrivers().subscribe({
          next: (drivers) => {
            console.log('Drivers received:', drivers);
            const driverEmails = new Set(drivers.map((d: any) => d.email.toLowerCase()));
            this.eligibleUsers = users.filter((u: any) => !driverEmails.has(u.email.toLowerCase()));
            console.log('Eligible users:', this.eligibleUsers);
            this.selectedUserEmail = '';
            this.showAddDriverModal = true;
          },
          error: (error) => {
            console.error('Error getting drivers:', error);
            this.toast.show('Failed to load drivers', 'error');
          }
        });
      },
      error: (error) => {
        console.error('Error getting users:', error);
        this.toast.show('Failed to load users', 'error');
      }
    });
  }

  closeAddDriverModal() {
    this.showAddDriverModal = false;
  }

  addDriver() {
    const user = this.eligibleUsers.find(u => u.email === this.selectedUserEmail);
    if (!user) {
      this.toast.show('Please select a user.', 'error');
      return;
    }
    
    // Promote existing user to driver role (no password needed)
    this.adminService.promoteToDriver(user.id.toString()).subscribe({
      next: () => {
        this.toast.show('User promoted to driver successfully!', 'success');
        this.closeAddDriverModal();
        this.loadAll();
      },
      error: (error) => {
        console.error('Error promoting user to driver:', error);
        this.toast.show('Failed to promote user to driver', 'error');
      }
    });
  }

  openTrackParcelModal(parcel: Parcel) {
    this.trackedParcel = parcel;
  }
}
