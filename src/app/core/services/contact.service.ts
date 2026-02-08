import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContactList, Contact, NewContactListRequest, NewContactRequest, UpdateContactRequest, UpdateContactListRequest } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly API_URL = '/api/contacts';
  
  private _contactLists = signal<ContactList[]>([]);
  private _loading = signal(false);
  private _contacts = signal<Contact[]>([]);
  
  readonly contactLists = computed(() => this._contactLists());
  readonly loading = computed(() => this._loading());
  readonly contacts = computed(() => this._contacts());

  constructor(private http: HttpClient) {}

  loadUserContactLists(userId: string) {
    this._loading.set(true);
    this.http.get<ContactList[]>(`${this.API_URL}/list/user/${userId}`)
      .subscribe({
        next: (lists) => {
          this._contactLists.set(lists);
          this._loading.set(false);
        },
        error: () => this._loading.set(false)
      });
  }

  getContactList(id: string) {
    return this.http.get<ContactList>(`${this.API_URL}/${id}/list`);
  }

  getContactsFromList(listId: string) {
    this._loading.set(true);
    this.http.get<Contact[]>(`${this.API_URL}/list/${listId}/contacts`)
      .subscribe({
        next: (contacts) => {
          console.log('ContactService: Contactos recibidos del backend:', contacts);
          // Verify each contact has an ID
          contacts.forEach((c, i) => {
            if (!c.id) {
              console.warn(`ContactService: Contacto ${i} sin ID:`, c);
            }
          });
          this._contacts.set(contacts);
          this._loading.set(false);
        },
        error: (err) => {
          console.error('ContactService: Error cargando contactos:', err);
          this._loading.set(false);
        }
      });
  }

  createContactList(request: NewContactListRequest) {
    return this.http.post<ContactList>(`${this.API_URL}/new/list`, request);
  }

  updateContactList(id: string, request: UpdateContactListRequest) {
    return this.http.put<ContactList>(`${this.API_URL}/${id}/list/update`, request);
  }

  deleteContactList(id: string) {
    return this.http.delete(`${this.API_URL}/${id}/list/delete`);
  }

  createContact(request: NewContactRequest) {
    return this.http.post<Contact>(`${this.API_URL}/new`, request);
  }

  updateContact(id: string, request: UpdateContactRequest) {
    return this.http.put<Contact>(`${this.API_URL}/${id}/update`, request);
  }

  deleteContact(id: string) {
    return this.http.delete(`${this.API_URL}/${id}/delete`);
  }

  // Add new list to signal after creation
  addContactListToSignal(newList: ContactList) {
    this._contactLists.update(lists => [...lists, newList]);
  }

  // Update list in signal
  updateContactListInSignal(updatedList: ContactList) {
    this._contactLists.update(lists => 
      lists.map(l => l.id === updatedList.id ? updatedList : l)
    );
  }

  // Remove list from signal
  removeContactListFromSignal(listId: string) {
    this._contactLists.update(lists => 
      lists.filter(l => l.id !== listId)
    );
  }

  // Add contact to signal
  addContactToSignal(newContact: Contact) {
    this._contacts.update(contacts => [...contacts, newContact]);
    // Update contact count in list
    this._contactLists.update(lists => 
      lists.map(l => 
        l.id === newContact.listId 
          ? { ...l, contactCount: l.contactCount + 1 } 
          : l
      )
    );
  }

  // Update contact in signal
  updateContactInSignal(updatedContact: Contact) {
    this._contacts.update(contacts => 
      contacts.map(c => c.id === updatedContact.id ? updatedContact : c)
    );
  }

  // Remove contact from signal
  removeContactFromSignal(contactId: string, listId: string) {
    this._contacts.update(contacts => 
      contacts.filter(c => c.id !== contactId)
    );
    // Update contact count in list
    this._contactLists.update(lists => 
      lists.map(l => 
        l.id === listId 
          ? { ...l, contactCount: Math.max(0, l.contactCount - 1) } 
          : l
      )
    );
  }

  clearContacts() {
    this._contacts.set([]);
  }
}