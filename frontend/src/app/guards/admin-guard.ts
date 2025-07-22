import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const adminGuard = () => {
  const router = inject(Router);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const adminData = localStorage.getItem('admin_data');
  if (isAdmin && adminData) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
