import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Campaign, CampaignDataResponse, NewCampaignRequest, SendCampaignRequest } from '../models/campaign.model';
import { WhatsAppCampaign, NewWhatsAppCampaignRequest, SendWhatsAppCampaignRequest } from '../models/whatsapp-campaign.model';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly API_URL = '/api/campaigns';
  
  private _campaigns = signal<Campaign[]>([]);
  private _loading = signal(false);
  private _currentCampaign = signal<Campaign | null>(null);
  
  // Información de paginación
  private _currentPage = signal(0);
  private _pageSize = signal(10);
  private _totalElements = signal(0);
  private _totalPages = signal(0);
  
  readonly campaigns = computed(() => this._campaigns());
  readonly loading = computed(() => this._loading());
  readonly currentCampaign = computed(() => this._currentCampaign());
  
  // Getters para paginación
  readonly currentPage = computed(() => this._currentPage());
  readonly pageSize = computed(() => this._pageSize());
  readonly totalElements = computed(() => this._totalElements());
  readonly totalPages = computed(() => this._totalPages());
  
  readonly draftCampaigns = computed(() => 
    this._campaigns().filter(c => c.status === 'DRAFT')
  );
  
  readonly activeCampaigns = computed(() => 
    this._campaigns().filter(c => c.status === 'SENDING')
  );

  constructor(private http: HttpClient) {}

  loadUserCampaigns(userId: string, page: number = 0, size: number = 10) {
    this._loading.set(true);
    console.log('📥 LOADING CAMPAIGNS - userId:', userId, 'page:', page, 'size:', size);
    this.http.get<any>(`${this.API_URL}/user/${userId}`, {
      params: { page: page.toString(), size: size.toString() }
    })
      .subscribe({
        next: (response) => {
          console.log('📥 CAMPAIGNS LOADED:', response);
          // El backend puede devolver un array directo o un objeto Page
          const campaigns = response.content || response;
          this._campaigns.set(campaigns);
          // Guardar información de paginación
          this._currentPage.set(response.number || page);
          this._pageSize.set(response.size || size);
          this._totalElements.set(response.totalElements || campaigns.length);
          this._totalPages.set(response.totalPages || 1);
          this._loading.set(false);
        },
        error: (err) => {
          console.error('📥 ERROR LOADING CAMPAIGNS:', err);
          this._loading.set(false);
        }
      });
  }

  getCampaign(id: string) {
    return this.http.get<Campaign>(`${this.API_URL}/${id}`);
  }

  createCampaign(request: NewCampaignRequest) {
    console.log('💾 CREATE CAMPAIGN - Request:', JSON.stringify(request, null, 2));
    return this.http.post<Campaign>(`${this.API_URL}/new`, request);
  }

  updateCampaign(id: string, request: NewCampaignRequest) {
    console.log('💾 UPDATE CAMPAIGN - id:', id, ', Request:', JSON.stringify(request, null, 2));
    return this.http.put<Campaign>(`${this.API_URL}/${id}/update`, request);
  }

  deleteCampaign(id: string) {
    return this.http.delete(`${this.API_URL}/${id}/delete`);
  }

  sendCampaign(campaignId: string, ownerId: string) {
    const request: SendCampaignRequest = { campaignId, ownerId };
    console.log('🚀 SEND CAMPAIGN - Request:', JSON.stringify(request, null, 2));
    return this.http.post<void>(`${this.API_URL}/${campaignId}/send`, request);
  }

  setCurrentCampaign(campaign: Campaign | null) {
    this._currentCampaign.set(campaign);
  }

  removeCampaignFromList(campaignId: string) {
    this._campaigns.update(list => list.filter(c => c.id !== campaignId));
  }

  // ========== WHATSAPP CAMPAIGN OPERATIONS ==========

  loadUserWhatsAppCampaigns(userId: string, page: number = 0, size: number = 10) {
    this._loading.set(true);
    console.log('📥 LOADING WHATSAPP CAMPAIGNS - userId:', userId, 'page:', page, 'size:', size);
    this.http.get<any>(`${this.API_URL}/whatsapp/user/${userId}`, {
      params: { page: page.toString(), size: size.toString() }
    })
      .subscribe({
        next: (response) => {
          console.log('📥 WHATSAPP CAMPAIGNS LOADED:', response);
          const campaigns = response.content || response;
          // Mezclar con campañas existentes o manejar por separado según necesidad
          const existing = this._campaigns();
          const whatsappCampaigns = campaigns.map((c: any) => ({
            ...c,
            type: 'WHATSAPP' as const
          }));
          this._campaigns.set([...existing.filter((c: Campaign) => c.type !== 'WHATSAPP'), ...whatsappCampaigns]);
          this._currentPage.set(response.number || page);
          this._pageSize.set(response.size || size);
          this._totalElements.set(response.totalElements || campaigns.length);
          this._totalPages.set(response.totalPages || 1);
          this._loading.set(false);
        },
        error: (err) => {
          console.error('📥 ERROR LOADING WHATSAPP CAMPAIGNS:', err);
          this._loading.set(false);
        }
      });
  }

  createWhatsAppCampaign(request: NewWhatsAppCampaignRequest) {
    console.log('💾 CREATE WHATSAPP CAMPAIGN - Request:', JSON.stringify(request, null, 2));
    return this.http.post<WhatsAppCampaign>(`${this.API_URL}/whatsapp/new`, request);
  }

  updateWhatsAppCampaign(id: string, request: NewWhatsAppCampaignRequest) {
    console.log('💾 UPDATE WHATSAPP CAMPAIGN - id:', id, ', Request:', JSON.stringify(request, null, 2));
    return this.http.put<WhatsAppCampaign>(`${this.API_URL}/whatsapp/${id}/update`, request);
  }

  deleteWhatsAppCampaign(id: string) {
    return this.http.delete(`${this.API_URL}/whatsapp/${id}/delete`);
  }

  sendWhatsAppCampaign(campaignId: string, ownerId: string) {
    const request: SendWhatsAppCampaignRequest = { campaignId, ownerId };
    console.log('🚀 SEND WHATSAPP CAMPAIGN - Request:', JSON.stringify(request, null, 2));
    return this.http.post<void>(`${this.API_URL}/whatsapp/${campaignId}/send`, request);
  }

  getWhatsAppCampaign(id: string) {
    return this.http.get<WhatsAppCampaign>(`${this.API_URL}/whatsapp/${id}`);
  }
}