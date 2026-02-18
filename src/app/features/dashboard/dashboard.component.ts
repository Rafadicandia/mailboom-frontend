import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { CampaignService } from '../../core/services/campaign.service';
import { AuthService } from '../../core/services/auth.service';
import { Campaign } from '../../core/models/campaign.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Campañas Totales</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ campaigns().length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Borradores</p>
              <p class="text-3xl font-bold text-yellow-600 mt-2">{{ draftCampaigns().length }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Enviadas</p>
              <p class="text-3xl font-bold text-green-600 mt-2">{{ sentCampaigns().length }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Audiencias</p>
              <p class="text-3xl font-bold text-purple-600 mt-2">{{ contactLists().length }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div class="flex flex-wrap gap-4">
          <a routerLink="/campaigns/new" 
             class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Campaña
          </a>
          
          <a routerLink="/audiences"
             class="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Gestionar Audiencias
          </a>
          
          <a routerLink="/campaigns"
             class="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver Campañas
          </a>
        </div>
      </div>

      <!-- Recent Campaigns -->
      @if (campaigns().length > 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Campañas Recientes</h3>
            <a routerLink="/campaigns" class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Ver todas →
            </a>
          </div>
          <div class="space-y-3">
            @for (campaign of getRecentCampaigns(); track campaign.id) {
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                       [class.bg-green-100]="campaign.status === 'SENT'"
                       [class.bg-yellow-100]="campaign.status === 'DRAFT'"
                       [class.bg-blue-100]="campaign.status === 'SENDING'">
                    <svg class="w-5 h-5"
                         [class.text-green-600]="campaign.status === 'SENT'"
                         [class.text-yellow-600]="campaign.status === 'DRAFT'"
                         [class.text-blue-600]="campaign.status === 'SENDING'"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ campaign.subject }}</p>
                    <p class="text-sm text-gray-500">{{ campaign.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium"
                      [class.bg-green-100]="campaign.status === 'SENT'"
                      [class.text-green-800]="campaign.status === 'SENT'"
                      [class.bg-yellow-100]="campaign.status === 'DRAFT'"
                      [class.text-yellow-800]="campaign.status === 'DRAFT'"
                      [class.bg-blue-100]="campaign.status === 'SENDING'"
                      [class.text-blue-800]="campaign.status === 'SENDING'">
                  {{ getStatusText(campaign.status) }}
                </span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Recent Audiences -->
      @if (contactLists().length > 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Audiencias Recientes</h3>
            <a routerLink="/audiences" class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Ver todas →
            </a>
          </div>
          <div class="space-y-3">
            @for (list of contactLists().slice(0, 3); track list.id) {
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ list.name }}</p>
                    <p class="text-sm text-gray-500">{{ getContactCount(list.id) }} contactos</p>
                  </div>
                </div>
                <a routerLink="/campaigns/new" [queryParams]="{listId: list.id}"
                   class="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                  Crear campaña
                </a>
              </div>
            }
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (campaigns().length === 0 && contactLists().length === 0) {
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 class="text-lg font-semibold text-yellow-800 mb-2">Comienza con tu primera campaña</h3>
          <p class="text-yellow-700 mb-4">Crea una audiencia y luego tu primera campaña de email marketing</p>
          <div class="flex justify-center gap-4">
            <a routerLink="/audiences" class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              Crear Audiencia
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private contactService = inject(ContactService);
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);

  contactLists = this.contactService.contactLists;
  contactsCountByList = this.contactService.contactsCountByList;
  campaigns = this.campaignService.campaigns;
  draftCampaigns = this.campaignService.draftCampaigns;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const userId = this.authService.currentUser()?.id;
    console.log('📊 DASHBOARD - currentUser():', this.authService.currentUser());
    console.log('📊 DASHBOARD - userId:', userId);
    if (userId) {
      this.contactService.loadUserContactLists(userId);
      this.campaignService.loadUserCampaigns(userId);
    }
  }

  sentCampaigns(): Campaign[] {
    return this.campaignService.campaigns().filter(c => c.status === 'SENT');
  }

  getRecentCampaigns(): Campaign[] {
    return this.campaignService.campaigns()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
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

  getContactCount(listId: string): number {
    // Fallback: usar totalContacts del backend o contar desde contactos cargados
    const list = this.contactLists().find(l => l.id === listId);
    if (list && list.totalContacts > 0) {
      return list.totalContacts;
    }
    // Fallback: contar desde los contactos cargados
    return this.contactsCountByList()[listId] || 0;
  }
}
