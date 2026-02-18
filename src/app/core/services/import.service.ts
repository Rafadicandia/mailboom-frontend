import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly API_URL = '/api/contacts';

  constructor(private http: HttpClient) {}

  /**
   * Importa contactos desde un archivo (CSV/Excel)
   * El frontend valida el formato y las columnas requeridas (email, name)
   * antes de enviar el archivo al backend para procesamiento
   */
  importFromFile(listId: string, ownerId: string, file: File): Observable<Contact[]> {
    const formData = new FormData();
    formData.append('listId', listId);
    formData.append('ownerId', ownerId);
    formData.append('file', file);

    return this.http.post<Contact[]>(`${this.API_URL}/import/file`, formData);
  }
}
