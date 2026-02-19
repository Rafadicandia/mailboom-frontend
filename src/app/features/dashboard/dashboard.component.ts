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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white border border-notion-border rounded-notion p-5 hover:shadow-notion-hover transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-notion-text-secondary">Campañas Totales</p>
              <p class="text-2xl font-semibold text-notion-text mt-1">{{ campaigns().length }}</p>
            </div>
            <div class="w-10 h-10 bg-notion-blue bg-opacity-10 rounded-notion flex items-center justify-center">
              <svg class="w-5 h-5 text-notion-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white border border-notion-border rounded-notion p-5 hover:shadow-notion-hover transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-notion-text-secondary">Borradores</p>
              <p class="text-2xl font-semibold text-notion-yellow mt-1">{{ draftCampaigns().length }}</p>
            </div>
            <div class="w-10 h-10 bg-notion-yellow bg-opacity-10 rounded-notion flex items-center justify-center">
              <svg class="w-5 h-5 text-notion-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white border border-notion-border rounded-notion p-5 hover:shadow-notion-hover transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-notion-text-secondary">Enviadas</p>
              <p class="text-2xl font-semibold text-notion-green mt-1">{{ sentCampaigns().length }}</p>
            </div>
            <div class="w-10 h-10 bg-notion-green bg-opacity-10 rounded-notion flex items-center justify-center">
              <svg class="w-5 h-5 text-notion-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white border border-notion-border rounded-notion p-5 hover:shadow-notion-hover transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-notion-text-secondary">Audiencias</p>
              <p class="text-2xl font-semibold text-notion-purple mt-1">{{ contactLists().length }}</p>
            </div>
            <div class="w-10 h-10 bg-notion-purple bg-opacity-10 rounded-notion flex items-center justify-center">
              <svg class="w-5 h-5 text-notion-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white border border-notion-border rounded-notion p-6">
        <h3 class="text-base font-semibold text-notion-text mb-4">Acciones Rápidas</h3>
        <div class="flex flex-wrap gap-3">
          <a routerLink="/campaigns/new" 
             class="inline-flex items-center px-4 py-2.5 bg-notion-text text-white rounded-notion hover:bg-opacity-90 transition-colors text-sm font-medium">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Campaña
          </a>
          
          <a routerLink="/audiences"
             class="inline-flex items-center px-4 py-2.5 border border-notion-border text-notion-text rounded-notion hover:bg-notion-bg-hover transition-colors text-sm font-medium">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Gestionar Audiencias
          </a>
          
          <a routerLink="/campaigns"
             class="inline-flex items-center px-4 py-2.5 border border-notion-border text-notion-text rounded-notion hover:bg-notion-bg-hover transition-colors text-sm font-medium">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver Campañas
          </a>
        </div>
      </div>

      <!-- Recent Campaigns -->
      @if (campaigns().length > 0) {
        <div class="bg-white border border-notion-border rounded-notion p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-base font-semibold text-notion-text">Campañas Recientes</h3>
            <a routerLink="/campaigns" class="text-primary-500 hover:underline text-sm">
              Ver todas →
            </a>
          </div>
          <div class="space-y-2">
            @for (campaign of getRecentCampaigns(); track campaign.id) {
              <div class="flex items-center justify-between p-3 rounded-notion hover:bg-notion-bg-hover transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-notion flex items-center justify-center"
                       [class.bg-notion-green]="campaign.status === 'SENT'"
                       [class.bg-notion-yellow]="campaign.status === 'DRAFT'"
                       [class.bg-notion-blue]="campaign.status === 'SENDING'"
                       [class.bg-opacity-10]="true">
                    <svg class="w-4 h-4"
                         [class.text-notion-green]="campaign.status === 'SENT'"
                         [class.text-notion-yellow]="campaign.status === 'DRAFT'"
                         [class.text-notion-blue]="campaign.status === 'SENDING'"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-notion-text text-sm">{{ campaign.subject }}</p>
                    <p class="text-xs text-notion-text-tertiary">{{ campaign.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded text-xs font-medium"
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
        <div class="bg-white border border-notion-border rounded-notion p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-base font-semibold text-notion-text">Audiencias Recientes</h3>
            <a routerLink="/audiences" class="text-primary-500 hover:underline text-sm">
              Ver todas →
            </a>
          </div>
          <div class="space-y-2">
            @for (list of contactLists().slice(0, 3); track list.id) {
              <div class="flex items-center justify-between p-3 rounded-notion hover:bg-notion-bg-hover transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-notion-purple bg-opacity-10 rounded-notion flex items-center justify-center">
                    <svg class="w-4 h-4 text-notion-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-notion-text text-sm">{{ list.name }}</p>
                    <p class="text-xs text-notion-text-tertiary">{{ getContactCount(list.id) }} contactos</p>
                  </div>
                </div>
                <a routerLink="/campaigns/new" [queryParams]="{listId: list.id}"
                   class="px-3 py-1.5 bg-notion-text text-white text-sm rounded-notion hover:bg-opacity-90">
                  Crear campaña
                </a>
              </div>
            }
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (campaigns().length === 0 && contactLists().length === 0) {
        <div class="bg-notion-yellow bg-opacity-10 border border-notion-yellow border-opacity-20 rounded-notion p-8 text-center">
          <svg class="w-12 h-12 mx-auto text-notion-yellow mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 class="text-base font-semibold text-notion-text mb-2">Comienza con tu primera campaña</h3>
          <p class="text-sm text-notion-text-secondary mb-4">Crea una audiencia y luego tu primera campaña de email marketing</p>
          <div class="flex justify-center gap-3">
            <a routerLink="/audiences" class="px-4 py-2 bg-notion-text text-white text-sm rounded-notion hover:bg-opacity-90">
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
    const list = this.contactLists().find(l => l.id === listId);
    if (list && list.totalContacts > 0) {
      return list.totalContacts;
    }
    return this.contactsCountByList()[listId] || 0;
  }
}
