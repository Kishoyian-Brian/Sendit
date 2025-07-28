import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { AuthService } from '../../../services/auth.service';
import { Toast } from '../../toast/toast/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar, Footer, Toast],
  templateUrl: './login.html',
  styles: ``
})
export class Login {
  email = '';
  password = '';
  isLoading = false;
  @ViewChild('toast') toast!: Toast;

  constructor(private router: Router, private authService: AuthService) {}

  login() {
    if (!this.email || !this.password) {
      this.toast.show('Please fill in all fields.', 'error');
      return;
    }

    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toast.show('Login successful!', 'success');
        
        // Navigate based on user role
        const user = this.authService.getCurrentUser();
        if (user?.role === 'ADMIN') {
          setTimeout(() => this.router.navigate(['/admin-dashboard']), 1500);
        } else if (user?.role === 'DRIVER') {
          setTimeout(() => this.router.navigate(['/driver-dashboard']), 1500);
        } else {
          setTimeout(() => this.router.navigate(['/user-dashboard']), 1500);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.toast.show(error.error?.message || 'Login failed. Please try again.', 'error');
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
