import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const driverGuard = () => {
  const router = inject(Router);
  const isDriver = localStorage.getItem('isDriver') === 'true';
  const driverData = localStorage.getItem('driver_data');
  if (isDriver && driverData) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
