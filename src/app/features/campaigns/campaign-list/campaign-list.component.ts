import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';
import { Campaign } from '../../../core/models/campaign.model';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-6">
      <!-- Header estilo Notion limpio -->
      <div class="mb-10">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-3xl font-semibold" style="color: #37352F;">Campañas</h1>
            </div>
            <p class="text-base" style="color: #787774;">Gestiona tus campañas de email marketing</p>
          </div>
          <a routerLink="/campaigns/new"
             class="inline-flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
             style="background-color: #37352F; color: white;">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nueva Campaña
          </a>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-5 w-5" style="border: 2px solid #E9E9E7; border-top-color: #37352F;"></div>
        </div>
      } @else if (campaigns().length === 0) {
        <!-- Empty State estilo Notion -->
        <div class="py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-base font-medium mb-2" style="color: #37352F;">No tienes campañas aún</h3>
          <p class="text-sm mb-6" style="color: #787774;">Crea tu primera campaña para comenzar a enviar emails</p>
          <a routerLink="/campaigns/new"
             class="inline-flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
             style="background-color: #37352F; color: white;">
            Crear mi primera campaña
          </a>
        </div>
      } @else {
        <!-- Stats Grid estilo Notion sin bordes -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div class="group cursor-default">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <span class="text-sm" style="color: #787774;">Total</span>
            </div>
            <p class="text-2xl font-semibold" style="color: #37352F;">{{ campaigns().length }}</p>
          </div>

          <div class="group cursor-default">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span class="text-sm" style="color: #787774;">Enviadas</span>
            </div>
            <p class="text-2xl font-semibold" style="color: #0F7B6C;">{{ getSentCampaigns().length }}</p>
          </div>

          <div class="group cursor-default">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-sm" style="color: #787774;">Enviando</span>
            </div>
            <p class="text-2xl font-semibold" style="color: #529CCA;">{{ getSendingCampaigns().length }}</p>
          </div>
        </div>

        <!-- Lista de campañas estilo Notion -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium" style="color: #37352F;">Todas las Campañas</h2>
            <button (click)="loadCampaigns()" class="text-sm hover:underline" style="color: #787774;">
              Actualizar
            </button>
          </div>
          
          <div class="space-y-1">
            @for (campaign of campaigns(); track campaign.id) {
              <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate" style="color: #37352F;">{{ campaign.subject }}</p>
                    <p class="text-xs" style="color: #9B9A97;">{{ campaign.sender || 'Sin remitente' }} · {{ campaign.createdAt | date:'dd/MM/yyyy' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs px-2 py-0.5 rounded"
                        [style.background-color]="campaign.status === 'SENT' ? 'rgba(15, 123, 108, 0.15)' : campaign.status === 'DRAFT' ? 'rgba(223, 171, 1, 0.15)' : campaign.status === 'SENDING' ? 'rgba(82, 156, 202, 0.15)' : '#F7F6F3'"
                        [style.color]="campaign.status === 'SENT' ? '#0F7B6C' : campaign.status === 'DRAFT' ? '#DFAB01' : campaign.status === 'SENDING' ? '#529CCA' : '#787774'">
                    {{ getStatusText(campaign.status) }}
                  </span>
                  
                  <!-- Botones de acción -->
                  <button (click)="editCampaign(campaign)"
                          class="text-xs hover:underline"
                          style="color: #529CCA;">
                    Editar
                  </button>
                  
                  <button (click)="previewCampaign(campaign)"
                          class="text-xs hover:underline"
                          style="color: #787774;">
                    Ver
                  </button>
                  
                  @if (campaign.status === 'DRAFT') {
                    <button (click)="sendCampaign(campaign)"
                            class="text-xs hover:underline"
                            style="color: #0F7B6C;">
                      Enviar
                    </button>
                  }
                  
                  <button (click)="deleteCampaign(campaign)"
                          class="text-xs hover:underline"
                          style="color: #E03E3E;">
                    Eliminar
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Paginación estilo Notion limpio -->
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
        </div>
      }

      <!-- Modal de Previsualización estilo Notion -->
      @if (showPreview()) {
        <div class="fixed inset-0 flex items-center justify-center z-50" style="background-color: rgba(0, 0, 0, 0.4);" (click)="closePreview()">
          <div class="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg" style="background-color: white;" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between p-4" style="border-bottom: 1px solid #E9E9E7;">
              <div>
                <h3 class="text-base font-medium" style="color: #37352F;">Previsualización</h3>
                <p class="text-xs" style="color: #787774;">{{ previewCampaignData()?.subject }}</p>
              </div>
              <button (click)="closePreview()" class="p-1.5 rounded transition-colors hover:bg-[#F7F6F3]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #9B9A97;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="m-4 overflow-hidden rounded-lg" style="border: 1px solid #E9E9E7;">
              <iframe [srcdoc]="previewCampaignData()?.htmlContent" 
                      class="w-full h-96 border-0"></iframe>
            </div>
            <div class="flex justify-end gap-2 p-4" style="border-top: 1px solid #E9E9E7;">
              <button (click)="closePreview()"
                      class="px-4 py-2 rounded text-sm transition-colors hover:bg-[#F7F6F3]"
                      style="color: #37352F;">
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
  private adminService = inject(AdminService);
  private router = inject(Router);

  // Signals locales para manejar las campañas (especialmente para admin)
  private _campaigns = signal<Campaign[]>([]);
  private _loading = signal(false);
  private _currentPage = signal(0);
  private _totalPages = signal(0);
  
  // Exponer las campañas - usar las locales si es admin, si no las del servicio
  campaigns = computed(() => this.isAdmin() ? this._campaigns() : this.campaignService.campaigns());
  draftCampaigns = computed(() => this.campaigns().filter(c => c.status === 'DRAFT'));
  isLoading = computed(() => this.isAdmin() ? this._loading() : this.campaignService.loading());
  currentPage = computed(() => this.isAdmin() ? this._currentPage() : this.campaignService.currentPage());
  totalPages = computed(() => this.isAdmin() ? this._totalPages() : this.campaignService.totalPages());
  showPreview = signal(false);
  previewCampaignData = signal<Campaign | null>(null);
  isAdmin = this.authService.isAdmin;

  ngOnInit() {
    this.loadCampaigns();
  }

  loadCampaigns() {
    if (this.isAdmin()) {
      // Si es admin, cargar todas las campañas
      this._loading.set(true);
      this.adminService.getCampaigns(0, 10).subscribe({
        next: (response) => {
          this._campaigns.set(response.content);
          this._currentPage.set(response.number || 0);
          this._totalPages.set(response.totalPages || 1);
          this._loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando campañas de admin:', err);
          this._loading.set(false);
        }
      });
    } else {
      // Si no es admin, cargar solo las campañas del usuario
      const userId = this.authService.currentUser()?.id;
      console.log('📋 CAMPAIGN-LIST - currentUser():', this.authService.currentUser());
      console.log('📋 CAMPAIGN-LIST - userId:', userId);
      if (userId) {
        this.campaignService.loadUserCampaigns(userId);
      }
    }
  }

  changePage(page: number) {
    if (this.isAdmin()) {
      // Si es admin, cargar la página de todas las campañas
      if (page < 0 || page >= this._totalPages()) return;
      this._loading.set(true);
      this.adminService.getCampaigns(page, 10).subscribe({
        next: (response) => {
          this._campaigns.set(response.content);
          this._currentPage.set(response.number || page);
          this._loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando campañas:', err);
          this._loading.set(false);
        }
      });
    } else {
      const userId = this.authService.currentUser()?.id;
      if (userId && page >= 0) {
        this.campaignService.loadUserCampaigns(userId, page, 10);
      }
    }
  }

  getSentCampaigns(): Campaign[] {
    return this.campaigns().filter(c => c.status === 'SENT');
  }

  getSendingCampaigns(): Campaign[] {
    return this.campaigns().filter(c => c.status === 'SENDING');
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
    
    if (this.isAdmin()) {
      // Si es admin, usar AdminService para eliminar
      this.adminService.deleteCampaign(campaign.id).subscribe({
        next: () => {
          this._campaigns.update(list => list.filter(c => c.id !== campaign.id));
        },
        error: (err: any) => alert(err.error?.message || 'Error al eliminar')
      });
    } else {
      // Si no es admin, usar CampaignService
      this.campaignService.deleteCampaign(campaign.id).subscribe({
        next: () => {
          this.campaignService.removeCampaignFromList(campaign.id);
        },
        error: (err: any) => alert(err.error?.message || 'Error al eliminar')
      });
    }
  }

  sendCampaign(campaign: Campaign) {
    this.editCampaign(campaign);
  }
}
