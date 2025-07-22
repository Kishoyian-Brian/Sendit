import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Parcel } from '../../../models/parcel.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './user-dashboard.html',
  styles: []
})
export class UserDashboard implements OnInit {
  sentParcels: Parcel[] = [];
  receivedParcels: Parcel[] = [];
  loading = true;
  currentView: 'sent' | 'received' | 'notifications' = 'sent';

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.loading = true;
    this.sentParcels = await this.userService.getSentParcels();
    this.receivedParcels = await this.userService.getReceivedParcels();
    this.loading = false;
  }

  showView(view: 'sent' | 'received' | 'notifications') {
    this.currentView = view;
  }

  logout() {
    this.authService.logout(this.router);
  }

  getStepStatus(parcelStatus: 'pending' | 'in_transit' | 'delivered' | 'assigned' | 'pending_pickup', step: 'picked' | 'transit' | 'delivered'): 'complete' | 'active' | 'pending' {
    const statusOrder: ('pending' | 'in_transit' | 'delivered' | 'assigned' | 'pending_pickup')[] = ['pending', 'assigned', 'pending_pickup', 'in_transit', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(parcelStatus);

    if (step === 'picked') {
      if (currentStatusIndex >= 3) return 'complete'; // In transit or delivered
      if (currentStatusIndex >= 1) return 'active'; // Assigned or pending_pickup
      return 'pending';
    }
    if (step === 'transit') {
      if (parcelStatus === 'delivered') return 'complete';
      if (parcelStatus === 'in_transit') return 'active';
      return 'pending';
    }
    if (step === 'delivered') {
      if (parcelStatus === 'delivered') return 'complete';
      return 'pending';
    }
    return 'pending';
  }
} 