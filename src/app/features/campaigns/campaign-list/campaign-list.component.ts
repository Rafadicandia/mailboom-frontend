import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';
import { Campaign } from '../../../core/models/campaign.model';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-notion-text">Campañas</h2>
          <p class="text-sm text-notion-text-secondary">Gestiona tus campañas de email marketing</p>
        </div>
        <a routerLink="/campaigns/new"
           class="px-4 py-2 bg-notion-text text-white rounded-notion hover:bg-opacity-90 flex items-center gap-2 text-sm font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nueva Campaña
        </a>
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <svg class="w-6 h-6 animate-spin mx-auto text-notion-text-secondary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-sm text-notion-text-secondary">Cargando campañas...</p>
        </div>
      } @else if (campaigns().length === 0) {
        <div class="bg-notion-yellow bg-opacity-10 border border-notion-yellow border-opacity-20 rounded-notion p-8 text-center">
          <svg class="w-12 h-12 mx-auto text-notion-yellow mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <h3 class="text-base font-semibold text-notion-text mb-2">No tienes campañas aún</h3>
          <p class="text-sm text-notion-text-secondary mb-4">Crea tu primera campaña para comenzar a enviar emails</p>
          <a routerLink="/campaigns/new"
             class="inline-flex items-center px-4 py-2 bg-notion-text text-white text-sm rounded-notion hover:bg-opacity-90">
            Crear mi primera campaña
          </a>
        </div>
      } @else {
        <!-- Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="bg-white border border-notion-border rounded-notion p-4">
            <p class="text-xs text-notion-text-secondary">Total</p>
            <p class="text-xl font-semibold text-notion-text">{{ campaigns().length }}</p>
          </div>
          <div class="bg-white border border-notion-border rounded-notion p-4">
            <p class="text-xs text-notion-text-secondary">Enviadas</p>
            <p class="text-xl font-semibold text-notion-green">{{ getSentCampaigns().length }}</p>
          </div>
          <div class="bg-white border border-notion-border rounded-notion p-4">
            <p class="text-xs text-notion-text-secondary">Borradores</p>
            <p class="text-xl font-semibold text-notion-yellow">{{ draftCampaigns().length }}</p>
          </div>
        </div>

        <!-- Lista de campañas -->
        <div class="space-y-2">
          @for (campaign of campaigns(); track campaign.id) {
            <div class="bg-white border border-notion-border rounded-notion p-4 hover:shadow-notion-hover transition-all">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-notion flex items-center justify-center"
                       [class.bg-notion-green]="campaign.status === 'SENT'"
                       [class.bg-notion-yellow]="campaign.status === 'DRAFT'"
                       [class.bg-notion-blue]="campaign.status === 'SENDING'"
                       [class.bg-opacity-10]="true">
                    <svg class="w-5 h-5"
                         [class.text-notion-green]="campaign.status === 'SENT'"
                         [class.text-notion-yellow]="campaign.status === 'DRAFT'"
                         [class.text-notion-blue]="campaign.status === 'SENDING'"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-medium text-notion-text text-sm">{{ campaign.subject }}</h3>
                    <p class="text-xs text-notion-text-tertiary">
                      {{ getStatusText(campaign.status) }} • {{ campaign.createdAt | date:'dd/MM/yyyy' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="px-2.5 py-1 rounded text-xs font-medium"
                        [class.bg-green-100]="campaign.status === 'SENT'"
                        [class.text-green-800]="campaign.status === 'SENT'"
                        [class.bg-yellow-100]="campaign.status === 'DRAFT'"
                        [class.text-yellow-800]="campaign.status === 'DRAFT'"
                        [class.bg-blue-100]="campaign.status === 'SENDING'"
                        [class.text-blue-800]="campaign.status === 'SENDING'">
                    {{ getStatusText(campaign.status) }}
                  </span>
                  
                  <!-- Botón Editar -->
                  <button (click)="editCampaign(campaign)"
                          class="px-2.5 py-1.5 bg-notion-blue text-white rounded-notion hover:bg-opacity-90 text-xs flex items-center gap-1 transition-colors"
                          title="Editar campaña">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  
                  <!-- Botón Preview -->
                  <button (click)="previewCampaign(campaign)"
                          class="px-2.5 py-1.5 bg-notion-purple text-white rounded-notion hover:bg-opacity-90 text-xs flex items-center gap-1 transition-colors"
                          title="Ver previsualización">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  
                  <!-- Botón Enviar -->
                  @if (campaign.status === 'DRAFT') {
                    <button (click)="sendCampaign(campaign)"
                            class="px-2.5 py-1.5 bg-notion-green text-white rounded-notion hover:bg-opacity-90 text-xs flex items-center gap-1 transition-colors"
                            title="Enviar campaña">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                    </button>
                  }
                  
                  <button (click)="deleteCampaign(campaign)"
                          class="p-1.5 text-notion-text-tertiary hover:text-notion-red hover:bg-notion-red hover:bg-opacity-10 rounded-notion transition-colors"
                          title="Eliminar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Paginación -->
        @if (campaignService.totalPages() > 1) {
          <div class="flex justify-center items-center gap-2">
            <button 
              (click)="changePage(campaignService.currentPage() - 1)" 
              [disabled]="campaignService.currentPage() === 0"
              class="px-3 py-1.5 border border-notion-border rounded-notion text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-notion-bg-hover">
              Anterior
            </button>
            <span class="px-3 py-1.5 text-sm text-notion-text-secondary">
              Página {{ campaignService.currentPage() + 1 }} de {{ campaignService.totalPages() }}
            </span>
            <button 
              (click)="changePage(campaignService.currentPage() + 1)" 
              [disabled]="campaignService.currentPage() >= campaignService.totalPages() - 1"
              class="px-3 py-1.5 border border-notion-border rounded-notion text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-notion-bg-hover">
              Siguiente
            </button>
          </div>
        }
      }

      <!-- Modal de Previsualización -->
      @if (showPreview()) {
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" (click)="closePreview()">
          <div class="bg-white rounded-notion shadow-notion-hover w-full max-w-2xl max-h-[90vh] overflow-hidden" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between p-4 border-b border-notion-border">
              <div>
                <h3 class="text-base font-semibold text-notion-text">Previsualización</h3>
                <p class="text-xs text-notion-text-secondary">{{ previewCampaignData()?.subject }}</p>
              </div>
              <button (click)="closePreview()" class="p-1.5 text-notion-text-tertiary hover:bg-notion-bg-hover rounded-notion transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="border border-notion-border rounded-notion m-4 overflow-hidden">
              <iframe [srcdoc]="previewCampaignData()?.htmlContent" 
                      class="w-full h-96 border-0"></iframe>
            </div>
            <div class="flex justify-end gap-2 p-4 border-t border-notion-border">
              <button (click)="closePreview()"
                      class="px-4 py-2 border border-notion-border text-notion-text rounded-notion text-sm hover:bg-notion-bg-hover transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CampaignListComponent implements OnInit {
  campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  private router = inject(Router);

  campaigns = this.campaignService.campaigns;
  draftCampaigns = this.campaignService.draftCampaigns;
  isLoading = this.campaignService.loading;
  showPreview = signal(false);
  previewCampaignData = signal<Campaign | null>(null);

  ngOnInit() {
    this.loadCampaigns();
  }

  loadCampaigns() {
    const userId = this.authService.currentUser()?.id;
    console.log('📋 CAMPAIGN-LIST - currentUser():', this.authService.currentUser());
    console.log('📋 CAMPAIGN-LIST - userId:', userId);
    if (userId) {
      this.campaignService.loadUserCampaigns(userId);
    }
  }

  changePage(page: number) {
    const userId = this.authService.currentUser()?.id;
    if (userId && page >= 0) {
      this.campaignService.loadUserCampaigns(userId, page, 10);
    }
  }

  getSentCampaigns(): Campaign[] {
    return this.campaignService.campaigns().filter(c => c.status === 'SENT');
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

  editCampaign(campaign: Campaign) {
    this.campaignService.setCurrentCampaign(campaign);
    this.router.navigate(['/campaigns/new'], { queryParams: { edit: campaign.id } });
  }

  previewCampaign(campaign: Campaign) {
    this.previewCampaignData.set(campaign);
    this.showPreview.set(true);
  }

  closePreview() {
    this.showPreview.set(false);
    this.previewCampaignData.set(null);
  }

  deleteCampaign(campaign: Campaign) {
    if (!confirm(`¿Estás seguro de eliminar "${campaign.subject}"?`)) return;
    
    this.campaignService.deleteCampaign(campaign.id).subscribe({
      next: () => {
        this.campaignService.removeCampaignFromList(campaign.id);
      },
      error: (err: any) => alert(err.error?.message || 'Error al eliminar')
    });
  }

  sendCampaign(campaign: Campaign) {
    this.editCampaign(campaign);
  }
}
