import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  if (loggedIn) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
