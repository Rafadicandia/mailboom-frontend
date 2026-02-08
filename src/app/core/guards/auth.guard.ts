import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');
  
  console.log('AuthGuard - Token exists:', !!token);
  
  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};