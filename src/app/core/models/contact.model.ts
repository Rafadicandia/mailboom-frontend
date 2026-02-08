export interface Contact {
  id: string;
  email: string;
  name?: string;
  customFields: Record<string, string>;
  subscribed: boolean;
  contactListId: string;
}

export interface ContactList {
  id: string;
  name: string;
  ownerId: string;
  contactCount: number;
  createdAt: Date;
}

export interface NewContactListRequest {
  name: string;
  ownerId: string;
}

// Alias para compatibilidad
export type ContactListDataResponse = ContactList;

export interface ColumnMapping {
  columnIndex: number;
  fieldType: 'EMAIL' | 'ATTRIBUTE';
  attributeName?: string;
}

export interface ImportJob {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  totalRows: number;
  processedRows: number;
  errors: string[];
}