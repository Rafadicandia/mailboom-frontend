import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService, AdminStats, PaginatedResponse } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.model';
import { Campaign } from '../../../core/models/campaign.model';
import { ContactList } from '../../../core/models/contact.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-6">
      <!-- Header estilo Notion limpio -->
      <div class="mb-10">
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-3xl font-semibold" style="color: #37352F;">Panel de Administración</h1>
        </div>
        <p class="text-base" style="color: #787774;">Gestiona usuarios, campañas y contactos de la plataforma</p>
      </div>

      <!-- Stats Grid estilo Notion sin bordes -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Usuarios</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #37352F;">{{ stats().totalUsers }}</p>
        </div>

        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Campañas</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #37352F;">{{ stats().totalCampaigns }}</p>
        </div>

        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Listas</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #37352F;">{{ stats().totalContactLists }}</p>
        </div>

        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Contactos</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #37352F;">{{ stats().totalContacts }}</p>
        </div>
      </div>

      <!-- Métricas de Email - Últimas 24 horas -->
      @if (metrics()) {
        <div class="mb-10">
          <h2 class="text-lg font-medium mb-4" style="color: #37352F;">Métricas de Email (últimas 24 horas)</h2>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <!-- Entregados -->
            <div class="group cursor-default">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: rgba(15, 123, 108, 0.15);">
                  <svg class="w-4 h-4" fill="none" stroke="#0F7B6C" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-sm" style="color: #787774;">Entregados</span>
              </div>
              <p class="text-2xl font-semibold" style="color: #0F7B6C;">{{ metrics()!.totalDelivered | number }}</p>
            </div>

            <!-- Rebotados -->
            <div class="group cursor-default">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: rgba(224, 62, 62, 0.15);">
                  <svg class="w-4 h-4" fill="none" stroke="#E03E3E" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span class="text-sm" style="color: #787774;">Rebotados</span>
              </div>
              <p class="text-2xl font-semibold" style="color: #E03E3E;">{{ metrics()!.totalBounces | number }}</p>
            </div>

            <!-- Quejas -->
            <div class="group cursor-default">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: rgba(223, 171, 1, 0.15);">
                  <svg class="w-4 h-4" fill="none" stroke="#DFAB01" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span class="text-sm" style="color: #787774;">Quejas</span>
              </div>
              <p class="text-2xl font-semibold" style="color: #DFAB01;">{{ metrics()!.totalComplaints | number }}</p>
            </div>

            <!-- Rechazados -->
            <div class="group cursor-default">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: rgba(155, 154, 151, 0.15);">
                  <svg class="w-4 h-4" fill="none" stroke="#9B9A97" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <span class="text-sm" style="color: #787774;">Rechazados</span>
              </div>
              <p class="text-2xl font-semibold" style="color: #9B9A97;">{{ metrics()!.totalRejects | number }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Tabs estilo Notion sin líneas -->
      <div class="mb-6">
        <div class="flex gap-6 mb-6">
          <button 
            (click)="activeTab.set('users')"
            class="text-sm font-medium transition-colors pb-1"
            [style.color]="activeTab() === 'users' ? '#37352F' : '#787774'"
            [style.border-bottom]="activeTab() === 'users' ? '2px solid #37352F' : '2px solid transparent'">
            Usuarios
          </button>
          <button 
            (click)="activeTab.set('campaigns')"
            class="text-sm font-medium transition-colors pb-1"
            [style.color]="activeTab() === 'campaigns' ? '#37352F' : '#787774'"
            [style.border-bottom]="activeTab() === 'campaigns' ? '2px solid #37352F' : '2px solid transparent'">
            Campañas
          </button>
          <button 
            (click)="activeTab.set('lists')"
            class="text-sm font-medium transition-colors pb-1"
            [style.color]="activeTab() === 'lists' ? '#37352F' : '#787774'"
            [style.border-bottom]="activeTab() === 'lists' ? '2px solid #37352F' : '2px solid transparent'">
            Listas de Contactos
          </button>
        </div>

        <!-- Users Tab -->
        @if (activeTab() === 'users') {
          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-base font-medium" style="color: #37352F;">Gestión de Usuarios</h3>
              <button (click)="loadUsers()" class="text-sm hover:underline" style="color: #787774;">
                Actualizar
              </button>
            </div>
            
            @if (loading()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-5 w-5" style="border: 2px solid #E9E9E7; border-top-color: #37352F;"></div>
              </div>
            } @else {
              <div class="space-y-1">
                @for (user of users(); track user.id) {
                  <div 
                    class="flex items-center justify-between py-3 px-2 rounded-lg cursor-pointer transition-colors hover:bg-[#F7F6F3]"
                    (click)="viewUser(user.id)">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white" style="background-color: #9065B0;">
                        {{ getInitials(user.name) }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate" style="color: #37352F;">{{ user.name }}</p>
                        <p class="text-xs truncate" style="color: #9B9A97;">{{ user.email }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="text-xs px-2 py-0.5 rounded" style="background-color: #F7F6F3; color: #787774;">
                        {{ user.plan }}
                      </span>
                      <span class="text-xs px-2 py-0.5 rounded"
                            [style.background-color]="user.role === 'ADMIN' ? 'rgba(144, 101, 176, 0.15)' : '#F7F6F3'"
                            [style.color]="user.role === 'ADMIN' ? '#9065B0' : '#787774'">
                        {{ user.role }}
                      </span>
                      <span class="text-xs" style="color: #9B9A97;">{{ user.emailsSent }} emails</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Pagination estilo Notion limpio -->
              @if (usersTotalPages() > 1) {
                <div class="flex justify-center items-center gap-3 mt-6 text-sm">
                  <button 
                    (click)="changeUsersPage(usersCurrentPage() - 1)" 
                    [disabled]="usersCurrentPage() === 0"
                    class="px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F6F3]"
                    style="color: #787774;">
                    ←
                  </button>
                  <span style="color: #9B9A97;">
                    {{ usersCurrentPage() + 1 }} / {{ usersTotalPages() }}
                  </span>
                  <button 
                    (click)="changeUsersPage(usersCurrentPage() + 1)" 
                    [disabled]="usersCurrentPage() >= usersTotalPages() - 1"
                    class="px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F6F3]"
                    style="color: #787774;">
                    →
                  </button>
                </div>
              }
            }
          </div>
        }

        <!-- Campaigns Tab -->
        @if (activeTab() === 'campaigns') {
          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-base font-medium" style="color: #37352F;">Todas las Campañas</h3>
              <button (click)="loadCampaigns()" class="text-sm hover:underline" style="color: #787774;">
                Actualizar
              </button>
            </div>
            
            @if (loading()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-5 w-5" style="border: 2px solid #E9E9E7; border-top-color: #37352F;"></div>
              </div>
            } @else {
              <div class="space-y-1">
                @for (campaign of campaigns(); track campaign.id) {
                  <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate" style="color: #37352F;">{{ campaign.subject }}</p>
                      <p class="text-xs" style="color: #9B9A97;">{{ getUserName(campaign.ownerId) }} · {{ campaign.sender || 'Sin remitente' }}</p>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="text-xs px-2 py-0.5 rounded"
                            [style.background-color]="campaign.status === 'SENT' ? 'rgba(15, 123, 108, 0.15)' : campaign.status === 'DRAFT' ? 'rgba(223, 171, 1, 0.15)' : campaign.status === 'SENDING' ? 'rgba(82, 156, 202, 0.15)' : '#F7F6F3'"
                            [style.color]="campaign.status === 'SENT' ? '#0F7B6C' : campaign.status === 'DRAFT' ? '#DFAB01' : campaign.status === 'SENDING' ? '#529CCA' : '#787774'">
                        {{ getStatusText(campaign.status) }}
                      </span>
                      <span class="text-xs" style="color: #9B9A97;">{{ campaign.createdAt | date:'dd/MM/yyyy' }}</span>
                      <button 
                        (click)="deleteCampaign(campaign.id)"
                        class="text-xs hover:underline"
                        style="color: #E03E3E;">
                        Eliminar
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Pagination -->
              @if (campaignsTotalPages() > 1) {
                <div class="flex justify-center items-center gap-3 mt-6 text-sm">
                  <button 
                    (click)="changeCampaignsPage(campaignsCurrentPage() - 1)" 
                    [disabled]="campaignsCurrentPage() === 0"
                    class="px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F6F3]"
                    style="color: #787774;">
                    ←
                  </button>
                  <span style="color: #9B9A97;">
                    {{ campaignsCurrentPage() + 1 }} / {{ campaignsTotalPages() }}
                  </span>
                  <button 
                    (click)="changeCampaignsPage(campaignsCurrentPage() + 1)" 
                    [disabled]="campaignsCurrentPage() >= campaignsTotalPages() - 1"
                    class="px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F6F3]"
                    style="color: #787774;">
                    →
                  </button>
                </div>
              }
            }
          </div>
        }

        <!-- Contact Lists Tab -->
        @if (activeTab() === 'lists') {
          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-base font-medium" style="color: #37352F;">Listas de Contactos</h3>
              <button (click)="loadContactLists()" class="text-sm hover:underline" style="color: #787774;">
                Actualizar
              </button>
            </div>
            
            @if (loading()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-5 w-5" style="border: 2px solid #E9E9E7; border-top-color: #37352F;"></div>
              </div>
            } @else {
              <div class="space-y-1">
                @for (list of contactLists(); track list.id) {
                  <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-medium" style="color: #37352F;">{{ list.name }}</p>
                        <p class="text-xs" style="color: #9B9A97;">{{ getUserName(list.ownerId) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="text-xs" style="color: #9B9A97;">{{ getContactsCount(list.id) }} contactos</span>
                      <button (click)="viewContacts(list.id)" class="text-xs hover:underline" style="color: #529CCA;">
                        Ver
                      </button>
                      <button 
                        (click)="deleteContactList(list.id)"
                        class="text-xs hover:underline"
                        style="color: #E03E3E;">
                        Eliminar
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Pagination -->
              @if (listsTotalPages() > 1) {
                <div class="flex justify-center items-center gap-3 mt-6 text-sm">
                  <button 
                    (click)="changeListsPage(listsCurrentPage() - 1)" 
                    [disabled]="listsCurrentPage() === 0"
                    class="px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F6F3]"
                    style="color: #787774;">
                    ←
                  </button>
                  <span style="color: #9B9A97;">
                    {{ listsCurrentPage() + 1 }} / {{ listsTotalPages() }}
                  </span>
                  <button 
                    (click)="changeListsPage(listsCurrentPage() + 1)" 
                    [disabled]="listsCurrentPage() >= listsTotalPages() - 1"
                    class="px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F6F3]"
                    style="color: #787774;">
                    →
                  </button>
                </div>
              }
            }
          </div>
        }
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  activeTab = signal<'users' | 'campaigns' | 'lists'>('users');
  loading = signal(false);
  
  // Pagination Signals
  usersCurrentPage = signal(0);
  usersTotalPages = signal(0);
  campaignsCurrentPage = signal(0);
  campaignsTotalPages = signal(0);
  listsCurrentPage = signal(0);
  listsTotalPages = signal(0);
  
  private pageSize = 10;
  
  // Data
  stats = this.adminService.stats;
  metrics = this.adminService.metrics;
  users = this.adminService.users;
  campaigns = this.adminService.campaigns;
  contactLists = this.adminService.contactLists;
  
  // Mapa de usuarios para mostrar nombres
  private userMap = new Map<string, string>();
  
  // Mapa de totales de contactos por lista
  private contactsCountMap = new Map<string, number>();

  getContactsCount(listId: string): number {
    return this.contactsCountMap.get(listId) || 0;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.loading.set(true);
    this.adminService.loadStats();
    this.adminService.loadMetrics();
    
    // Cargar datos según la pestaña activa
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.adminService.getUsers(this.usersCurrentPage(), this.pageSize).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.usersTotalPages.set(response.totalPages);
        // Crear mapa de usuarios para buscar nombres
        this.userMap.clear();
        response.content.forEach(user => {
          this.userMap.set(user.id, user.name);
        });
      },
      error: () => this.loading.set(false)
    });
  }

  changeUsersPage(page: number) {
    if (page >= 0 && page < this.usersTotalPages()) {
      this.usersCurrentPage.set(page);
      this.loadUsers();
    }
  }

  loadCampaigns() {
    this.loading.set(true);
    this.adminService.getCampaigns(this.campaignsCurrentPage(), this.pageSize).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.campaignsTotalPages.set(response.totalPages);
      },
      error: () => this.loading.set(false)
    });
  }

  changeCampaignsPage(page: number) {
    if (page >= 0 && page < this.campaignsTotalPages()) {
      this.campaignsCurrentPage.set(page);
      this.loadCampaigns();
    }
  }

  loadContactLists() {
    this.loading.set(true);
    this.adminService.getContactLists(this.listsCurrentPage(), this.pageSize).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.listsTotalPages.set(response.totalPages);
        // Load contacts count for each list
        this.contactsCountMap.clear();
        response.content.forEach(list => {
          this.adminService.getContactsCountFromList(list.id).subscribe({
            next: (count) => {
              this.contactsCountMap.set(list.id, count);
              // Trigger change detection by creating a new signal reference
              this.contactLists();
            }
          });
        });
      },
      error: () => this.loading.set(false)
    });
  }

  changeListsPage(page: number) {
    if (page >= 0 && page < this.listsTotalPages()) {
      this.listsCurrentPage.set(page);
      this.loadContactLists();
    }
  }

  deleteUser(userId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          alert('Usuario eliminado exitosamente');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Error al eliminar usuario');
        }
      });
    }
  }

  deleteCampaign(campaignId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
      this.adminService.deleteCampaign(campaignId).subscribe({
        next: () => {
          alert('Campaña eliminada exitosamente');
          this.loadCampaigns();
        },
        error: (err) => {
          console.error('Error deleting campaign:', err);
          alert('Error al eliminar campaña');
        }
      });
    }
  }

  deleteContactList(listId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta lista de contactos?')) {
      this.adminService.deleteContactList(listId).subscribe({
        next: () => {
          alert('Lista de contactos eliminada exitosamente');
          this.loadContactLists();
        },
        error: (err) => {
          console.error('Error deleting contact list:', err);
          alert('Error al eliminar lista de contactos');
        }
      });
    }
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'DRAFT': 'Borrador',
      'SENDING': 'Enviando',
      'SENT': 'Enviada',
      'CANCELLED': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  getUserName(userId: string): string {
    return this.userMap.get(userId) || userId;
  }

  viewUser(userId: string) {
    this.router.navigate(['/admin/user', userId]);
  }

  viewContacts(listId: string) {
    this.router.navigate(['/admin/contacts', listId]);
  }
}
