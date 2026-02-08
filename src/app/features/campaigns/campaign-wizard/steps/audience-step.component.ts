import { Component, Output, EventEmitter, signal, effect, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../../core/services/contact.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ContactList } from '../../../../core/models/contact.model';

@Component({
  selector: 'app-audience-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Seleccionar Audiencia</h3>
        <p class="text-sm text-gray-600">Elige la lista de destinatarios para tu campaña</p>
      </div>

      <!-- Lista de audiencias existentes -->
      @if (contactService.contactLists().length > 0) {
        <div class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">Tus listas de contactos</label>
          @for (list of contactService.contactLists(); track list.id) {
            <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                   [class.bg-indigo-50]="selectedListId() === list.id"
                   [class.border-indigo-500]="selectedListId() === list.id">
              <input type="radio" 
                     name="audience" 
                     [value]="list.id" 
                     [(ngModel)]="selectedListIdVal"
                     (ngModelChange)="onSelectList($event)"
                     class="w-4 h-4 text-indigo-600">
              <div class="ml-3 flex-1">
                <p class="font-medium text-gray-900">{{ list.name }}</p>
                <p class="text-sm text-gray-500">{{ list.contactCount }} contactos</p>
              </div>
              @if (list.contactCount === 0) {
                <span class="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Vacía</span>
              }
            </label>
          }
        </div>
      }

      <!-- Crear nueva lista -->
      <div class="border-t pt-6">
        <button (click)="toggleCreateNew()" 
                class="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
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
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la lista</label>
                <input type="text" 
                       [(ngModel)]="newListName"
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                       placeholder="Ej: Newsletter Febrero 2025">
              </div>
              
              <div class="flex gap-3">
                <button (click)="createList()" 
                        [disabled]="!newListName.trim() || isCreating()"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 flex items-center gap-2">
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
                <p class="text-red-600 text-sm">{{ createError() }}</p>
              }
            </div>
          </div>
        }
      </div>

      <!-- Sin listas -->
      @if (contactService.contactLists().length === 0 && !isLoading()) {
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p class="text-yellow-800 mb-3">No tienes ninguna lista de contactos aún.</p>
          <button (click)="toggleCreateNew()" 
                  class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
            Crear tu primera lista
          </button>
        </div>
      }

      <!-- Cargando -->
      @if (isLoading()) {
        <div class="text-center py-8">
          <svg class="w-8 h-8 animate-spin mx-auto text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-gray-600">Cargando tus listas...</p>
        </div>
      }

      <!-- Información de la selección -->
      @if (selectedListId()) {
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-green-800 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Audiencia seleccionada
          </p>
        </div>
      }

      <!-- Botones -->
      <div class="flex justify-between pt-4">
        <button type="button" (click)="onBack.emit()" 
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          ← Anterior
        </button>
        <button type="button" (click)="continue()" 
                [disabled]="!selectedListId() || isCreating()"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300">
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
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
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
}
