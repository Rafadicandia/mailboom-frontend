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
    if (!token) return null;
    
    try {
      const decoded: any = jwtDecode(token);
      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      };
    } catch (e) {
      localStorage.removeItem('accessToken');
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
          const user = this.decodeToken(token);
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
          const user = this.decodeToken(token);
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
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private decodeToken(token: string): User {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };
  }
}