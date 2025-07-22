import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { Toast } from '../../toast/toast/toast';
import { ParcelStatusPipe } from '../../../pipes/parcel-status-pipe';
import { FormatDatePipe } from '../../../pipes/format-date-pipe';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    Navbar,
    Footer,
    Toast,
    ParcelStatusPipe,
    FormatDatePipe
  ],
  templateUrl: './user-dashboard.html',
  styles: ``
})
export class UserDashboard implements OnInit {
  @ViewChild('toast') toast!: Toast;

  currentSection: 'overview' | 'sent' | 'received' | 'notifications' = 'overview';
  searchTerm = '';
  statusFilter: string = 'all';
  dateFilter: string = 'all';
  trackingNumber = '';

  // Data
  user: any = null;
  stats: any = {};
  sentParcels: any[] = [];
  receivedParcels: any[] = [];
  notifications: any[] = [];

  constructor(private userService: UserService) {}

  async ngOnInit() {
    await this.loadAll();
  }

  async loadAll() {
    try {
      const [user, stats, sent, received, notifications] = await Promise.all([
        this.userService.getCurrentUser(),
        this.userService.getDashboardStats(),
        this.userService.getSentParcels(),
        this.userService.getReceivedParcels(),
        this.userService.getNotifications()
      ]);

      this.user = user;
      this.stats = stats;
      this.sentParcels = sent;
      this.receivedParcels = received;
      this.notifications = notifications;
    } catch (error) {
      this.toast.show('Error loading dashboard data', 'error');
    }
  }

  showSection(section: 'overview' | 'sent' | 'received' | 'notifications') {
    this.currentSection = section;
  }

  async trackParcel() {
    if (!this.trackingNumber) {
      this.toast.show('Please enter a tracking number', 'error');
      return;
    }

    const result = await this.userService.trackParcel(this.trackingNumber);
    if (result.success) {
      this.toast.show('Parcel found!', 'success');
      // You could navigate to a detailed tracking view here
    } else {
      this.toast.show(result.message, 'error');
    }
  }

  async markNotificationAsRead(notificationId: string) {
    await this.userService.markNotificationAsRead(notificationId);
    await this.loadAll(); // Reload to get updated notification status
    this.toast.show('Notification marked as read', 'success');
  }

  async updateProfile(update: any) {
    const result = await this.userService.updateProfile(update);
    this.toast.show(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      await this.loadAll();
    }
  }

  filterParcels(parcels: any[]) {
    let filtered = [...parcels];
    
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.trackingNumber.toLowerCase().includes(search) ||
        p.status.toLowerCase().includes(search)
      );
    }
    
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.statusFilter);
    }
    
    // Add date filtering logic here if needed
    
    return filtered;
  }

  get filteredSentParcels() {
    return this.filterParcels(this.sentParcels);
  }

  get filteredReceivedParcels() {
    return this.filterParcels(this.receivedParcels);
  }
}
