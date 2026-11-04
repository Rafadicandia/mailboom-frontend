export type CampaignStatus = 'DRAFT' | 'SENDING' | 'SENT' | 'CANCELLED';
export type CampaignType = 'EMAIL' | 'WHATSAPP';

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
  type?: CampaignType;
}

export interface NewCampaignRequest {
  ownerId: string;
  subject: string;
  htmlContent: string;
  sender: string;
  recipientListId: string;
  type?: CampaignType;
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
  type?: CampaignType;
}

export interface SendCampaignRequest {
  campaignId: string;
  ownerId: string;
}
