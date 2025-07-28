import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Toast } from '../../toast/toast/toast';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, Toast],
  templateUrl: './forgot-password.html',
  styles: ''
})
export class ForgotPassword {
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  currentStep: 'email' | 'otp' | 'password' = 'email';
  @ViewChild('toast') toast!: Toast;

  constructor(private router: Router, private authService: AuthService) {}

  sendOTP() {
    if (!this.email) {
      this.toast.show('Please enter your email address.', 'error');
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toast.show('OTP sent to your email!', 'success');
        this.currentStep = 'otp';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Forgot password error:', error);
        this.toast.show(error.error?.message || 'Failed to send OTP. Please try again.', 'error');
      }
    });
  }

  verifyOTP() {
    if (!this.otp) {
      this.toast.show('Please enter the OTP.', 'error');
      return;
    }

    this.isLoading = true;
    this.authService.verifyOTP(this.email, this.otp).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toast.show('OTP verified successfully!', 'success');
        this.currentStep = 'password';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('OTP verification error:', error);
        this.toast.show(error.error?.message || 'Invalid OTP. Please try again.', 'error');
      }
    });
  }

  resetPassword() {
    if (!this.newPassword) {
      this.toast.show('Please enter a new password.', 'error');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toast.show('Passwords do not match.', 'error');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toast.show('Password must be at least 6 characters long.', 'error');
      return;
    }

    this.isLoading = true;
    this.authService.resetPassword(this.email, this.otp, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toast.show('Password reset successfully!', 'success');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Password reset error:', error);
        this.toast.show(error.error?.message || 'Failed to reset password. Please try again.', 'error');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goBack() {
    if (this.currentStep === 'otp') {
      this.currentStep = 'email';
      this.otp = '';
    } else if (this.currentStep === 'password') {
      this.currentStep = 'otp';
      this.newPassword = '';
      this.confirmPassword = '';
    }
  }
} 