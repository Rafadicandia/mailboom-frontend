import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { User } from '../models/auth.model';
import { Campaign } from '../models/campaign.model';
import { ContactList, Contact } from '../models/contact.model';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  totalContacts: number;
  totalContactLists: number;
  totalDelivered: number;
  totalBounces: number;
  totalComplaints: number;
  totalRejects: number;
}

export interface GeneralMetrics {
  totalDelivered: number;
  totalBounces: number;
  totalComplaints: number;
  totalRejects: number;
}

export interface DailyMetric {
  date: string;
  delivered: number;
  bounces: number;
  complaints: number;
  rejects: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly API_URL = '/api/admin';
  private http = inject(HttpClient);

  // Signals para almacenar datos
  private _users = signal<User[]>([]);
  private _campaigns = signal<Campaign[]>([]);
  private _contactLists = signal<ContactList[]>([]);
  private _stats = signal<AdminStats>({
    totalUsers: 0,
    totalCampaigns: 0,
    totalContacts: 0,
    totalContactLists: 0,
    totalDelivered: 0,
    totalBounces: 0,
    totalComplaints: 0,
    totalRejects: 0
  });
  private _metrics = signal<GeneralMetrics | null>(null);
  private _dailyMetrics = signal<DailyMetric[]>([]);

  readonly users = this._users.asReadonly();
  readonly campaigns = this._campaigns.asReadonly();
  readonly contactLists = this._contactLists.asReadonly();
  readonly stats = this._stats.asReadonly();
  readonly metrics = this._metrics.asReadonly();
  readonly dailyMetrics = this._dailyMetrics.asReadonly();

  // ========== USER OPERATIONS ==========

