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
import { AuthService } from '../../../services/auth.service';

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
  styles: [`
    .scrollbar-hide {
      -ms-overflow-style: none;  /* Internet Explorer 10+ */
      scrollbar-width: none;  /* Firefox */
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;  /* Safari and Chrome */
    }
  `]
})
export class AdminDashboard implements OnInit {
  @ViewChild('toast') toast!: Toast;

  // Make Math available in template
  Math = Math;

  stats: any = {};
  currentSection: 'overview' | 'parcels' | 'drivers' | 'users' | 'reports' | 'map' = 'overview';
  searchTerm = '';
  userSearchTerm = '';
  parcelSearchTerm = '';
  statusFilter: string = 'all';
  dateFilter: string = 'all';
  parcels: any[] = [];
  drivers: any[] = [];
  users: any[] = [];
  showCreateParcelModal = false;
  showAddDriverModal = false;
  showDeleteUserModal = false;
  userToDelete: any = null;
  eligibleUsers: any[] = [];
  selectedUserEmail = '';
  trackedParcel: Parcel | null = null;
  editingParcel: any = null;
  showDeleteConfirmModal = false;
  parcelToDelete: any = null;

  // Pagination properties
  currentPage = 1;
  pageSize = 12;
  totalUsers = 0;
  totalPages = 0;

  // Parcel pagination properties
  currentParcelPage = 1;
  totalParcels = 0;
  totalParcelPages = 0;

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
  locationTypeBeingSet: 'delivery' | null = null;

  openLocationMap(type: 'delivery') {
    this.locationTypeBeingSet = type;
    this.showLocationMapModal = true;
  }

  closeLocationMap() {
    this.showLocationMapModal = false;
    this.locationTypeBeingSet = null;
  }

