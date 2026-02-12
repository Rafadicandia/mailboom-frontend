import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContactList, Contact, NewContactListRequest, NewContactRequest, UpdateContactRequest, UpdateContactListRequest, getContactId } from '../models/contact.model';

// Helper function to check if contact matches ID (handles both 'id' and 'contactId')
function contactMatchesId(contact: Contact, contactId: string): boolean {
  return getContactId(contact) === contactId;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly API_URL = '/api/contacts';
  
  private _contactLists = signal<ContactList[]>([]);
  private _loading = signal(false);
  private _contacts = signal<Contact[]>([]);
  
  readonly contactLists = computed(() => this._contactLists());
  readonly loading = computed(() => this._loading());
  readonly contacts = computed(() => this._contacts());
  
  // Computed que cuenta contactos por lista (fallback cuando totalContacts no viene del backend)
  readonly contactsCountByList = computed(() => {
    const contacts = this._contacts();
    const countByList: Record<string, number> = {};
    contacts.forEach(c => {
      countByList[c.listId] = (countByList[c.listId] || 0) + 1;
    });
    return countByList;
  });

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
          // Verify each contact has an ID (either 'id' or 'contactId')
          contacts.forEach((c, i) => {
            const contactId = getContactId(c);
            if (!contactId) {
              console.warn(`ContactService: Contacto ${i} sin ID válido:`, c);
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
          ? { ...l, totalContacts: l.totalContacts + 1 } 
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
    console.log('ContactService.removeContactFromSignal: Eliminando contacto con ID:', contactId);
    const beforeCount = this._contacts().length;
    
    this._contacts.update(contacts => 
      contacts.filter(c => !contactMatchesId(c, contactId))
    );
    
    const afterCount = this._contacts().length;
    console.log(`ContactService: Contactos antes: ${beforeCount}, después: ${afterCount}`);
    
    // Update contact count in list
    this._contactLists.update(lists => 
      lists.map(l => 
        l.id === listId 
          ? { ...l, totalContacts: Math.max(0, l.totalContacts - 1) } 
          : l
      )
    );
  }

  clearContacts() {
    this._contacts.set([]);
  }

  // Obtener el conteo de contactos de una lista
  getContactCount(listId: string): number {
    const contacts = this._contacts().filter(c => c.listId === listId);
    return contacts.length;
  }
}