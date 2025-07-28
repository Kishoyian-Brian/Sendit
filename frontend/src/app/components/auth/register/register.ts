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
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  @ViewChild('toast') toast!: Toast;

  constructor(private router: Router, private authService: AuthService) {}

  register() {
    if (!this.name || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.toast.show('Please fill in all required fields.', 'error');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.toast.show('Passwords do not match.', 'error');
      return;
    }

    this.isLoading = true;
    const userData = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toast.show(response.message || 'Registration successful!', 'success');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        this.toast.show(error.error?.message || 'Registration failed. Please try again.', 'error');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
