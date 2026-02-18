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
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p class="text-gray-600">Gestiona usuarios, campañas y contactos de la plataforma</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            Administrador
          </span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Usuarios Totales</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats().totalUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Campañas Totales</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats().totalCampaigns }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Listas de Contactos</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats().totalContactLists }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Contactos</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats().totalContacts }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Métricas de Email -->
      @if (metrics()) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Métricas de Email</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 bg-green-50 rounded-lg">
              <p class="text-sm font-medium text-green-600">Entregados</p>
              <p class="text-2xl font-bold text-green-900 mt-1">{{ metrics()?.totalDelivered | number }}</p>
            </div>
            <div class="p-4 bg-red-50 rounded-lg">
              <p class="text-sm font-medium text-red-600">Rebotados</p>
              <p class="text-2xl font-bold text-red-900 mt-1">{{ metrics()?.totalBounces | number }}</p>
            </div>
            <div class="p-4 bg-yellow-50 rounded-lg">
              <p class="text-sm font-medium text-yellow-600">Quejas</p>
              <p class="text-2xl font-bold text-yellow-900 mt-1">{{ metrics()?.totalComplaints | number }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm font-medium text-gray-600">Rechazados</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ metrics()?.totalRejects | number }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button 
              (click)="activeTab.set('users')"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              [class.border-indigo-600]="activeTab() === 'users'"
              [class.text-indigo-600]="activeTab() === 'users'"
              [class.border-transparent]="activeTab() !== 'users'"
              [class.text-gray-500]="activeTab() !== 'users'">
              Usuarios
            </button>
            <button 
              (click)="activeTab.set('campaigns')"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              [class.border-indigo-600]="activeTab() === 'campaigns'"
              [class.text-indigo-600]="activeTab() === 'campaigns'"
              [class.border-transparent]="activeTab() !== 'campaigns'"
              [class.text-gray-500]="activeTab() !== 'campaigns'">
              Campañas
            </button>
            <button 
              (click)="activeTab.set('lists')"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              [class.border-indigo-600]="activeTab() === 'lists'"
              [class.text-indigo-600]="activeTab() === 'lists'"
              [class.border-transparent]="activeTab() !== 'lists'"
              [class.text-gray-500]="activeTab() !== 'lists'">
              Listas de Contactos
            </button>
          </nav>
        </div>

        <!-- Users Tab -->
        @if (activeTab() === 'users') {
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
              <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                Actualizar
              </button>
            </div>
            
            @if (loading()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Nombre</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Plan</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Emails Enviados</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Rol</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (user of users(); track user.id) {
                      <tr class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" (click)="viewUser(user.id)">
                        <td class="py-3 px-4 text-sm text-gray-900">{{ user.name }}</td>
                        <td class="py-3 px-4 text-sm text-gray-600">{{ user.email }}</td>
                        <td class="py-3 px-4 text-sm">
                          <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {{ user.plan }}
                          </span>
                        </td>
                        <td class="py-3 px-4 text-sm text-gray-600">{{ user.emailsSent }}</td>
                        <td class="py-3 px-4 text-sm">
                          <span class="px-2 py-1 rounded text-xs font-medium"
                                [class.bg-purple-100]="user.role === 'ADMIN'"
                                [class.text-purple-800]="user.role === 'ADMIN'"
                                [class.bg-gray-100]="user.role === 'USER'"
                                [class.text-gray-800]="user.role === 'USER'">
                            {{ user.role }}
                          </span>
                        </td>
                        <td class="py-3 px-4" (click)="$event.stopPropagation()">
                          <button (click)="viewUser(user.id)" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">
                            Editar
                          </button>
                          <button 
                            (click)="deleteUser(user.id)"
                            class="text-red-600 hover:text-red-800 text-sm font-medium">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              @if (usersTotalPages() > 1) {
                <div class="flex justify-center items-center gap-2 mt-4">
                  <button 
                    (click)="changeUsersPage(usersCurrentPage() - 1)" 
                    [disabled]="usersCurrentPage() === 0"
                    class="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                  </button>
                  <span class="text-sm text-gray-600">
                    Página {{ usersCurrentPage() + 1 }} de {{ usersTotalPages() }}
                  </span>
                  <button 
                    (click)="changeUsersPage(usersCurrentPage() + 1)" 
                    [disabled]="usersCurrentPage() >= usersTotalPages() - 1"
                    class="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
                  </button>
                </div>
              }
            }
          </div>
        }

        <!-- Campaigns Tab -->
        @if (activeTab() === 'campaigns') {
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Todas las Campañas</h3>
              <button (click)="loadCampaigns()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                Actualizar
              </button>
            </div>
            
            @if (loading()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Asunto</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Propietario</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Remitente</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (campaign of campaigns(); track campaign.id) {
                      <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 px-4 text-sm text-gray-900">{{ campaign.subject }}</td>
                        <td class="py-3 px-4 text-sm text-gray-600">{{ getUserName(campaign.ownerId) }}</td>
                        <td class="py-3 px-4 text-sm text-gray-600">{{ campaign.sender || 'N/A' }}</td>
                        <td class="py-3 px-4 text-sm">
                          <span class="px-2 py-1 rounded text-xs font-medium"
                                [class.bg-green-100]="campaign.status === 'SENT'"
                                [class.text-green-800]="campaign.status === 'SENT'"
                                [class.bg-yellow-100]="campaign.status === 'DRAFT'"
                                [class.text-yellow-800]="campaign.status === 'DRAFT'"
                                [class.bg-blue-100]="campaign.status === 'SENDING'"
                                [class.text-blue-800]="campaign.status === 'SENDING'">
                            {{ getStatusText(campaign.status) }}
                          </span>
                        </td>
                        <td class="py-3 px-4 text-sm text-gray-600">
                          {{ campaign.createdAt | date:'dd/MM/yyyy HH:mm' }}
                        </td>
                        <td class="py-3 px-4">
                          <button 
                            (click)="deleteCampaign(campaign.id)"
                            class="text-red-600 hover:text-red-800 text-sm font-medium">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              @if (campaignsTotalPages() > 1) {
                <div class="flex justify-center items-center gap-2 mt-4">
                  <button 
                    (click)="changeCampaignsPage(campaignsCurrentPage() - 1)" 
                    [disabled]="campaignsCurrentPage() === 0"
                    class="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                  </button>
                  <span class="text-sm text-gray-600">
                    Página {{ campaignsCurrentPage() + 1 }} de {{ campaignsTotalPages() }}
                  </span>
                  <button 
                    (click)="changeCampaignsPage(campaignsCurrentPage() + 1)" 
                    [disabled]="campaignsCurrentPage() >= campaignsTotalPages() - 1"
                    class="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
                  </button>
                </div>
              }
            }
          </div>
        }

        <!-- Contact Lists Tab -->
        @if (activeTab() === 'lists') {
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Listas de Contactos</h3>
              <button (click)="loadContactLists()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                Actualizar
              </button>
            </div>
            
            @if (loading()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Nombre</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Propietario</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Total Contactos</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (list of contactLists(); track list.id) {
                      <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 px-4 text-sm text-gray-900">{{ list.name }}</td>
                        <td class="py-3 px-4 text-sm text-gray-600">{{ getUserName(list.ownerId) }}</td>
                        <td class="py-3 px-4 text-sm text-gray-600">{{ getContactsCount(list.id) }}</td>
                        <td class="py-3 px-4">
                          <button (click)="viewContacts(list.id)" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">
                            Ver
                          </button>
                          <button 
                            (click)="deleteContactList(list.id)"
                            class="text-red-600 hover:text-red-800 text-sm font-medium">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              @if (listsTotalPages() > 1) {
                <div class="flex justify-center items-center gap-2 mt-4">
                  <button 
                    (click)="changeListsPage(listsCurrentPage() - 1)" 
                    [disabled]="listsCurrentPage() === 0"
                    class="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                  </button>
                  <span class="text-sm text-gray-600">
                    Página {{ listsCurrentPage() + 1 }} de {{ listsTotalPages() }}
                  </span>
                  <button 
                    (click)="changeListsPage(listsCurrentPage() + 1)" 
                    [disabled]="listsCurrentPage() >= listsTotalPages() - 1"
                    class="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
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
