import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { LoginRequest, NewUserRequest, TokenResponse, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = '/api/auth';
  
  private _currentUser = signal<User | null>(this.loadUserFromStorage());
  
  readonly currentUser = computed(() => this._currentUser());
  readonly isAuthenticated = computed(() => !!this._currentUser());

  constructor(private http: HttpClient, private router: Router) {}

  private loadUserFromStorage(): User | null {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    if (!token) return null;
    
    try {
      const decoded: any = jwtDecode(token);
      console.log('Token decodificado:', decoded);
      return {
        // userId tiene prioridad si existe
        id: userId || decoded.id || decoded.sub,
        email: decoded.email || decoded.sub,
        name: decoded.name || decoded.username || decoded.firstName || 'Usuario',
        role: decoded.role || decoded.roles || 'USER'
      };
    } catch (e) {
      console.error('Error decodificando token:', e);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      return null;
    }
  }

  login(credentials: LoginRequest) {
    return this.http.post<TokenResponse>(`${this.API_URL}/login`, credentials)
      .subscribe({
        next: (response) => {
          console.log('Login success:', response);
          
          // Usar access_token (snake_case del backend)
          const token = response.access_token;
          
          localStorage.setItem('accessToken', token);
          // user_id viene separado en la respuesta
          localStorage.setItem('userId', response.user_id);
          
          const user = this.decodeToken(token, response.user_id);
          this._currentUser.set(user);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login error:', err);
          alert('Error de login: ' + (err.error?.message || err.message));
        }
      });
  }

  register(data: NewUserRequest) {
    return this.http.post<TokenResponse>(`${this.API_URL}/register`, data)
      .subscribe({
        next: (response) => {
          const token = response.access_token;
          
          localStorage.setItem('accessToken', token);
          // user_id viene separado en la respuesta
          localStorage.setItem('userId', response.user_id);
          
          const user = this.decodeToken(token, response.user_id);
          this._currentUser.set(user);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Register error:', err);
          alert('Error de registro: ' + (err.error?.message || err.message));
        }
      });
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private decodeToken(token: string, userId?: string): User {
    const decoded: any = jwtDecode(token);
    console.log('Token decodificado:', decoded);
    return {
      // user_id tiene prioridad si viene en la respuesta
      id: userId || decoded.id || decoded.sub,
      email: decoded.email || decoded.sub,
      name: decoded.name || decoded.username || decoded.firstName || 'Usuario',
      role: decoded.role || decoded.roles || 'USER'
    };
  }
}