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
    <div class="max-w-5xl mx-auto py-8 px-6">
      <!-- Header estilo Notion limpio -->
      <div class="flex items-center gap-3 mb-10">
        <button (click)="goBack()" class="p-1.5 rounded-lg transition-colors hover:bg-[#F7F6F3]">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-semibold" style="color: #37352F;">Contactos de la Lista</h1>
          <p class="text-base mt-1" style="color: #787774;">{{ listName() }}</p>
        </div>
      </div>

      <!-- Stats estilo Notion sin bordes -->
      <div class="mb-10">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span class="text-sm" style="color: #787774;">Total Contactos</span>
        </div>
        <p class="text-2xl font-semibold" style="color: #37352F;">{{ totalContacts() }}</p>
      </div>

      <!-- Contacts List estilo Notion limpio -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-base font-medium" style="color: #37352F;">Lista de Contactos</h3>
          <button (click)="loadContacts()" class="text-sm hover:underline" style="color: #787774;">
            Actualizar
          </button>
        </div>
        
        @if (loading()) {
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-5 w-5" style="border: 2px solid #E9E9E7; border-top-color: #37352F;"></div>
          </div>
        } @else {
          @if (contacts().length === 0) {
            <div class="text-center py-8" style="color: #9B9A97;">
              No hay contactos en esta lista
            </div>
          } @else {
            <div class="space-y-1">
              @for (contact of contacts(); track contact.id) {
                <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white" style="background-color: #529CCA;">
                      {{ getInitials(contact.name || contact.email) }}
                    </div>
                    <div>
                      <p class="text-sm font-medium" style="color: #37352F;">{{ contact.name || 'Sin nombre' }}</p>
                      <p class="text-xs" style="color: #9B9A97;">{{ contact.email }}</p>
                    </div>
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded"
                        [style.background-color]="contact.subscribed ? 'rgba(15, 123, 108, 0.15)' : 'rgba(224, 62, 62, 0.15)'"
                        [style.color]="contact.subscribed ? '#0F7B6C' : '#E03E3E'">
                    {{ contact.subscribed ? 'Suscrito' : 'No Suscrito' }}
                  </span>
                </div>
              }
            </div>

            <!-- Pagination estilo Notion limpio -->
            @if (totalPages() > 1) {
              <div class="flex justify-center items-center gap-3 mt-6 text-sm">
                <button 
                  (click)="changePage(currentPage() - 1)" 
                  [disabled]="currentPage() === 0"
                  class="px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F6F3]"
                  style="color: #787774;">
                  ←
                </button>
                <span style="color: #9B9A97;">
                  {{ currentPage() + 1 }} / {{ totalPages() }}
                </span>
                <button 
                  (click)="changePage(currentPage() + 1)" 
                  [disabled]="currentPage() >= totalPages() - 1"
                  class="px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F6F3]"
                  style="color: #787774;">
                  →
                </button>
              </div>
            }
          }
        }
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

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

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
