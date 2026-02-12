export type CampaignStatus = 'DRAFT' | 'SENDING' | 'SENT';

export interface Campaign {
  id: string;
  ownerId: string;
  subject: string;
  htmlContent: string;
  sender: string;
  recipientListId: string;
  status: CampaignStatus;
  createdAt: Date;
  sentAt?: Date;
}

export interface NewCampaignRequest {
  ownerId: string;
  subject: string;
  htmlContent: string;
  sender: string;
  recipientListId: string;
}

export interface CampaignDataResponse extends Campaign {}

export interface SendCampaignRequest {
  campaignId: string;
  ownerId: string;
}