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
  
  // Información de paginación
  private _currentPage = signal(0);
  private _pageSize = signal(10);
  private _totalElements = signal(0);
  private _totalPages = signal(0);
  
  readonly contactLists = computed(() => this._contactLists());
  readonly loading = computed(() => this._loading());
  readonly contacts = computed(() => this._contacts());
  
  // Getters para paginación
  readonly currentPage = computed(() => this._currentPage());
  readonly pageSize = computed(() => this._pageSize());
  readonly totalElements = computed(() => this._totalElements());
  readonly totalPages = computed(() => this._totalPages());
  
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

  loadUserContactLists(userId: string, page: number = 0, size: number = 10) {
    this._loading.set(true);
    console.log('👥 ContactService - loadUserContactLists - userId:', userId, 'page:', page, 'size:', size);
    this.http.get<any>(`${this.API_URL}/list/user/${userId}`, {
      params: { page: page.toString(), size: size.toString() }
    })
      .subscribe({
        next: (response) => {
          console.log('👥 ContactService - loadUserContactLists - response:', response);
          // El backend devuelve un Page, los datos están en content
          const lists = response.content || response;
          console.log('👥 ContactService - listas raw:', JSON.stringify(lists));
          // Asegurar que cada lista tenga totalContacts definido
          const processedLists = lists.map((list: any) => {
            console.log('👥 ContactService - lista individual:', list);
            return {
              ...list,
              totalContacts: list.totalContacts || 0
            };
          });
          this._contactLists.set(processedLists);
          // Guardar información de paginación
          this._currentPage.set(response.number || page);
          this._pageSize.set(response.size || size);
          this._totalElements.set(response.totalElements || lists.length);
          this._totalPages.set(response.totalPages || 1);
          this._loading.set(false);
        },
        error: (err) => {
          console.error('👥 ContactService - loadUserContactLists - error:', err);
          this._loading.set(false);
        }
      });
  }

  getContactList(id: string) {
    return this.http.get<ContactList>(`${this.API_URL}/${id}/list`);
  }

  getContactsFromList(listId: string) {
    this._loading.set(true);
    console.log('👥 ContactService - getContactsFromList - listId:', listId);
    this.http.get<any>(`${this.API_URL}/list/${listId}/contacts`)
      .subscribe({
        next: (response) => {
          console.log('👥 ContactService - getContactsFromList - response:', response);
          // El backend devuelve un Page, los datos están en content
          const contacts = response.content || response;
          console.log('👥 ContactService - Contactos recibidos:', contacts);
          // Verify each contact has an ID (either 'id' or 'contactId')
          contacts.forEach((c: any, i: number) => {
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

  updateContact(id: string, listId: string, request: UpdateContactRequest) {
    return this.http.put<Contact>(`${this.API_URL}/${id}/update`, {
      contactId: id,
      contactListId: listId,
      email: request.email,
      name: request.name,
      customFields: request.customFields,
      subscribed: request.subscribed
    });
  }

  deleteContact(id: string) {
    return this.http.delete(`${this.API_URL}/${id}/delete`);
  }

  // Add new list to signal after creation
  addContactListToSignal(newList: ContactList) {
    this._contactLists.update(lists => [...lists, { ...newList, totalContacts: newList.totalContacts || 0 }]);
  }

  // Update list in signal
  updateContactListInSignal(updatedList: ContactList) {
    this._contactLists.update(lists => 
      lists.map(l => l.id === updatedList.id ? { ...updatedList, totalContacts: updatedList.totalContacts || 0 } : l)
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

  // Add multiple contacts to signal (for batch import)
  addContactsToSignal(newContacts: Contact[]) {
    this._contacts.update(contacts => [...contacts, ...newContacts]);
    // Update contact counts by list
    const countByList: Record<string, number> = {};
    newContacts.forEach(c => {
      countByList[c.listId] = (countByList[c.listId] || 0) + 1;
    });
    this._contactLists.update(lists => 
      lists.map(l => 
        countByList[l.id] 
          ? { ...l, totalContacts: l.totalContacts + countByList[l.id] } 
          : l
      )
    );
  }

  // Update contact in signal
  updateContactInSignal(updatedContact: Contact) {
    const updatedId = updatedContact.id || updatedContact.contactId;
    this._contacts.update(contacts => 
      contacts.map(c => {
        const contactId = c.id || c.contactId;
        return contactId === updatedId ? updatedContact : c;
      })
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
