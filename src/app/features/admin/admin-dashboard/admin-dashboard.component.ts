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
    <div class="space-y-6 font-sans">
      <!-- Header estilo Notion -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold text-notion-text" style="color: var(--notion-text);">Panel de Administración</h1>
          <p class="text-notion-text-dimmed mt-1" style="color: var(--notion-text-dimmed);">Gestiona usuarios, campañas y contactos de la plataforma</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-notion-bg-secondary text-notion-text text-sm rounded" style="background-color: var(--notion-bg-secondary);">
            Administrador
          </span>
        </div>
      </div>

      <!-- Stats Grid estilo Notion -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white p-4 rounded border" style="background-color: white; border-color: var(--notion-border);">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-notion-text-dimmed" style="color: var(--notion-text-dimmed);">Usuarios Totales</p>
              <p class="text-2xl font-semibold mt-1" style="color: var(--notion-text);">{{ stats().totalUsers }}</p>
            </div>
            <div class="w-8 h-8 rounded flex items-center justify-center" style="background-color: var(--notion-bg-secondary);">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--notion-text);">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded border" style="background-color: white; border-color: var(--notion-border);">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-notion-text-dimmed" style="color: var(--notion-text-dimmed);">Campañas Totales</p>
              <p class="text-2xl font-semibold mt-1" style="color: var(--notion-text);">{{ stats().totalCampaigns }}</p>
            </div>
            <div class="w-8 h-8 rounded flex items-center justify-center" style="background-color: var(--notion-bg-secondary);">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--notion-text);">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded border" style="background-color: white; border-color: var(--notion-border);">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-notion-text-dimmed" style="color: var(--notion-text-dimmed);">Listas de Contactos</p>
              <p class="text-2xl font-semibold mt-1" style="color: var(--notion-text);">{{ stats().totalContactLists }}</p>
            </div>
            <div class="w-8 h-8 rounded flex items-center justify-center" style="background-color: var(--notion-bg-secondary);">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--notion-text);">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded border" style="background-color: white; border-color: var(--notion-border);">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-notion-text-dimmed" style="color: var(--notion-text-dimmed);">Contactos</p>
              <p class="text-2xl font-semibold mt-1" style="color: var(--notion-text);">{{ stats().totalContacts }}</p>
            </div>
            <div class="w-8 h-8 rounded flex items-center justify-center" style="background-color: var(--notion-bg-secondary);">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--notion-text);">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Métricas de Email con Gráfico estilo Notion -->
      @if (metrics()) {
        <div class="bg-white rounded border p-5" style="background-color: white; border-color: var(--notion-border);">
          <h3 class="text-lg font-semibold mb-4" style="color: var(--notion-text);">Métricas de Email</h3>
          
          <!-- Gráfico de barras estilo Notion simple -->
          <div class="flex items-end justify-around h-40 gap-4 mb-4">
            <!-- Entregados -->
            <div class="flex flex-col items-center flex-1">
              <div class="w-full bg-green-500 rounded-t" [style.height.%]="getPercentage(metrics()!.totalDelivered)"></div>
              <span class="text-xs mt-2" style="color: var(--notion-text-dimmed);">Entregados</span>
              <span class="text-sm font-medium" style="color: var(--notion-text);">{{ metrics()?.totalDelivered | number }}</span>
            </div>
            <!-- Rebotados -->
            <div class="flex flex-col items-center flex-1">
              <div class="w-full bg-red-400 rounded-t" [style.height.%]="getPercentage(metrics()!.totalBounces)"></div>
              <span class="text-xs mt-2" style="color: var(--notion-text-dimmed);">Rebotados</span>
              <span class="text-sm font-medium" style="color: var(--notion-text);">{{ metrics()?.totalBounces | number }}</span>
            </div>
            <!-- Quejas -->
            <div class="flex flex-col items-center flex-1">
              <div class="w-full bg-yellow-500 rounded-t" [style.height.%]="getPercentage(metrics()!.totalComplaints)"></div>
              <span class="text-xs mt-2" style="color: var(--notion-text-dimmed);">Quejas</span>
              <span class="text-sm font-medium" style="color: var(--notion-text);">{{ metrics()?.totalComplaints | number }}</span>
            </div>
            <!-- Rechazados -->
            <div class="flex flex-col items-center flex-1">
              <div class="w-full bg-gray-400 rounded-t" [style.height.%]="getPercentage(metrics()!.totalRejects)"></div>
              <span class="text-xs mt-2" style="color: var(--notion-text-dimmed);">Rechazados</span>
              <span class="text-sm font-medium" style="color: var(--notion-text);">{{ metrics()?.totalRejects | number }}</span>
            </div>
          </div>
          
          <!-- Total General -->
          <div class="text-center pt-4 border-t" style="border-color: var(--notion-border);">
            <span class="text-sm" style="color: var(--notion-text-dimmed);">Total de emails procesados: </span>
            <span class="text-lg font-semibold" style="color: var(--notion-text);">
              {{ (metrics()!.totalDelivered + metrics()!.totalBounces + metrics()!.totalComplaints + metrics()!.totalRejects) | number }}
            </span>
          </div>
        </div>
      }

      <!-- Tabs estilo Notion -->
      <div class="bg-white rounded border" style="background-color: white; border-color: var(--notion-border);">
        <div class="border-b" style="border-color: var(--notion-border);">
          <nav class="flex px-4" style="border-color: var(--notion-border);">
            <button 
              (click)="activeTab.set('users')"
              class="py-3 px-4 text-sm font-medium border-b-2 transition-colors"
              [class.border-notion-accent]="activeTab() === 'users'"
              [class.text-notion-accent]="activeTab() === 'users'"
              [class.border-transparent]="activeTab() !== 'users'"
              [class.text-notion-text-dimmed]="activeTab() !== 'users'"
              style="border-color: var(--notion-accent);">
              Usuarios
            </button>
            <button 
              (click)="activeTab.set('campaigns')"
              class="py-3 px-4 text-sm font-medium border-b-2 transition-colors"
              [class.border-notion-accent]="activeTab() === 'campaigns'"
              [class.text-notion-accent]="activeTab() === 'campaigns'"
              [class.border-transparent]="activeTab() !== 'campaigns'"
              [class.text-notion-text-dimmed]="activeTab() !== 'campaigns'"
              style="border-color: var(--notion-accent);">
              Campañas
            </button>
            <button 
              (click)="activeTab.set('lists')"
              class="py-3 px-4 text-sm font-medium border-b-2 transition-colors"
              [class.border-notion-accent]="activeTab() === 'lists'"
              [class.text-notion-accent]="activeTab() === 'lists'"
              [class.border-transparent]="activeTab() !== 'lists'"
              [class.text-notion-text-dimmed]="activeTab() !== 'lists'"
              style="border-color: var(--notion-accent);">
              Listas de Contactos
            </button>
          </nav>
        </div>

        <!-- Users Tab -->
        @if (activeTab() === 'users') {
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold" style="color: var(--notion-text);">Gestión de Usuarios</h3>
              <button (click)="loadUsers()" class="px-3 py-1.5 text-sm rounded border hover:bg-notion-bg-secondary" style="border-color: var(--notion-border); color: var(--notion-text);">
                Actualizar
              </button>
            </div>
            
            @if (loading()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2" style="border-color: var(--notion-accent);"></div>
              </div>
            } @else {
              <div class="overflow-x-auto rounded border" style="border-color: var(--notion-border);">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b" style="border-color: var(--notion-border); background-color: var(--notion-bg-secondary);">
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Nombre</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Email</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Plan</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Emails Enviados</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Rol</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (user of users(); track user.id) {
                      <tr class="border-b hover:bg-notion-bg-secondary cursor-pointer transition-colors" style="border-color: var(--notion-border);" (click)="viewUser(user.id)">
                        <td class="py-2.5 px-3" style="color: var(--notion-text);">{{ user.name }}</td>
                        <td class="py-2.5 px-3" style="color: var(--notion-text-dimmed);">{{ user.email }}</td>
                        <td class="py-2.5 px-3">
                          <span class="px-2 py-0.5 rounded text-xs font-medium"
                                style="background-color: var(--notion-bg-secondary); color: var(--notion-text);">
                            {{ user.plan }}
                          </span>
                        </td>
                        <td class="py-2.5 px-3" style="color: var(--notion-text-dimmed);">{{ user.emailsSent }}</td>
                        <td class="py-2.5 px-3">
                          <span class="px-2 py-0.5 rounded text-xs font-medium"
                                [class.bg-purple-100]="user.role === 'ADMIN'"
                                [class.text-purple-800]="user.role === 'ADMIN'"
                                [style.background-color]="user.role === 'ADMIN' ? '#F3E8FF' : 'var(--notion-bg-secondary)'"
                                [style.color]="user.role === 'ADMIN' ? '#7C3AED' : 'var(--notion-text)'">
                            {{ user.role }}
                          </span>
                        </td>
                        <td class="py-2.5 px-3" (click)="$event.stopPropagation()">
                          <button (click)="viewUser(user.id)" class="hover:underline text-sm mr-3" style="color: var(--notion-accent);">
                            Editar
                          </button>
                          <button 
                            (click)="deleteUser(user.id)"
                            class="hover:underline text-sm"
                            style="color: #DC2626;">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination estilo Notion -->
              @if (usersTotalPages() > 1) {
                <div class="flex justify-center items-center gap-2 mt-4 text-sm">
                  <button 
                    (click)="changeUsersPage(usersCurrentPage() - 1)" 
                    [disabled]="usersCurrentPage() === 0"
                    class="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style="border-color: var(--notion-border); color: var(--notion-text);">
                    Anterior
                  </button>
                  <span style="color: var(--notion-text-dimmed);">
                    Página {{ usersCurrentPage() + 1 }} de {{ usersTotalPages() }}
                  </span>
                  <button 
                    (click)="changeUsersPage(usersCurrentPage() + 1)" 
                    [disabled]="usersCurrentPage() >= usersTotalPages() - 1"
                    class="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style="border-color: var(--notion-border); color: var(--notion-text);">
                    Siguiente
                  </button>
                </div>
              }
            }
          </div>
        }

        <!-- Campaigns Tab -->
        @if (activeTab() === 'campaigns') {
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold" style="color: var(--notion-text);">Todas las Campañas</h3>
              <button (click)="loadCampaigns()" class="px-3 py-1.5 text-sm rounded border hover:bg-notion-bg-secondary" style="border-color: var(--notion-border); color: var(--notion-text);">
                Actualizar
              </button>
            </div>
            
            @if (loading()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2" style="border-color: var(--notion-accent);"></div>
              </div>
            } @else {
              <div class="overflow-x-auto rounded border" style="border-color: var(--notion-border);">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b" style="border-color: var(--notion-border); background-color: var(--notion-bg-secondary);">
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Asunto</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Propietario</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Remitente</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Estado</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Fecha</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (campaign of campaigns(); track campaign.id) {
                      <tr class="border-b hover:bg-notion-bg-secondary transition-colors" style="border-color: var(--notion-border);">
                        <td class="py-2.5 px-3" style="color: var(--notion-text);">{{ campaign.subject }}</td>
                        <td class="py-2.5 px-3" style="color: var(--notion-text-dimmed);">{{ getUserName(campaign.ownerId) }}</td>
                        <td class="py-2.5 px-3" style="color: var(--notion-text-dimmed);">{{ campaign.sender || 'N/A' }}</td>
                        <td class="py-2.5 px-3">
                          <span class="px-2 py-0.5 rounded text-xs font-medium"
                                [style.background-color]="campaign.status === 'SENT' ? '#DCFCE7' : campaign.status === 'DRAFT' ? '#FEF3C7' : campaign.status === 'SENDING' ? '#DBEAFE' : 'var(--notion-bg-secondary)'"
                                [style.color]="campaign.status === 'SENT' ? '#16A34A' : campaign.status === 'DRAFT' ? '#D97706' : campaign.status === 'SENDING' ? '#2563EB' : 'var(--notion-text)'">
                            {{ getStatusText(campaign.status) }}
                          </span>
                        </td>
                        <td class="py-2.5 px-3 text-sm" style="color: var(--notion-text-dimmed);">
                          {{ campaign.createdAt | date:'dd/MM/yyyy HH:mm' }}
                        </td>
                        <td class="py-2.5 px-3">
                          <button 
                            (click)="deleteCampaign(campaign.id)"
                            class="hover:underline text-sm"
                            style="color: #DC2626;">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination estilo Notion -->
              @if (campaignsTotalPages() > 1) {
                <div class="flex justify-center items-center gap-2 mt-4 text-sm">
                  <button 
                    (click)="changeCampaignsPage(campaignsCurrentPage() - 1)" 
                    [disabled]="campaignsCurrentPage() === 0"
                    class="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style="border-color: var(--notion-border); color: var(--notion-text);">
                    Anterior
                  </button>
                  <span style="color: var(--notion-text-dimmed);">
                    Página {{ campaignsCurrentPage() + 1 }} de {{ campaignsTotalPages() }}
                  </span>
                  <button 
                    (click)="changeCampaignsPage(campaignsCurrentPage() + 1)" 
                    [disabled]="campaignsCurrentPage() >= campaignsTotalPages() - 1"
                    class="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style="border-color: var(--notion-border); color: var(--notion-text);">
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
              <h3 class="text-lg font-semibold" style="color: var(--notion-text);">Listas de Contactos</h3>
              <button (click)="loadContactLists()" class="px-3 py-1.5 text-sm rounded border hover:bg-notion-bg-secondary" style="border-color: var(--notion-border); color: var(--notion-text);">
                Actualizar
              </button>
            </div>
            
            @if (loading()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2" style="border-color: var(--notion-accent);"></div>
              </div>
            } @else {
              <div class="overflow-x-auto rounded border" style="border-color: var(--notion-border);">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b" style="border-color: var(--notion-border); background-color: var(--notion-bg-secondary);">
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Nombre</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Propietario</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Total Contactos</th>
                      <th class="text-left py-2.5 px-3 font-medium" style="color: var(--notion-text-dimmed);">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (list of contactLists(); track list.id) {
                      <tr class="border-b hover:bg-notion-bg-secondary transition-colors" style="border-color: var(--notion-border);">
                        <td class="py-2.5 px-3" style="color: var(--notion-text);">{{ list.name }}</td>
                        <td class="py-2.5 px-3" style="color: var(--notion-text-dimmed);">{{ getUserName(list.ownerId) }}</td>
                        <td class="py-2.5 px-3" style="color: var(--notion-text-dimmed);">{{ getContactsCount(list.id) }}</td>
                        <td class="py-2.5 px-3">
                          <button (click)="viewContacts(list.id)" class="hover:underline text-sm mr-3" style="color: var(--notion-accent);">
                            Ver
                          </button>
                          <button 
                            (click)="deleteContactList(list.id)"
                            class="hover:underline text-sm"
                            style="color: #DC2626;">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination estilo Notion -->
              @if (listsTotalPages() > 1) {
                <div class="flex justify-center items-center gap-2 mt-4 text-sm">
                  <button 
                    (click)="changeListsPage(listsCurrentPage() - 1)" 
                    [disabled]="listsCurrentPage() === 0"
                    class="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style="border-color: var(--notion-border); color: var(--notion-text);">
                    Anterior
                  </button>
                  <span style="color: var(--notion-text-dimmed);">
                    Página {{ listsCurrentPage() + 1 }} de {{ listsTotalPages() }}
                  </span>
                  <button 
                    (click)="changeListsPage(listsCurrentPage() + 1)" 
                    [disabled]="listsCurrentPage() >= listsTotalPages() - 1"
                    class="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style="border-color: var(--notion-border); color: var(--notion-text);">
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

  getPercentage(value: number): number {
    const m = this.metrics();
    if (!m) return 0;
    const total = m.totalDelivered + m.totalBounces + m.totalComplaints + m.totalRejects;
    if (total === 0) return 0;
    return (value / total) * 100;
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
