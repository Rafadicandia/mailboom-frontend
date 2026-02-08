import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContactList, ContactListDataResponse, NewContactListRequest } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly API_URL = '/api/contacts';
  
  private _contactLists = signal<ContactList[]>([]);
  private _loading = signal(false);
  
  readonly contactLists = computed(() => this._contactLists());
  readonly loading = computed(() => this._loading());

  constructor(private http: HttpClient) {}

  loadUserContactLists(userId: string) {
    this._loading.set(true);
    this.http.get<ContactListDataResponse[]>(`${this.API_URL}/list/user/${userId}`)
      .subscribe({
        next: (lists) => {
          this._contactLists.set(lists);
          this._loading.set(false);
        },
        error: () => this._loading.set(false)
      });
  }

  createContactList(request: NewContactListRequest) {
    return this.http.post<ContactList>(`${this.API_URL}/new/list`, request);
  }

  deleteContactList(id: string) {
    return this.http.delete(`${this.API_URL}/${id}/list/delete`);
  }
}