import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const userGuard = () => {
  const router = inject(Router);
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const isDriver = localStorage.getItem('isDriver') === 'true';
  if (loggedIn && !isAdmin && !isDriver) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
