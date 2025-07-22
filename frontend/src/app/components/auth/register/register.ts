import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Toast } from '../../toast/toast/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, FormsModule, Toast],
  templateUrl: './register.html',
  styles: ``
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  @ViewChild('toast') toast!: Toast;

  constructor(private router: Router, private authService: AuthService) {}

  async register() {
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) {
      this.toast.show('Please fill in all required fields.', 'error');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.toast.show('Passwords do not match.', 'error');
      return;
    }

    const emailLower = this.email.toLowerCase();

    // Admin registration
    if (
      emailLower === this.authService.DEFAULT_ADMIN_EMAIL &&
      this.password === this.authService.DEFAULT_ADMIN_PASSWORD
    ) {
      const result = await this.authService.registerAdmin({
        id: `ADM${Date.now()}`,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        role: 'admin',
        createdAt: new Date(),
        isActive: true
      });
      this.toast.show(result.message, result.success ? 'success' : 'error');
    }
    // Driver registration
    else if (
      emailLower === this.authService.DEFAULT_DRIVER_EMAIL &&
      this.password === this.authService.DEFAULT_DRIVER_PASSWORD
    ) {
      const result = await this.authService.registerDriver({
        id: `DRV${Date.now()}`,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        status: 'inactive',
        rating: 0,
        deliveriesCompleted: 0,
        phone: '', 
        vehicleInfo: { type: '', plateNumber: '', model: '' }
      });
      this.toast.show(result.message, result.success ? 'success' : 'error');
    }
    // Regular user registration
    else {
      const result = await this.authService.registerUser({
        name: `${this.firstName} ${this.lastName}`,
        email: this.email,
        password: this.password
      });
      this.toast.show(result.message, result.success ? 'success' : 'error');
    }
    setTimeout(() => this.router.navigate(['/login']), 1500);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
