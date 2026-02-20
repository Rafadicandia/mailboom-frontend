import { Component, Output, EventEmitter, signal, effect, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../../core/services/contact.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ContactList, Contact } from '../../../../core/models/contact.model';

@Component({
  selector: 'app-audience-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h3 class="text-base font-semibold text-notion-text mb-1">Seleccionar Audiencia</h3>
        <p class="text-sm text-notion-text-secondary">Elige la lista de destinatarios para tu campaña</p>
      </div>

      <!-- Lista de audiencias existentes -->
      @if (contactService.contactLists().length > 0) {
        <div class="space-y-3">
          <label class="block text-sm font-medium text-notion-text">Tus listas de contactos</label>
          @for (list of contactService.contactLists(); track list.id) {
            <label class="flex items-center p-4 border border-notion-border rounded-notion cursor-pointer hover:bg-notion-bg-hover hover:border-notion-text transition-colors"
                   [class.bg-notion-bg-hover]="selectedListId() === list.id"
                   [class.border-notion-text]="selectedListId() === list.id">
              <input type="radio" 
                     name="audience" 
                     [value]="list.id" 
                     [(ngModel)]="selectedListIdVal"
                     (ngModelChange)="onSelectList($event)"
                     class="w-4 h-4 text-notion-text">
              <div class="ml-3 flex-1">
                <p class="font-medium text-notion-text">{{ list.name }}</p>
                <p class="text-sm text-notion-text-secondary">{{ getContactCount(list) }} contactos</p>
              </div>
              @if (getContactCount(list) === 0) {
                <span class="text-xs text-notion-orange bg-notion-yellow bg-opacity-15 px-2 py-1 rounded">Vacía</span>
              }
            </label>
          }
        </div>
      }

      <!-- Crear nueva lista -->
      <div class="border-t border-notion-border pt-6">
        <button (click)="toggleCreateNew()" 
                class="flex items-center gap-2 text-notion-blue hover:text-notion-blue hover:underline font-medium text-sm">
          @if (!showCreateForm()) {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Crear nueva lista de contactos
          } @else {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Cancelar
          }
        </button>

        @if (showCreateForm()) {
          <div class="mt-4 p-4 bg-notion-bg-secondary rounded-notion border border-notion-border">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-notion-text mb-1">Nombre de la lista</label>
                <input type="text" 
                       [(ngModel)]="newListName"
                       class="w-full px-3 py-2 border border-notion-border rounded-notion focus:ring-2 focus:ring-notion-blue focus:border-notion-blue"
                       placeholder="Ej: Newsletter Febrero 2025">
              </div>
              
              <div class="flex gap-3">
                <button (click)="createList()" 
                        [disabled]="!newListName.trim() || isCreating()"
                        class="px-4 py-2 bg-notion-text text-white rounded-notion hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium">
                  @if (isCreating()) {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Crear Lista
                  }
                </button>
              </div>

              @if (createError()) {
                <p class="text-notion-red text-sm">{{ createError() }}</p>
              }
            </div>
          </div>
        }
      </div>

      <!-- Sin listas -->
      @if (contactService.contactLists().length === 0 && !contactService.loading()) {
        <div class="bg-notion-yellow bg-opacity-10 border border-notion-yellow border-opacity-20 rounded-notion p-4 text-center">
          <p class="text-notion-text mb-3">No tienes ninguna lista de contactos aún.</p>
          <button (click)="toggleCreateNew()" 
                  class="px-4 py-2 bg-notion-text text-white rounded-notion hover:bg-opacity-90 text-sm font-medium">
            Crear tu primera lista
          </button>
        </div>
      }

      <!-- Cargando -->
      @if (contactService.loading()) {
        <div class="text-center py-8">
          <svg class="w-8 h-8 animate-spin mx-auto text-notion-text-secondary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-notion-text-secondary">Cargando tus listas...</p>
        </div>
      }

      <!-- Información de la selección -->
      @if (selectedListId()) {
        <div class="bg-notion-green bg-opacity-10 border border-notion-green border-opacity-20 rounded-notion p-4">
          <p class="text-notion-text flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Audiencia seleccionada
          </p>
        </div>

        <!-- Ver integrantes de la lista seleccionada -->
        <div class="border-t border-notion-border pt-6">
          <button (click)="toggleShowContacts()" 
                  class="flex items-center gap-2 text-notion-blue hover:text-notion-blue hover:underline font-medium text-sm">
            @if (!showContacts()) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Ver integrantes de la lista
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Ocultar integrantes
            }
          </button>

          @if (showContacts()) {
            <div class="mt-4 p-4 bg-notion-bg-secondary rounded-notion border border-notion-border">
              @if (isLoadingContacts()) {
                <div class="text-center py-4">
                  <svg class="w-6 h-6 animate-spin mx-auto text-notion-text-secondary" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="mt-2 text-sm text-notion-text-secondary">Cargando contactos...</p>
                </div>
              } @else if (selectedListContacts().length === 0) {
                <p class="text-notion-text-tertiary text-center py-4">No hay contactos en esta lista</p>
              } @else {
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  @for (contact of selectedListContacts(); track contact.id || contact.contactId) {
                    <div class="flex items-center justify-between p-2 bg-white rounded-notion border border-notion-border">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-notion-text truncate">
                          {{ contact.name || 'Sin nombre' }}
                        </p>
                        <p class="text-xs text-notion-text-tertiary truncate">{{ contact.email }}</p>
                      </div>
                      @if (contact.subscribed !== undefined) {
                        <span class="ml-2 text-xs px-2 py-1 rounded" 
                              [class.bg-notion-green]="contact.subscribed"
                              [class.bg-opacity-15]="contact.subscribed"
                              [class.text-notion-green]="contact.subscribed"
                              [class.bg-notion-red]="!contact.subscribed"
                              [class.bg-opacity-15]="!contact.subscribed"
                              [class.text-notion-red]="!contact.subscribed">
                          {{ contact.subscribed ? 'Activo' : 'Inactivo' }}
                        </span>
                      }
                    </div>
                  }
                </div>
                @if (selectedListContacts().length > 0) {
                  <p class="text-xs text-notion-text-tertiary mt-2 text-center">
                    Mostrando {{ selectedListContacts().length }} contacto(s)
                  </p>
                }
              }
            </div>
          }
        </div>
      }

      <!-- Botones -->
      <div class="flex justify-between pt-4">
        <button type="button" (click)="onBack.emit()" 
                class="px-5 py-2 border border-notion-border text-notion-text rounded-notion hover:bg-notion-bg-hover text-sm font-medium">
          ← Anterior
        </button>
        <button type="button" (click)="continue()" 
                [disabled]="!selectedListId() || isCreating()"
                class="px-5 py-2 bg-notion-text text-white rounded-notion hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
          Siguiente: Revisión →
        </button>
      </div>
    </div>
  `
})
export class AudienceStepComponent implements OnInit {
  @Output() onNext = new EventEmitter<string>();
  @Output() onBack = new EventEmitter<void>();
  @Output() onListSelected = new EventEmitter<string>();
  @Input() preSelectedListId: string | null = null;

  contactLists = signal<ContactList[]>([]);
  selectedListId = signal<string>('');
  selectedListIdVal = '';
  showCreateForm = signal(false);
  newListName = '';
  isLoading = signal(false);
  isCreating = signal(false);
  createError = signal('');
  
  // Señales para mostrar contactos de la lista seleccionada
  selectedListContacts = signal<Contact[]>([]);
  showContacts = signal(false);
  isLoadingContacts = signal(false);

  constructor(
    public contactService: ContactService,
    private authService: AuthService
  ) {
    // Setup effect to sync selectedListId with selectedListIdVal
    effect(() => {
      const listId = this.selectedListId();
      if (listId !== this.selectedListIdVal) {
        this.selectedListIdVal = listId;
      }
    });
  }

  ngOnInit() {
    console.log('AudienceStepComponent inicializado');
    console.log('Current user:', this.authService.currentUser());
    console.log('Pre-selected list id:', this.preSelectedListId);
    
    this.loadContactLists();
    
    // If there's a pre-selected list, try to select it after loading
    if (this.preSelectedListId) {
      setTimeout(() => {
        this.selectPreSelectedList();
      }, 500);
    }
  }

  selectPreSelectedList() {
    // First try with already loaded lists
    let lists = this.contactService.contactLists();
    const preSelected = lists.find(l => l.id === this.preSelectedListId);
    
    if (preSelected) {
      console.log('Pre-selected list found:', preSelected.name);
      this.selectedListId.set(preSelected.id);
      this.selectedListIdVal = preSelected.id;
      this.onListSelected.emit(preSelected.id);
      return;
    }
    
    // If lists not loaded yet, wait and try again
    if (lists.length === 0) {
      const userId = this.authService.currentUser()?.id;
      if (userId) {
        this.contactService.loadUserContactLists(userId);
        setTimeout(() => {
          lists = this.contactService.contactLists();
          const list = lists.find(l => l.id === this.preSelectedListId);
          if (list) {
            console.log('Pre-selected list found after load:', list.name);
            this.selectedListId.set(list.id);
            this.selectedListIdVal = list.id;
            this.onListSelected.emit(list.id);
          }
        }, 500);
      }
    }
  }

  loadContactLists() {
    const userId = this.authService.currentUser()?.id;
    console.log('User ID para cargar listas:', userId);
    if (!userId) {
      console.warn('No hay usuario logueado');
      return;
    }

    console.log('Cargando listas para usuario:', userId);
    this.contactService.loadUserContactLists(userId);
    
    // Auto-select first list after a short delay to allow HTTP response
    setTimeout(() => {
      const lists = this.contactService.contactLists();
      if (lists.length > 0 && !this.selectedListId()) {
        console.log('Auto-seleccionando primera lista:', lists[0].id);
        this.selectedListId.set(lists[0].id);
        this.selectedListIdVal = lists[0].id;
        this.onListSelected.emit(lists[0].id);
      }
    }, 300);
  }

  onSelectList(listId: string) {
    this.selectedListId.set(listId);
    this.onListSelected.emit(listId);
    // Resetear estado de mostrar contactos
    this.showContacts.set(false);
    this.selectedListContacts.set([]);
  }

  toggleShowContacts() {
    const currentShow = this.showContacts();
    this.showContacts.set(!currentShow);
    
    // Si vamos a mostrar y no hay contactos cargados, cargarlos
    if (!currentShow && this.selectedListContacts().length === 0 && this.selectedListId()) {
      this.loadSelectedListContacts();
    }
  }

  loadSelectedListContacts() {
    const listId = this.selectedListId();
    if (!listId) return;
    
    this.isLoadingContacts.set(true);
    this.contactService.getContactsFromList(listId);
    
    // Escuchar cambios en los contactos del servicio
    setTimeout(() => {
      const contacts = this.contactService.contacts();
      this.selectedListContacts.set(contacts);
      this.isLoadingContacts.set(false);
    }, 500);
  }

  toggleCreateNew() {
    this.showCreateForm.set(!this.showCreateForm());
    this.createError.set('');
    this.newListName = '';
  }

  createList() {
    const userId = this.authService.currentUser()?.id;
    if (!userId || !this.newListName.trim()) {
      this.createError.set('Por favor ingresa un nombre para la lista');
      return;
    }

    this.isCreating.set(true);
    this.createError.set('');

    console.log('Creando lista con ownerId:', userId);
    
    this.contactService.createContactList({
      name: this.newListName.trim(),
      ownerId: userId
    }).subscribe({
      next: (newList) => {
        console.log('Lista creada exitosamente:', newList);
        // Add to service signal
        this.contactService.addContactListToSignal(newList);
        // Update local signal
        this.contactLists.update(lists => [...lists, newList]);
        this.selectedListId.set(newList.id);
        this.selectedListIdVal = newList.id;
        this.showCreateForm.set(false);
        this.newListName = '';
        this.isCreating.set(false);
        this.onListSelected.emit(newList.id);
      },
      error: (err) => {
        console.error('Error creando lista:', err);
        this.createError.set(err.error?.message || err.message || 'Error al crear la lista');
        this.isCreating.set(false);
      }
    });
  }

  continue() {
    const listId = this.selectedListId();
    if (listId) {
      this.onNext.emit(listId);
    }
  }

  getContactCount(list: ContactList): number {
    // Mostrar el número real de contactos
    // Si totalContacts viene del backend, usarlo directamente
    // Si no, intentar contar desde los contactos cargados
    if (list.totalContacts !== undefined && list.totalContacts > 0) {
      return list.totalContacts;
    }
    // Fallback: contar desde los contactos cargados
    const count = this.contactService.contactsCountByList()[list.id];
    return count || 0;
  }
}