  onMapLocationSelected(location: { lat: number; lng: number }) {
    if (this.locationTypeBeingSet === 'delivery') {
      this.deliveryLocation = location;
    }
    this.closeLocationMap();
  }

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loadParcels();
    this.adminService.getDrivers().subscribe(drivers => this.drivers = drivers);
    this.loadUsers();
    this.adminService.getStats().subscribe(stats => this.stats = stats);
  }

  loadParcels() {
    console.log('Loading parcels for page:', this.currentParcelPage, 'pageSize:', this.pageSize);
    this.adminService.getParcels(this.currentParcelPage, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('Parcels response:', response);
        
        // Try different response structures
        if (response.data && Array.isArray(response.data)) {
          // Direct array response
          this.parcels = response.data;
          this.totalParcels = response.total || response.data.length;
        } else if (response.data && response.data.data) {
          // Nested paginated response
          this.parcels = response.data.data || [];
          this.totalParcels = response.data.total || 0;
        } else if (Array.isArray(response)) {
          // Direct array response
          this.parcels = response;
          this.totalParcels = response.length;
        } else {
          // Fallback
          this.parcels = [];
          this.totalParcels = 0;
        }
        
        this.totalParcelPages = Math.ceil(this.totalParcels / this.pageSize);
        console.log('Processed parcels:', this.parcels);
        console.log('Total parcels:', this.totalParcels);
        console.log('Total parcel pages:', this.totalParcelPages);
        console.log('Parcels array length:', this.parcels.length);
      },
      error: (error) => {
        console.error('Error loading parcels:', error);
        this.toast.show('Failed to load parcels', 'error');
      }
    });
  }

  // Parcel pagination methods
  goToParcelPage(page: number) {
    if (page >= 1 && page <= this.totalParcelPages) {
      this.currentParcelPage = page;
      this.loadParcels();
    }
  }

  getParcelPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalParcelPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalParcelPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentParcelPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentParcelPage >= this.totalParcelPages - 2) {
        for (let i = this.totalParcelPages - 4; i <= this.totalParcelPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = this.currentParcelPage - 2; i <= this.currentParcelPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }

  loadUsers() {
    console.log('Loading users for page:', this.currentPage, 'pageSize:', this.pageSize);
    this.adminService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('Users response:', response);
        // Handle nested response structure: response.data.data
        const paginatedData = response.data;
        this.users = paginatedData?.data || [];
        this.totalUsers = paginatedData?.total || 0;
        this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
        console.log('Processed users:', this.users);
        console.log('Total users:', this.totalUsers);
        console.log('Total pages:', this.totalPages);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toast.show('Failed to load users', 'error');
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }

  showSection(section: 'overview' | 'parcels' | 'drivers' | 'users' | 'reports' | 'map') {
    this.currentSection = section;
  }

  assignDriver(parcel: any, driver: any) {
    this.adminService.updateParcel(parcel.id, { driverId: driver.id }).subscribe(() => {
      this.loadParcels();
      this.toast.show('Driver assigned!', 'success');
    });
  }

  updateParcelStatus(parcel: Parcel, newStatus: Parcel['status']) {
    this.adminService.updateParcel(parcel.id?.toString() || '', { status: newStatus }).subscribe({
      next: () => {
        this.loadParcels();
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
    if (this.parcelSearchTerm) {
      const search = this.parcelSearchTerm.toLowerCase();
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

  filterUsers() {
    let filtered = [...this.users];
    if (this.userSearchTerm) {
      const search = this.userSearchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search)
      );
    }
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
          this.loadParcels();
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
    console.log('Creating parcel with data:', {
      senderName: this.senderName,
      senderEmail: this.senderEmail,
      senderPhone: this.senderPhone,
      pickupAddress: this.pickupAddress,
      receiverName: this.receiverName,
      receiverEmail: this.receiverEmail,
      receiverPhone: this.receiverPhone,
      deliveryAddress: this.deliveryAddress,
      packageWeight: this.packageWeight,
      packageDescription: this.packageDescription,
      driverId: this.driverId
    });

    if (!this.senderName || !this.senderEmail || !this.senderPhone || !this.pickupAddress ||
        !this.receiverName || !this.receiverEmail || !this.receiverPhone || !this.deliveryAddress ||
        !this.packageWeight || !this.driverId) {
      this.toast.show('Please fill in all required fields.', 'error');
      return;
    }

    const driver = this.drivers.find(d => d.id.toString() === this.driverId);
    if (!driver) {
      this.toast.show('Please select a valid driver.', 'error');
      return;
    }

    const parcelData = {
      senderId: this.authService.getCurrentUser()?.id || 1, // Use current admin's ID
      recipientName: this.receiverName,
      recipientEmail: this.receiverEmail,
      recipientPhone: this.receiverPhone,
      pickupAddress: this.pickupAddress,
      pickupLocation: this.pickupLocation ? `${this.pickupLocation.lat},${this.pickupLocation.lng}` : undefined,
      deliveryAddress: this.deliveryAddress,
      deliveryLocation: this.deliveryLocation ? `${this.deliveryLocation.lat},${this.deliveryLocation.lng}` : undefined,
      driverId: parseInt(this.driverId),
      weight: this.packageWeight.toString(), // Convert to string
      description: this.packageDescription || '', // Make description optional
      status: 'pending'
    };

    console.log('Sending parcel data to backend:', parcelData);

    if (this.editingParcel) {
      // Update existing parcel
      this.adminService.updateParcel(this.editingParcel.id?.toString() || '', parcelData).subscribe({
        next: (response) => {
          console.log('Parcel updated successfully:', response);
          this.toast.show('Parcel updated successfully!', 'success');
          this.closeCreateParcelModal();
          this.loadParcels();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating parcel:', error);
          this.toast.show(error.error?.message || 'Failed to update parcel. Please try again.', 'error');
        }
      });
    } else {
      // Create new parcel
      this.adminService.createParcel(parcelData).subscribe({
        next: (response) => {
          console.log('Parcel created successfully:', response);
          this.toast.show('Order created successfully!', 'success');
          this.closeCreateParcelModal();
          this.loadParcels();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating parcel:', error);
          this.toast.show(error.error?.message || 'Failed to create order. Please try again.', 'error');
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

  // User Management Methods
  confirmDeleteUser() {
    if (this.userToDelete) {
      this.adminService.deleteUser(this.userToDelete.id?.toString() || '').subscribe({
        next: () => {
          this.toast.show('User deleted successfully!', 'success');
          this.loadUsers();
          this.showDeleteUserModal = false;
          this.userToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.toast.show('Failed to delete user', 'error');
          this.showDeleteUserModal = false;
          this.userToDelete = null;
        }
      });
    }
  }

  cancelDeleteUser() {
    this.showDeleteUserModal = false;
    this.userToDelete = null;
  }

  promoteUserToDriver(user: any) {
    this.adminService.promoteToDriver(user.id?.toString() || '').subscribe({
      next: () => {
        this.toast.show('User promoted to driver successfully!', 'success');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error promoting user to driver:', error);
        this.toast.show('Failed to promote user to driver', 'error');
      }
    });
  }

  demoteDriverToUser(user: any) {
    this.adminService.demoteFromDriver(user.id?.toString() || '').subscribe({
      next: () => {
        this.toast.show('Driver demoted to user successfully!', 'success');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error demoting driver to user:', error);
        this.toast.show('Failed to demote driver to user', 'error');
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'DRIVER':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Check if user is the current logged-in admin
  isCurrentAdmin(user: any): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === user.id && currentUser?.role === 'ADMIN';
  }

  // Override deleteUser method to prevent self-deletion
  deleteUser(user: any) {
    if (this.isCurrentAdmin(user)) {
      this.toast.show('You cannot delete your own account!', 'error');
      return;
    }
    this.userToDelete = user;
    this.showDeleteUserModal = true;
  }
}
