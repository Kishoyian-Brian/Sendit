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
    ParcelStatusPipe
  ],
  templateUrl: './admin-dashboard.html',
  styles: ``
})
export class AdminDashboard implements OnInit {
  @ViewChild('toast') toast!: Toast;

  stats: any = {};
  currentSection: 'overview' | 'parcels' | 'drivers' | 'reports' = 'overview';
  searchTerm = '';
  statusFilter: string = 'all';
  dateFilter: string = 'all';
  parcels: any[] = [];
  drivers: any[] = [];
  showCreateParcelModal = false;
  showAddDriverModal = false;
  eligibleUsers: any[] = [];
  selectedUserEmail = '';
  newDriverPassword = '';

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

  constructor(private adminService: AdminService) {}

  async ngOnInit() {
    await this.loadAll();
  }

  async loadAll() {
    this.parcels = await this.adminService.getParcels();
    this.drivers = await this.adminService.getDrivers();
    this.stats = await this.adminService.getStats();
  }

  showSection(section: 'overview' | 'parcels' | 'drivers' | 'reports') {
    this.currentSection = section;
  }

  async assignDriver(parcel: any, driver: any) {
    await this.adminService.assignDriver(parcel.id, driver.name);
    await this.loadAll();
    this.toast.show('Driver assigned!', 'success');
  }

  async updateParcelStatus(parcel: Parcel, newStatus: Parcel['status']) {
    await this.adminService.updateParcel(parcel.id, { status: newStatus });
    await this.loadAll();
    this.toast.show('Parcel status updated!', 'success');
  }

  async toggleDriverStatus(driver: any) {
    await this.adminService.toggleDriverStatus(driver.id);
    await this.loadAll();
    this.toast.show('Driver status updated!', 'success');
  }

  filterParcels() {
    let filtered = [...this.parcels];
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.trackingNumber.toLowerCase().includes(search) ||
        p.sender.toLowerCase().includes(search) ||
        p.recipient.toLowerCase().includes(search)
      );
    }
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.statusFilter);
    }
    // dateFilter logic can be added here
    return filtered;
  }

  async exportData() {
    await this.adminService.exportData();
    this.toast.show('Data exported (see console for now)', 'success');
  }

  openCreateParcelModal() {
    this.showCreateParcelModal = true;
  }

  closeCreateParcelModal() {
    this.showCreateParcelModal = false;
  }

  async createOrder() {
    if (!this.senderName || !this.senderEmail || !this.senderPhone || !this.pickupAddress ||
        !this.receiverName || !this.receiverEmail || !this.receiverPhone || !this.deliveryAddress ||
        !this.packageWeight || !this.packageDescription || !this.driverId) {
      this.toast.show('Please fill in all fields.', 'error');
      return;
    }
    const driver = this.drivers.find(d => d.id === this.driverId);
    const id = 'P' + Date.now();
    const trackingNumber = `SEXP-254-${Date.now()}`;
    const parcel = {
      id,
      trackingNumber,
      sender: this.senderName,
      senderEmail: this.senderEmail,
      senderPhone: this.senderPhone,
      senderId: this.senderEmail,
      pickupAddress: this.pickupAddress,
      recipient: this.receiverName,
      recipientEmail: this.receiverEmail,
      recipientPhone: this.receiverPhone,
      recipientId: this.receiverEmail,
      deliveryAddress: this.deliveryAddress,
      weight: this.packageWeight,
      description: this.packageDescription,
      driver: driver ? (driver.firstName + ' ' + driver.lastName) : '',
      driverId: this.driverId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const parcels = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    parcels.push(parcel);
    localStorage.setItem('admin_parcels', JSON.stringify(parcels));
    this.toast.show('Order created successfully!', 'success');
    setTimeout(async () => {
      this.closeCreateParcelModal();
      await this.loadAll();
    }, 800);
    this.senderName = this.senderEmail = this.senderPhone = this.pickupAddress = '';
    this.receiverName = this.receiverEmail = this.receiverPhone = this.deliveryAddress = '';
    this.packageWeight = this.packageDescription = '';
    this.driverId = '';
  }

  async openAddDriverModal() {
    // Get all users and drivers, filter users not already drivers
    const [users, drivers] = await Promise.all([
      this.adminService.getUsers(),
      this.adminService.getDrivers()
    ]);
    const driverEmails = new Set(drivers.map((d: any) => d.email.toLowerCase()));
    this.eligibleUsers = users.filter((u: any) => !driverEmails.has(u.email.toLowerCase()));
    this.selectedUserEmail = '';
    this.newDriverPassword = '';
    this.showAddDriverModal = true;
  }

  closeAddDriverModal() {
    this.showAddDriverModal = false;
  }

  async addDriver() {
    const user = this.eligibleUsers.find(u => u.email === this.selectedUserEmail);
    if (!user) {
      this.toast.show('Please select a user.', 'error');
      return;
    }
    if (!this.newDriverPassword) {
      this.toast.show('Please set a password.', 'error');
      return;
    }
    const result = await this.adminService.addDriverFromUser(user, this.newDriverPassword);
    if (result.success) {
      this.toast.show(result.message, 'success');
      this.closeAddDriverModal();
      await this.loadAll();
    } else {
      this.toast.show(result.message, 'error');
    }
  }
}
