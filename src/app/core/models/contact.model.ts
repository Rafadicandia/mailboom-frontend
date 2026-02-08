export interface Contact {
  id?: string;
  contactId?: string;
  listId: string;
  email: string;
  name?: string;
  customFields: Record<string, string>;
  subscribed: boolean;
}

// Helper to get the contact ID (handles both 'id' and 'contactId')
export function getContactId(contact: Contact): string {
  return contact.id || contact.contactId || '';
}

export interface ContactList {
  id: string;
  name: string;
  ownerId: string;
  contactCount: number;
  createdAt?: Date;
  contacts?: Contact[];
}

export interface NewContactListRequest {
  name: string;
  ownerId: string;
}

export interface NewContactRequest {
  contactListId: string;
  email: string;
  name?: string;
  customFields?: Record<string, string>;
  subscribed?: boolean;
}

export interface UpdateContactRequest {
  email: string;
  name?: string;
  customFields?: Record<string, string>;
  subscribed?: boolean;
}

export interface UpdateContactListRequest {
  name: string;
  ownerId: string;
}

// Alias para compatibilidad
export type ContactListDataResponse = ContactList;
export type ContactDataResponse = Contact;

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