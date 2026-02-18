import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService, PaginatedResponse } from '../../../core/services/admin.service';
import { Contact } from '../../../core/models/contact.model';

@Component({
  selector: 'app-list-contacts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button (click)="goBack()" class="p-2 hover:bg-gray-100 rounded-lg">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Contactos de la Lista</h1>
            <p class="text-gray-600">{{ listName() }}</p>
          </div>
        </div>
        <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          Administrador
        </span>
      </div>

      <!-- Stats -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Contactos</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ totalContacts() }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Contacts Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Lista de Contactos</h3>
            <button (click)="loadContacts()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
              Actualizar
            </button>
          </div>
          
          @if (loading()) {
            <div class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          } @else {
            @if (contacts().length === 0) {
              <div class="text-center py-8 text-gray-500">
                No hay contactos en esta lista
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Nombre</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (contact of contacts(); track contact.id) {
                      <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 px-4 text-sm text-gray-900">{{ contact.name || 'N/A' }}</td>
                        <td class="py-3 px-4 text-sm text-gray-600">{{ contact.email }}</td>
                        <td class="py-3 px-4 text-sm">
                          <span class="px-2 py-1 rounded text-xs font-medium"
                                [class.bg-green-100]="contact.subscribed"
                                [class.text-green-800]="contact.subscribed"
                                [class.bg-red-100]="!contact.subscribed"
                                [class.text-red-800]="!contact.subscribed">
                            {{ contact.subscribed ? 'Suscrito' : 'No Suscrito' }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              @if (totalPages() > 1) {
                <div class="flex justify-center items-center gap-2 mt-4">
                  <button 
                    (click)="changePage(currentPage() - 1)" 
                    [disabled]="currentPage() === 0"
                    class="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                  </button>
                  <span class="text-sm text-gray-600">
                    Página {{ currentPage() + 1 }} de {{ totalPages() }}
                  </span>
                  <button 
                    (click)="changePage(currentPage() + 1)" 
                    [disabled]="currentPage() >= totalPages() - 1"
                    class="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
                  </button>
                </div>
              }
            }
          }
        </div>
      </div>
    </div>
  `
})
export class ListContactsComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals
  loading = signal(false);
  contacts = signal<Contact[]>([]);
  listName = signal('');
  totalContacts = signal(0);
  currentPage = signal(0);
  totalPages = signal(0);
  private listId = '';

  pageSize = 10;

  ngOnInit() {
    this.listId = this.route.snapshot.paramMap.get('id') || '';
    if (this.listId) {
      this.loadListInfo();
    }
  }

  loadListInfo() {
    this.adminService.getContactListById(this.listId).subscribe({
      next: (list) => {
        this.listName.set(list.name);
        if (list.totalContacts > 0) {
          this.totalContacts.set(list.totalContacts);
        }
      }
    });
    this.loadContacts();
  }

  loadContacts() {
    this.loading.set(true);
    this.adminService.getContactsFromList(this.listId, this.currentPage(), this.pageSize).subscribe({
      next: (response: PaginatedResponse<Contact>) => {
        this.contacts.set(response.content);
        this.totalPages.set(response.totalPages);
        // Only update total if we don't have it yet or if it's 0
        if (this.totalContacts() === 0 && response.totalElements > 0) {
          this.totalContacts.set(response.totalElements);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadContacts();
    }
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
