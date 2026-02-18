export type CampaignStatus = 'DRAFT' | 'SENDING' | 'SENT' | 'CANCELLED';

export interface Campaign {
  id: string;
  ownerId: string;
  subject: string;
  htmlContent: string;
  sender: string;
  recipientListId: string;
  status: CampaignStatus;
  createdAt: string;
  sentAt?: string;
}

export interface NewCampaignRequest {
  ownerId: string;
  subject: string;
  htmlContent: string;
  sender: string;
  recipientListId: string;
}

export interface CampaignDataResponse {
  id: string;
  ownerId: string;
  subject: string;
  htmlContent: string;
  sender: string;
  recipientListId: string;
  status: CampaignStatus;
  createdAt: string;
}

export interface SendCampaignRequest {
  campaignId: string;
  ownerId: string;
}
