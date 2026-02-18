import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/auth.model';

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API_URL = '/api/user';
  private http = inject(HttpClient);

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  updateUser(id: string, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
