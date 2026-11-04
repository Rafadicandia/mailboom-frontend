export interface SendTemplateMessageRequest {
  to: string;
  templateName: string;
  languageCode: string;
  parameters?: TemplateParameter[];
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video' | 'location';
  text?: string;
  currency?: {
    code: string;
    amount_1000: number;
  };
  date_time?: {
    component_type: 'date_time';
    fallback_value: string;
    day_of_week?: number;
    year?: number;
    month?: number;
    day_of_month?: number;
    hour?: number;
    minute?: number;
    calendar?: 'GREGORIAN' | 'LUNAR' | 'SOLAR';
  };
  image?: {
    link: string;
    caption?: string;
  };
  document?: {
    link: string;
    filename?: string;
    caption?: string;
  };
  video?: {
    link: string;
    caption?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}

export interface SendTemplateMessageResponse {
  messageId: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  to: string;
  templateName: string;
  timestamp: string;
}

export interface TemplateInfo {
  name: string;
  language: string;
  category: string;
  components: TemplateComponent[];
  status: 'approved' | 'pending' | 'rejected';
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTON';
  text: string;
  format?: string;
  example?: any;
}

export interface TemplateLanguage {
  code: string;
  name: string;
  region?: string;
}

export interface CreateTemplateRequest {
  name: string;
  category: string;
  parameterFormat: string;
  components: TemplateComponent[];
  language: string;
  ownerId: string;
}

export interface CreateTemplateResponse {
  id: string;
  name: string;
  category: string;
  language: string;
  components: TemplateComponent[];
  status: string;
  ownerId: string;
}

export interface TemplateResponse {
  id: string;
  name: string;
  category: string;
  language: string;
  components: TemplateComponent[];
  status: string;
  ownerId: string;
}