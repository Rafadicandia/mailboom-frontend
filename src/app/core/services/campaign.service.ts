import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Campaign, CampaignDataResponse, NewCampaignRequest, SendCampaignRequest } from '../models/campaign.model';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly API_URL = '/api/campaigns';
  
  private _campaigns = signal<Campaign[]>([]);
  private _loading = signal(false);
  private _currentCampaign = signal<Campaign | null>(null);
  
  readonly campaigns = computed(() => this._campaigns());
  readonly loading = computed(() => this._loading());
  readonly currentCampaign = computed(() => this._currentCampaign());
  
  readonly draftCampaigns = computed(() => 
    this._campaigns().filter(c => c.status === 'DRAFT')
  );
  
  readonly activeCampaigns = computed(() => 
    this._campaigns().filter(c => c.status === 'SENDING')
  );

  constructor(private http: HttpClient) {}

  loadUserCampaigns(userId: string) {
    this._loading.set(true);
    console.log('📥 LOADING CAMPAIGNS - userId:', userId);
    this.http.get<CampaignDataResponse[]>(`${this.API_URL}/user/${userId}`)
      .subscribe({
        next: (campaigns) => {
          console.log('📥 CAMPAIGNS LOADED:', campaigns.length, 'campaigns');
          console.log('📥 CAMPAIGNS DATA:', JSON.stringify(campaigns, null, 2));
          this._campaigns.set(campaigns);
          this._loading.set(false);
        },
        error: (err) => {
          console.error('📥 ERROR LOADING CAMPAIGNS:', err);
          this._loading.set(false);
        }
      });
  }

  getCampaign(id: string) {
    this._loading.set(true);
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
}