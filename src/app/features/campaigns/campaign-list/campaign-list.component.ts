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
          <h2 class="text-2xl font-bold text-gray-900">Campañas</h2>
          <p class="text-gray-600">Gestiona tus campañas de email marketing</p>
        </div>
        <a routerLink="/campaigns/new"
           class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nueva Campaña
        </a>
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <svg class="w-8 h-8 animate-spin mx-auto text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-gray-600">Cargando campañas...</p>
        </div>
      } @else if (campaigns().length === 0) {
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <h3 class="text-lg font-semibold text-yellow-800 mb-2">No tienes campañas aún</h3>
          <p class="text-yellow-700 mb-4">Crea tu primera campaña para comenzar a enviar emails</p>
          <a routerLink="/campaigns/new"
             class="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
            Crear mi primera campaña
          </a>
        </div>
      } @else {
        <!-- Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <p class="text-sm text-gray-600">Total</p>
            <p class="text-2xl font-bold text-gray-900">{{ campaigns().length }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <p class="text-sm text-gray-600">Enviadas</p>
            <p class="text-2xl font-bold text-green-600">{{ getSentCampaigns().length }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <p class="text-sm text-gray-600">Borradores</p>
            <p class="text-2xl font-bold text-yellow-600">{{ draftCampaigns().length }}</p>
          </div>
        </div>

        <!-- Lista de campañas -->
        <div class="space-y-4">
          @for (campaign of campaigns(); track campaign.id) {
            <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                       [class.bg-green-100]="campaign.status === 'SENT'"
                       [class.bg-yellow-100]="campaign.status === 'DRAFT'"
                       [class.bg-blue-100]="campaign.status === 'SENDING'">
                    <svg class="w-6 h-6"
                         [class.text-green-600]="campaign.status === 'SENT'"
                         [class.text-yellow-600]="campaign.status === 'DRAFT'"
                         [class.text-blue-600]="campaign.status === 'SENDING'"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ campaign.subject }}</h3>
                    <p class="text-sm text-gray-500">
                      {{ getStatusText(campaign.status) }} • {{ campaign.createdAt | date:'dd/MM/yyyy' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-medium"
                        [class.bg-green-100]="campaign.status === 'SENT'"
                        [class.text-green-800]="campaign.status === 'SENT'"
                        [class.bg-yellow-100]="campaign.status === 'DRAFT'"
                        [class.text-yellow-800]="campaign.status === 'DRAFT'"
                        [class.bg-blue-100]="campaign.status === 'SENDING'"
                        [class.text-blue-800]="campaign.status === 'SENDING'">
                    {{ getStatusText(campaign.status) }}
                  </span>
                  @if (campaign.status === 'DRAFT') {
                    <button (click)="editCampaign(campaign)"
                            class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            title="Editar borrador">
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      Editar
                    </button>
                    <button (click)="previewCampaign(campaign)"
                            class="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                            title="Ver previsualización">
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      Preview
                    </button>
                  }
                  <button (click)="deleteCampaign(campaign)"
                          class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Eliminar">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal de Previsualización -->
      @if (showPreview()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="closePreview()">
          <div class="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Previsualización: {{ previewCampaignData()?.subject }}</h3>
              <button (click)="closePreview()" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <iframe [srcdoc]="previewCampaignData()?.htmlContent" 
                      class="w-full h-96 border-0"></iframe>
            </div>
            <div class="mt-4 flex justify-end">
              <button (click)="closePreview()"
                      class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
  private campaignService = inject(CampaignService);
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
    if (userId) {
      this.campaignService.loadUserCampaigns(userId);
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
    // Guardar la campaña actual en el servicio
    this.campaignService.setCurrentCampaign(campaign);
    // Navegar al editor con el ID
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
}
