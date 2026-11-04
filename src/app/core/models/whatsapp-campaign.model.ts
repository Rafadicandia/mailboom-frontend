import { TemplateParameter } from './whatsapp.model';
import { CampaignStatus } from './campaign.model';

export interface WhatsAppCampaign {
  id: string;
  ownerId: string;
  recipientListId: string;
  templateName: string;
  languageCode: string;
  parameters?: TemplateParameter[];
  status: CampaignStatus;
  createdAt: string;
  sentAt?: string;
  type: 'WHATSAPP';
}

export interface NewWhatsAppCampaignRequest {
  ownerId: string;
  templateName: string;
  languageCode: string;
  recipientListId: string;
  parameters?: TemplateParameter[];
  type: 'WHATSAPP';
}

export interface SendWhatsAppCampaignRequest {
  campaignId: string;
  ownerId: string;
}

export interface WhatsAppCampaignDataResponse {
  id: string;
  ownerId: string;
  recipientListId: string;
  templateName: string;
  languageCode: string;
  parameters?: TemplateParameter[];
  status: CampaignStatus;
  createdAt: string;
  sentAt?: string;
  type: 'WHATSAPP';
}