  getUsers(page: number = 0, size: number = 10): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<User>>(`${this.API_URL}/users`, { params })
      .pipe(tap(response => this._users.set(response.content)));
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`);
  }

  updateUser(id: string, data: { name?: string; email?: string; password?: string }): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`);
  }

  // ========== CAMPAIGN OPERATIONS ==========

  getCampaigns(page: number = 0, size: number = 10): Observable<PaginatedResponse<Campaign>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<Campaign>>(`${this.API_URL}/campaigns`, { params })
      .pipe(tap(response => this._campaigns.set(response.content)));
  }

  getCampaignsByUser(userId: string, page: number = 0, size: number = 100): Observable<PaginatedResponse<Campaign>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('userId', userId);

    return this.http.get<PaginatedResponse<Campaign>>(`${this.API_URL}/campaigns`, { params });
  }

  getCampaignById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.API_URL}/campaigns/${id}`);
  }

  deleteCampaign(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/campaigns/${id}`);
  }

  // ========== CONTACT LIST OPERATIONS ==========

  getContactLists(page: number = 0, size: number = 10, userId?: string): Observable<PaginatedResponse<ContactList>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (userId) {
      params = params.set('userId', userId);
    }

    return this.http.get<PaginatedResponse<ContactList>>(`${this.API_URL}/contacts/lists`, { params })
      .pipe(tap(response => this._contactLists.set(response.content)));
  }

  getContactListsByUser(userId: string, page: number = 0, size: number = 100): Observable<PaginatedResponse<ContactList>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('userId', userId);

    return this.http.get<PaginatedResponse<ContactList>>(`${this.API_URL}/contacts/lists`, { params });
  }

  getContactListById(id: string): Observable<ContactList> {
    return this.http.get<ContactList>(`${this.API_URL}/contacts/lists/${id}`);
  }

  createContactList(name: string, ownerId: string): Observable<ContactList> {
    return this.http.post<ContactList>(`${this.API_URL}/contacts/lists`, {
      name,
      ownerId
    });
  }

  updateContactList(id: string, name: string, ownerId: string): Observable<ContactList> {
    return this.http.put<ContactList>(`${this.API_URL}/contacts/lists/${id}`, {
      name,
      ownerId
    });
  }

  deleteContactList(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/contacts/lists/${id}`);
  }

  // ========== CONTACT OPERATIONS ==========

  getContactsFromList(listId: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<Contact>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<Contact>>(`${this.API_URL}/contacts/lists/${listId}/contacts`, { params });
  }

  getContactsCountFromList(listId: string): Observable<number> {
    // Get total count by requesting page 0 with size 0
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '0');

    return this.http.get<PaginatedResponse<Contact>>(`${this.API_URL}/contacts/lists/${listId}/contacts`, { params })
      .pipe(map(response => response.totalElements));
  }

  getContactById(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.API_URL}/contacts/${id}`);
  }

  createContact(data: {
    contactListId: string;
    email: string;
    name: string;
    customFields?: Record<string, any>;
    subscribed?: boolean;
  }): Observable<Contact> {
    return this.http.post<Contact>(`${this.API_URL}/contacts`, data);
  }

  updateContact(id: string, data: {
    email?: string;
    name?: string;
    customFields?: Record<string, any>;
    subscribed?: boolean;
  }): Observable<Contact> {
    return this.http.put<Contact>(`${this.API_URL}/contacts/${id}`, data);
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/contacts/${id}`);
  }

  // ========== STATS ==========

  loadMetrics() {
    this.http.get<GeneralMetrics>('/api/admin/metrics')
      .subscribe({
        next: (metrics) => {
          this._metrics.set(metrics);
        },
        error: (err) => {
          console.error('Error loading metrics:', err);
        }
      });
  }

  loadDailyMetrics() {
    this.http.get<DailyMetric[]>('/api/admin/metrics/daily')
      .subscribe({
        next: (metrics) => {
          this._dailyMetrics.set(metrics);
        },
        error: (err) => {
          console.error('Error loading daily metrics:', err);
          // Generar datos de ejemplo si el endpoint no está disponible
          this.generateMockDailyMetrics();
        }
      });
  }

  private generateMockDailyMetrics() {
    const metrics: DailyMetric[] = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      metrics.push({
        date: date.toISOString().split('T')[0],
        delivered: Math.floor(Math.random() * 500) + 100,
        bounces: Math.floor(Math.random() * 50) + 5,
        complaints: Math.floor(Math.random() * 20) + 1,
        rejects: Math.floor(Math.random() * 30) + 2
      });
    }
    
    this._dailyMetrics.set(metrics);
  }

  loadStats() {
    // Cargar total de usuarios (sin sobrescribir la lista)
    this.http.get<PaginatedResponse<User>>(`${this.API_URL}/users`, { params: new HttpParams().set('size', '0') })
      .subscribe(response => {
        this._stats.update(s => ({ ...s, totalUsers: response.totalElements }));
      });

    // Cargar campañas
    this.http.get<PaginatedResponse<Campaign>>(`${this.API_URL}/campaigns`, { params: new HttpParams().set('size', '0') })
      .subscribe(response => {
        this._stats.update(s => ({ ...s, totalCampaigns: response.totalElements }));
      });

    // Cargar listas de contactos
    this.http.get<PaginatedResponse<ContactList>>(`${this.API_URL}/contacts/lists`, { params: new HttpParams().set('size', '0') })
      .subscribe(response => {
        this._stats.update(s => ({ ...s, totalContactLists: response.totalElements }));
      });
  }

  // Cargar stats de emails (entregados, rebotes, quejas, rechazos)
  loadEmailStats() {
    // Endpoint para cargar estadísticas de emails
    // TODO: Descomentar cuando el endpoint esté listo
    // this.http.get<{totalDelivered: number, totalBounces: number, totalComplaints: number, totalRejects: number}>(`${this.API_URL}/email-stats`)
    //   .subscribe(response => {
    //     this._stats.update(s => ({ 
    //       ...s, 
    //       totalDelivered: response.totalDelivered,
    //       totalBounces: response.totalBounces,
    //       totalComplaints: response.totalComplaints,
    //       totalRejects: response.totalRejects
    //     }));
    //   });
  }
}
