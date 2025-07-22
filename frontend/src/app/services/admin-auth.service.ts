import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Admin, AdminLoginCredentials } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly ADMIN_KEY = 'admin_data';
  private readonly DEFAULT_ADMIN: AdminLoginCredentials = {
    email: 'admin@sendit.com',
    password: 'Admin@123'
  };

  constructor(private router: Router) {
    this.initializeDefaultAdmin();
  }

  private initializeDefaultAdmin(): void {
    const admins = this.getStoredAdmins();
    if (admins.length === 0) {
      const defaultAdmin: Admin = {
        id: 'ADM001',
        username: 'admin',
        email: 'admin@sendit.com',
        password: 'Admin@123', // Add this line
        role: 'super_admin',
        firstName: 'Super',
        lastName: 'Admin',
        createdAt: new Date(),
        isActive: true
      };


      localStorage.setItem('admins', JSON.stringify([{
        ...defaultAdmin,
        password: this.DEFAULT_ADMIN.password 
      }]));
    }
  }

  private getStoredAdmins(): any[] {
    return JSON.parse(localStorage.getItem('admins') || '[]');
  }

  login(credentials: AdminLoginCredentials): { success: boolean; message: string } {
    const admins = this.getStoredAdmins();
    const admin = admins.find((a: any) => 
      a.email === credentials.email && a.password === credentials.password);

    if (admin) {
      // Remove password before storing in session
      const { password, ...safeAdminData } = admin;
      
      // Update last login
      safeAdminData.lastLogin = new Date();
      
      // Store admin session
      localStorage.setItem(this.ADMIN_KEY, JSON.stringify(safeAdminData));
      
      return { success: true, message: 'Login successful' };
    }

    return { success: false, message: 'Invalid credentials' };
  }

  logout(): void {
    localStorage.removeItem(this.ADMIN_KEY);
    this.router.navigate(['/admin/login']);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(this.ADMIN_KEY) !== null;
  }

  getCurrentAdmin(): Admin | null {
    const adminData = localStorage.getItem(this.ADMIN_KEY);
    return adminData ? JSON.parse(adminData) : null;
  }

  updateAdmin(adminData: Partial<Admin>): void {
    const currentAdmin = this.getCurrentAdmin();
    if (currentAdmin) {
      const updatedAdmin = { ...currentAdmin, ...adminData };
      localStorage.setItem(this.ADMIN_KEY, JSON.stringify(updatedAdmin));
    }
  }

  getDefaultAdminCredentials(): AdminLoginCredentials {
    return this.DEFAULT_ADMIN;
  }
} 