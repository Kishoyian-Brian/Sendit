import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './user-profile.html',
  styles: []
})
export class UserProfile implements OnInit {
  user: User | null = null;
  loading = true;
  editing = false;
  updatedUser: Partial<User> = {};

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      this.userService.getProfile().subscribe({
        next: (user: User) => {
          this.user = user;
          this.updatedUser = { ...this.user };
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading user profile:', error);
          this.loading = false;
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleEdit() {
    this.editing = !this.editing;
    if (this.editing) {
      this.updatedUser = { ...this.user };
    }
  }

  saveProfile() {
    if (this.user) {
      this.userService.updateProfile(this.updatedUser).subscribe({
        next: (updatedUser: User) => {
          this.user = updatedUser;
          this.editing = false;
          // Update the current user in localStorage
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        },
        error: (error: any) => {
          console.error('Error updating profile:', error);
        }
      });
    }
  }

  cancelEdit() {
    this.editing = false;
    this.updatedUser = { ...this.user };
  }

  goBack() {
    this.router.navigate(['/user-dashboard']);
  }
} 