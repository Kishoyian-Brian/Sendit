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
  parcels: any[] = [];
  loading = true;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.loading = true;
    this.userService.getMyParcels().subscribe(parcels => {
      this.parcels = parcels;
      this.loading = false;
    });
  }

  logout() {
    this.authService.logout();
  }
} 