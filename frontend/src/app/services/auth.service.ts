import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Driver } from '../models/driver.model';
import { Admin } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly DEFAULT_ADMIN_EMAIL = 'admin@sendit.com';
  readonly DEFAULT_ADMIN_PASSWORD = 'Admin@123';
  readonly DEFAULT_DRIVER_EMAIL = 'driver@sendit.com';
  readonly DEFAULT_DRIVER_PASSWORD = 'Driver@123';

  async registerUser(user: User): Promise<{ success: boolean; message: string }> {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some((u: User) => u.email.toLowerCase() === user.email.toLowerCase())) {
      return { success: false, message: 'Email already registered.' };
    }
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, message: 'User registration successful! Please log in.' };
  }

  async registerDriver(driver: Driver): Promise<{ success: boolean; message: string }> {
    const drivers: Driver[] = JSON.parse(localStorage.getItem('drivers') || '[]');
    if (drivers.some((d: Driver) => d.email.toLowerCase() === driver.email.toLowerCase())) {
      return { success: false, message: 'Email already registered.' };
    }
    drivers.push(driver);
    localStorage.setItem('drivers', JSON.stringify(drivers));
    return { success: true, message: 'Driver registration successful! Please log in.' };
  }

  async registerAdmin(admin: Admin): Promise<{ success: boolean; message: string }> {
    const admins: Admin[] = JSON.parse(localStorage.getItem('admins') || '[]');
    if (admins.some((a: Admin) => a.email.toLowerCase() === admin.email.toLowerCase())) {
      return { success: false, message: 'Email already registered.' };
    }
    admins.push(admin);
    localStorage.setItem('admins', JSON.stringify(admins));
    return { success: true, message: 'Admin registration successful! Please log in.' };
  }

  async login(email: string, password: string): Promise<{ success: boolean; type?: 'admin' | 'driver' | 'user'; message: string }> {
    const emailLower = email.toLowerCase();

    // Admin
    const admins: Admin[] = JSON.parse(localStorage.getItem('admins') || '[]');
    const admin = admins.find((a: Admin) => a.email.toLowerCase() === emailLower && (a as any).password === password);
    if (admin) {
      localStorage.setItem('admin_data', JSON.stringify(admin));
      localStorage.setItem('isAdmin', 'true');
      return { success: true, type: 'admin', message: 'Admin login successful!' };
    }

    // Driver (use admin_drivers as canonical source)
    const drivers: Driver[] = JSON.parse(localStorage.getItem('admin_drivers') || '[]');
    const driver = drivers.find((d: Driver) => d.email.toLowerCase() === emailLower && (d as any).password === password);
    if (driver) {
      localStorage.setItem('driver_data', JSON.stringify(driver));
      localStorage.setItem('isDriver', 'true');
      return { success: true, type: 'driver', message: 'Driver login successful!' };
    }

    // User
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User) => u.email.toLowerCase() === emailLower && (u as any).password === password);
    if (user) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('isAdmin', 'false');
      localStorage.setItem('isDriver', 'false');
      localStorage.setItem('user_data', JSON.stringify(user));
      return { success: true, type: 'user', message: 'Login successful!' };
    }

    return { success: false, message: 'Invalid email or password.' };
  }
} 