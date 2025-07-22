import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const driverGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isDriver()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
