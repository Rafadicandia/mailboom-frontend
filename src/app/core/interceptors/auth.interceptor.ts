import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('accessToken');

  console.log('Auth Interceptor - Token:', token ? 'Presente' : 'No encontrado');
  console.log('Auth Interceptor - URL:', req.url);
  console.log('Auth Interceptor - Method:', req.method);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Auth Interceptor - Autorization header agregado');
  } else {
    console.warn('Auth Interceptor - No hay token, request sin autorización');
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado o inválido
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};