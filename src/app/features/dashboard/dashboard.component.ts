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
    <div class="max-w-5xl mx-auto py-8 px-6">
      <!-- Header estilo Notion limpio -->
      <div class="mb-10">
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-3xl font-semibold" style="color: #37352F;">Dashboard</h1>
        </div>
        <p class="text-base" style="color: #787774;">Resumen de tu actividad de email marketing</p>
      </div>

      <!-- Stats Grid estilo Notion sin bordes -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Campañas</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #37352F;">{{ campaigns().length }}</p>
        </div>

        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Borradores</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #DFAB01;">{{ draftCampaigns().length }}</p>
        </div>

        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Enviadas</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #0F7B6C;">{{ sentCampaigns().length }}</p>
        </div>

        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Audiencias</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #9065B0;">{{ contactLists().length }}</p>
        </div>
      </div>

      <!-- Quick Actions estilo Notion -->
      <div class="mb-10">
        <h2 class="text-lg font-medium mb-4" style="color: #37352F;">Acciones Rápidas</h2>
        <div class="flex flex-wrap gap-3">
          <a routerLink="/campaigns/new" 
             class="inline-flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
             style="background-color: #37352F; color: white;">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Campaña
          </a>
          
          <a routerLink="/audiences"
             class="inline-flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm font-medium hover:bg-[#F7F6F3]"
             style="background-color: #F7F6F3; color: #37352F;">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Gestionar Audiencias
          </a>
          
          <a routerLink="/campaigns"
             class="inline-flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm font-medium hover:bg-[#F7F6F3]"
             style="background-color: #F7F6F3; color: #37352F;">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver Campañas
          </a>
        </div>
      </div>

      <!-- Recent Campaigns estilo Notion -->
      @if (campaigns().length > 0) {
        <div class="mb-10">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium" style="color: #37352F;">Campañas Recientes</h2>
            <a routerLink="/campaigns" class="text-sm hover:underline" style="color: #787774;">
              Ver todas →
            </a>
          </div>
          <div class="space-y-1">
            @for (campaign of getRecentCampaigns(); track campaign.id) {
              <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate" style="color: #37352F;">{{ campaign.subject }}</p>
                    <p class="text-xs" style="color: #9B9A97;">{{ campaign.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>
                <span class="text-xs px-2 py-0.5 rounded"
                      [style.background-color]="campaign.status === 'SENT' ? 'rgba(15, 123, 108, 0.15)' : campaign.status === 'DRAFT' ? 'rgba(223, 171, 1, 0.15)' : campaign.status === 'SENDING' ? 'rgba(82, 156, 202, 0.15)' : '#F7F6F3'"
                      [style.color]="campaign.status === 'SENT' ? '#0F7B6C' : campaign.status === 'DRAFT' ? '#DFAB01' : campaign.status === 'SENDING' ? '#529CCA' : '#787774'">
                  {{ getStatusText(campaign.status) }}
                </span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Recent Audiences estilo Notion -->
      @if (contactLists().length > 0) {
        <div class="mb-10">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium" style="color: #37352F;">Audiencias Recientes</h2>
            <a routerLink="/audiences" class="text-sm hover:underline" style="color: #787774;">
              Ver todas →
            </a>
          </div>
          <div class="space-y-1">
            @for (list of contactLists().slice(0, 3); track list.id) {
              <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate" style="color: #37352F;">{{ list.name }}</p>
                    <p class="text-xs" style="color: #9B9A97;">{{ getContactCount(list.id) }} contactos</p>
                  </div>
                </div>
                <a routerLink="/campaigns/new" [queryParams]="{listId: list.id}"
                   class="text-xs px-3 py-1.5 rounded transition-colors hover:bg-[#EBEBEA]"
                   style="background-color: #F7F6F3; color: #37352F;">
                  Crear campaña
                </a>
              </div>
            }
          </div>
        </div>
      }

      <!-- Empty State estilo Notion -->
      @if (campaigns().length === 0 && contactLists().length === 0) {
        <div class="py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-base font-medium mb-2" style="color: #37352F;">Comienza con tu primera campaña</h3>
          <p class="text-sm mb-6" style="color: #787774;">Crea una audiencia y luego tu primera campaña de email marketing</p>
          <a routerLink="/audiences" 
             class="inline-flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
             style="background-color: #37352F; color: white;">
            Crear Audiencia
          </a>
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
