import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
import { driverGuard } from './guards/driver-guard';
import { authGuard } from './guards/auth-guard';
import { userGuard } from './guards/user-guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/landingpage/home/home').then(m => m.Home) },
  { path: 'about', loadComponent: () => import('./components/landingpage/about/about').then(m => m.About) },
  { path: 'contact', loadComponent: () => import('./components/landingpage/contact/contact').then(m => m.Contact) },
  { path: 'login', loadComponent: () => import('./components/auth/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./components/auth/register/register').then(m => m.Register) },
  { path: 'forgot-password', loadComponent: () => import('./components/auth/forgot-password/forgot-password').then(m => m.ForgotPassword) },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [adminGuard]
  },
  {
    path: 'driver-dashboard',
    loadComponent: () => import('./components/driver/driver-dashboard/driver-dashboard').then(m => m.DriverDashboard),
    canActivate: [driverGuard]
  },
  {
    path: 'user-dashboard',
    loadComponent: () => import('./components/user/user-dashboard/user-dashboard').then(m => m.UserDashboard),
    canActivate: [userGuard]
  },
  {
    path: 'user-profile',
    loadComponent: () => import('./components/user/user-profile/user-profile').then(m => m.UserProfile),
    canActivate: [userGuard]
  },
  { path: 'map-view/:trackingNumber', loadComponent: () => import('./components/map/map-view/map-view').then(m => m.MapView) }
];
