import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { AuthService } from '../../core/services/auth.service';
import { ContactList, Contact, getContactId } from '../../core/models/contact.model';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Audiencias</h2>
          <p class="text-gray-600">Gestiona tus listas de contactos</p>
        </div>
        <button (click)="openCreateListModal()"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nueva Lista
        </button>
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <svg class="w-8 h-8 animate-spin mx-auto text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-gray-600">Cargando audiencias...</p>
        </div>
      } @else if (contactLists().length === 0) {
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <h3 class="text-lg font-semibold text-yellow-800 mb-2">No tienes audiencias aún</h3>
          <p class="text-yellow-700 mb-4">Crea tu primera lista de contactos para comenzar a enviar campañas</p>
          <button (click)="openCreateListModal()"
                  class="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
            Crear mi primera audiencia
          </button>
        </div>
      } @else {
        <!-- Lista de audiencias -->
        <div class="space-y-4">
          @for (list of contactLists(); track list.id) {
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <!-- Header de la lista -->
              <div class="p-4 bg-gray-50 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ list.name }}</h3>
                    <p class="text-sm text-gray-500">{{ list.contactCount }} contactos</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button (click)="toggleContacts(list)"
                          class="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium">
                    {{ expandedListId() === list.id ? 'Ocultar' : 'Ver contactos' }}
                  </button>
                  <a routerLink="/campaigns/new" [queryParams]="{listId: list.id}"
                     class="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                    Crear campaña
                  </a>
                  <button (click)="editList(list)"
                          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          title="Editar lista">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button (click)="deleteList(list)"
                          class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Eliminar lista">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Contactos de la lista (si está expandida) -->
              @if (expandedListId() === list.id) {
                <div class="border-t border-gray-200 p-4">
                  <!-- Buscador y agregar contacto -->
                  <div class="flex flex-col sm:flex-row gap-4 mb-4">
                    <div class="relative flex-1">
                      <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                      <input type="text" 
                             [(ngModel)]="searchTerm"
                             (ngModelChange)="filterContacts()"
                             placeholder="Buscar contactos..."
                             class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <button (click)="openAddContactModal(list.id)"
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      Agregar Contacto
                    </button>
                  </div>

                  <!-- Lista de contactos -->
                  @if (isLoadingContacts()) {
                    <div class="text-center py-8">
                      <svg class="w-6 h-6 animate-spin mx-auto text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  } @else if (filteredContacts().length === 0) {
                    <div class="text-center py-8 text-gray-500">
                      @if (contacts().length === 0) {
                        <p>No hay contactos en esta lista</p>
                        <button (click)="openAddContactModal(list.id)" class="text-indigo-600 hover:text-indigo-700 mt-2">
                          Agregar el primer contacto
                        </button>
                      } @else {
                        <p>No se encontraron resultados para "{{ searchTerm }}"</p>
                      }
                    </div>
                  } @else {
                    <div class="overflow-x-auto">
                      <table class="w-full">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                          @for (contact of filteredContacts(); track $index) {
                            <tr class="hover:bg-gray-50">
                              <td class="px-4 py-3 text-sm text-gray-900">{{ contact.email }}</td>
                              <td class="px-4 py-3 text-sm text-gray-900">{{ contact.name || '-' }}</td>
                              <td class="px-4 py-3 text-sm">
                                @if (contact.subscribed) {
                                  <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Suscrito</span>
                                } @else {
                                  <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">No suscrito</span>
                                }
                              </td>
                              <td class="px-4 py-3 text-sm text-right">
                                <div class="flex justify-end gap-2">
                                  <button (click)="editContact(contact)"
                                          class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                          title="Editar">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                  </button>
                                  <button (click)="deleteContact(contact)"
                                          class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                          title="Eliminar">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Modal Crear/Editar Lista -->
      @if (showListModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 class="text-lg font-semibold mb-4">{{ isEditingList() ? 'Editar Lista' : 'Nueva Lista' }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la lista</label>
                <input type="text" [(ngModel)]="listName"
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                       placeholder="Ej: Newsletter Febrero 2025">
              </div>
              @if (listError()) {
                <p class="text-red-600 text-sm">{{ listError() }}</p>
              }
              <div class="flex justify-end gap-3">
                <button (click)="closeListModal()"
                        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button (click)="saveList()"
                        [disabled]="!listName.trim() || isSavingList()"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300">
                  {{ isSavingList() ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Modal Crear/Editar Contacto -->
      @if (showContactModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 class="text-lg font-semibold mb-4">{{ isEditingContact() ? 'Editar Contacto' : 'Nuevo Contacto' }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
                <input type="email" [(ngModel)]="contactEmail"
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                       placeholder="correo@ejemplo.com">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" [(ngModel)]="contactName"
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                       placeholder="Nombre opcional">
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="contactSubscribed" 
                       id="subscribed" class="w-4 h-4 text-indigo-600 rounded">
                <label for="subscribed" class="text-sm text-gray-700">Suscrito</label>
              </div>
              @if (contactError()) {
                <p class="text-red-600 text-sm">{{ contactError() }}</p>
              }
              <div class="flex justify-end gap-3">
                <button (click)="closeContactModal()"
                        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button (click)="saveContact()"
                        [disabled]="!contactEmail.trim() || isSavingContact()"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300">
                  {{ isSavingContact() ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ContactListComponent implements OnInit {
  private contactService = inject(ContactService);
  private authService = inject(AuthService);

  contactLists = this.contactService.contactLists;
  contacts = this.contactService.contacts;
  isLoading = this.contactService.loading;

  // UI State
  expandedListId = signal<string | null>(null);
  showListModal = signal(false);
  showContactModal = signal(false);
  isEditingList = signal(false);
  isEditingContact = signal(false);
  isSavingList = signal(false);
  isSavingContact = signal(false);
  isLoadingContacts = signal(false);
  listError = signal('');
  contactError = signal('');
  searchTerm = '';
  filteredContacts = signal<Contact[]>([]);

  // Form data
  editingListId = '';
  listName = '';
  editingContactId = '';
  currentListId = '';
  contactEmail = '';
  contactName = '';
  contactSubscribed = true;

  ngOnInit() {
    this.loadContactLists();
  }

  loadContactLists() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.contactService.loadUserContactLists(userId);
    }
  }

  toggleContacts(list: ContactList) {
    this.expandedListId.update(current => current === list.id ? null : list.id);
    if (this.expandedListId() === list.id) {
      this.loadContacts(list.id);
    } else {
      this.contactService.clearContacts();
    }
  }

  loadContacts(listId: string) {
    this.isLoadingContacts.set(true);
    this.contactService.getContactsFromList(listId);
    setTimeout(() => {
      this.filterContacts();
      this.isLoadingContacts.set(false);
    }, 300);
  }

  filterContacts() {
    const allContacts = this.contacts();
    if (!this.searchTerm.trim()) {
      this.filteredContacts.set(allContacts);
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredContacts.set(allContacts.filter(c => 
        c.email.toLowerCase().includes(term) || 
        (c.name && c.name.toLowerCase().includes(term))
      ));
    }
  }

  // List operations
  openCreateListModal() {
    this.isEditingList.set(false);
    this.listName = '';
    this.listError.set('');
    this.showListModal.set(true);
  }

  editList(list: ContactList) {
    this.isEditingList.set(true);
    this.editingListId = list.id;
    this.listName = list.name;
    this.listError.set('');
    this.showListModal.set(true);
  }

  saveList() {
    const userId = this.authService.currentUser()?.id;
    if (!userId || !this.listName.trim()) return;

    this.isSavingList.set(true);
    this.listError.set('');

    if (this.isEditingList()) {
      // Update existing list
      this.contactService.updateContactList(this.editingListId, { name: this.listName, ownerId: userId }).subscribe({
        next: (updatedList) => {
          this.contactService.updateContactListInSignal(updatedList);
          this.closeListModal();
        },
        error: (err: any) => {
          this.listError.set(err.error?.message || 'Error al actualizar');
          this.isSavingList.set(false);
        }
      });
    } else {
      // Create new list
      this.contactService.createContactList({ name: this.listName.trim(), ownerId: userId }).subscribe({
        next: (newList) => {
          this.contactService.addContactListToSignal(newList);
          this.closeListModal();
        },
        error: (err: any) => {
          this.listError.set(err.error?.message || 'Error al crear');
          this.isSavingList.set(false);
        }
      });
    }
  }

  deleteList(list: ContactList) {
    if (!confirm(`¿Estás seguro de eliminar "${list.name}"? Se eliminarán todos sus contactos.`)) return;
    
    this.contactService.deleteContactList(list.id).subscribe({
      next: () => {
        this.contactService.removeContactListFromSignal(list.id);
      },
      error: (err: any) => alert(err.error?.message || 'Error al eliminar')
    });
  }

  closeListModal() {
    this.showListModal.set(false);
    this.isEditingList.set(false);
    this.listName = '';
    this.listError.set('');
    this.isSavingList.set(false);
  }

  // Contact operations
  openAddContactModal(listId: string) {
    this.isEditingContact.set(false);
    this.currentListId = listId;
    this.contactEmail = '';
    this.contactName = '';
    this.contactSubscribed = true;
    this.contactError.set('');
    this.showContactModal.set(true);
  }

  editContact(contact: Contact) {
    this.isEditingContact.set(true);
    this.editingContactId = getContactId(contact);
    this.currentListId = contact.listId;
    this.contactEmail = contact.email;
    this.contactName = contact.name || '';
    this.contactSubscribed = contact.subscribed;
    this.contactError.set('');
    this.showContactModal.set(true);
  }

  saveContact() {
    if (!this.contactEmail.trim()) return;

    this.isSavingContact.set(true);
    this.contactError.set('');

    if (this.isEditingContact()) {
      // Update existing contact
      this.contactService.updateContact(this.editingContactId, { 
        email: this.contactEmail, 
        name: this.contactName || undefined,
        subscribed: this.contactSubscribed 
      }).subscribe({
        next: (updatedContact) => {
          updatedContact.listId = this.currentListId;
          this.contactService.updateContactInSignal(updatedContact);
          this.closeContactModal();
        },
        error: (err: any) => {
          this.contactError.set(err.error?.message || 'Error al actualizar');
          this.isSavingContact.set(false);
        }
      });
    } else {
      // Create new contact
      this.contactService.createContact({
        contactListId: this.currentListId,
        email: this.contactEmail,
        name: this.contactName || undefined,
        subscribed: this.contactSubscribed
      }).subscribe({
        next: (newContact) => {
          newContact.listId = this.currentListId;
          this.contactService.addContactToSignal(newContact);
          this.filterContacts();
          this.closeContactModal();
        },
        error: (err: any) => {
          this.contactError.set(err.error?.message || 'Error al crear');
          this.isSavingContact.set(false);
        }
      });
    }
  }

  deleteContact(contact: Contact) {
    const contactId = getContactId(contact);
    
    if (!contactId) {
      console.error('Error: Contacto sin ID válido', contact);
      alert('Error: No se puede eliminar el contacto (ID no válido)');
      return;
    }
    
    if (!confirm(`¿Estás seguro de eliminar "${contact.email}"?`)) return;
    
    console.log('Eliminando contacto con ID:', contactId);
    this.contactService.deleteContact(contactId).subscribe({
      next: () => {
        console.log('Contacto eliminado exitosamente');
        this.contactService.removeContactFromSignal(contactId, contact.listId);
        this.filterContacts();
      },
      error: (err: any) => {
        console.error('Error eliminando contacto:', err);
        alert(err.error?.message || 'Error al eliminar')
      }
    });
  }

  closeContactModal() {
    this.showContactModal.set(false);
    this.isEditingContact.set(false);
    this.contactEmail = '';
    this.contactName = '';
    this.contactSubscribed = true;
    this.contactError.set('');
    this.isSavingContact.set(false);
  }
}
