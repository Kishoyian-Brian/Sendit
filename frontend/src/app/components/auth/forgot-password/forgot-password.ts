import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  newPassword = '';
  @ViewChild('toast') toast!: Toast;

  constructor(private router: Router) {}

  async resetPassword() {
    if (!this.email || !this.newPassword) {
      this.toast.show('Please fill in all fields.', 'error');
      return;
    }
    const emailLower = this.email.toLowerCase();
    let found = false;
    // Try users
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIdx = users.findIndex((u: any) => u.email.toLowerCase() === emailLower);
    if (userIdx !== -1) {
      users[userIdx].password = this.newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      found = true;
    }
    // Try drivers
    let drivers = JSON.parse(localStorage.getItem('admin_drivers') || '[]');
    const driverIdx = drivers.findIndex((d: any) => d.email.toLowerCase() === emailLower);
    if (driverIdx !== -1) {
      drivers[driverIdx].password = this.newPassword;
      localStorage.setItem('admin_drivers', JSON.stringify(drivers));
      found = true;
    }
    // Try admins
    let admins = JSON.parse(localStorage.getItem('admins') || '[]');
    const adminIdx = admins.findIndex((a: any) => a.email.toLowerCase() === emailLower);
    if (adminIdx !== -1) {
      admins[adminIdx].password = this.newPassword;
      localStorage.setItem('admins', JSON.stringify(admins));
      found = true;
    }
    if (found) {
      this.toast.show('Password reset successful! Please log in.', 'success');
      setTimeout(() => this.router.navigate(['/login']), 1500);
    } else {
      this.toast.show('Email not found.', 'error');
    }
  }
} 