import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Campaign, CampaignDataResponse, NewCampaignRequest } from '../models/campaign.model';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly API_URL = '/api/campaigns';
  
  private _campaigns = signal<Campaign[]>([]);
  private _loading = signal(false);
  
  readonly campaigns = computed(() => this._campaigns());
  readonly loading = computed(() => this._loading());
  
  readonly draftCampaigns = computed(() => 
    this._campaigns().filter(c => c.status === 'DRAFT')
  );
  
  readonly activeCampaigns = computed(() => 
    this._campaigns().filter(c => c.status === 'SENDING')
  );

  constructor(private http: HttpClient) {}

  loadUserCampaigns(userId: string) {
    this._loading.set(true);
    this.http.get<CampaignDataResponse[]>(`${this.API_URL}/user/${userId}`)
      .subscribe({
        next: (campaigns) => {
          this._campaigns.set(campaigns);
          this._loading.set(false);
        },
        error: () => this._loading.set(false)
      });
  }

  createCampaign(request: NewCampaignRequest) {
    return this.http.post<Campaign>(`${this.API_URL}/new`, request);
  }

  deleteCampaign(id: string) {
    return this.http.delete(`${this.API_URL}/${id}/delete`);
  }
}