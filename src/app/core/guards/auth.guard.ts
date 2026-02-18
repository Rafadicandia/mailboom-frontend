import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

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

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  
  try {
    const decoded: any = jwtDecode(token);
    const role = decoded.role || decoded.roles || 'USER';
    
    if (role === 'ADMIN') {
      return true;
    }
    
    // Si no es admin, redirigir al dashboard regular
    router.navigate(['/dashboard']);
    return false;
  } catch (e) {
    console.error('Error decoding token in adminGuard:', e);
    router.navigate(['/dashboard']);
    return false;
  }
};