import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { AuthService } from '../../core/services/auth.service';
import { ImportService } from '../../core/services/import.service';
import { ContactList, Contact, getContactId } from '../../core/models/contact.model';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ParsedContact {
  email: string;
  name?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-notion-text">Audiencias</h2>
          <p class="text-sm text-notion-text-secondary">Gestiona tus listas de contactos</p>
        </div>
        <div class="flex gap-2">
          <button (click)="openImportModal()"
                  class="px-4 py-2 bg-notion-green text-white rounded-notion hover:bg-opacity-90 flex items-center gap-2 text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            Importar CSV/Excel
          </button>
          <button (click)="openCreateListModal()"
                  class="px-4 py-2 bg-notion-text text-white rounded-notion hover:bg-opacity-90 flex items-center gap-2 text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Nueva Lista
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <svg class="w-6 h-6 animate-spin mx-auto text-notion-text-secondary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-notion-text-secondary">Cargando audiencias...</p>
        </div>
      } @else if (contactLists().length === 0) {
        <div class="bg-notion-yellow bg-opacity-10 border border-notion-yellow border-opacity-20 rounded-notion p-8 text-center">
          <svg class="w-12 h-12 mx-auto text-notion-yellow mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <h3 class="text-base font-semibold text-notion-text mb-2">No tienes audiencias aún</h3>
          <p class="text-sm text-notion-text-secondary mb-4">Crea tu primera lista de contactos para comenzar a enviar campañas</p>
          <button (click)="openCreateListModal()"
                  class="inline-flex items-center px-4 py-2 bg-notion-yellow text-white rounded-notion hover:bg-opacity-90 text-sm">
            Crear mi primera audiencia
          </button>
        </div>
      } @else {
        <div class="space-y-4">
          @for (list of contactLists(); track list.id) {
            <div class="bg-white border border-notion-border rounded-notion overflow-hidden hover:shadow-notion-hover transition-all">
              <div class="p-4 bg-notion-bg-secondary flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-notion-purple bg-opacity-10 rounded-notion flex items-center justify-center">
                    <svg class="w-5 h-5 text-notion-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-notion-text">{{ list.name }}</h3>
                    <p class="text-sm text-notion-text-secondary">{{ getContactCount(list) }} contactos</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button (click)="toggleContacts(list)"
                          class="px-3 py-1.5 text-primary-500 hover:bg-notion-bg-hover rounded-notion text-sm font-medium">
                    {{ expandedListId() === list.id ? 'Ocultar' : 'Ver contactos' }}
                  </button>
                  <a routerLink="/campaigns/new" [queryParams]="{listId: list.id}"
                     class="px-3 py-1.5 bg-notion-text text-white rounded-notion hover:bg-opacity-90 text-sm">
                    Crear campaña
                  </a>
                  <button (click)="editList(list)"
                          class="p-2 text-notion-text-tertiary hover:bg-notion-bg-hover rounded-notion"
                          title="Editar lista">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button (click)="deleteList(list)"
                          class="p-2 text-notion-text-tertiary hover:text-notion-red hover:bg-notion-red hover:bg-opacity-10 rounded-notion"
                          title="Eliminar lista">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              @if (expandedListId() === list.id) {
                <div class="border-t border-notion-border p-4">
                  <div class="flex flex-col sm:flex-row gap-4 mb-4">
                    <div class="relative flex-1">
                      <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-notion-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                      <input type="text" 
                             [(ngModel)]="searchTerm"
                             placeholder="Buscar contactos..."
                             class="w-full pl-10 pr-4 py-2 border border-notion-border rounded-notion focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
                    </div>
                    <button (click)="openAddContactModal(list.id)"
                            class="px-4 py-2 bg-notion-green text-white rounded-notion hover:bg-opacity-90 flex items-center gap-2 text-sm">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      Agregar Contacto
                    </button>
                  </div>

                  @if (isLoadingContacts()) {
                    <div class="text-center py-8">
                      <svg class="w-6 h-6 animate-spin mx-auto text-notion-text-secondary" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  } @else if (filteredContacts().length === 0) {
                    <div class="text-center py-8 text-notion-text-secondary">
                      @if (contacts().length === 0) {
                        <p>No hay contactos en esta lista</p>
                        <button (click)="openAddContactModal(list.id)" class="text-primary-500 hover:text-primary-600 mt-2">
                          Agregar el primer contacto
                        </button>
                      } @else {
                        <p>No se encontraron resultados para "{{ searchTerm }}"</p>
                      }
                    </div>
                  } @else {
                    <div class="overflow-x-auto">
                      <table class="w-full">
                        <thead class="bg-notion-bg-secondary">
                          <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-notion-text-secondary uppercase">Email</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-notion-text-secondary uppercase">Nombre</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-notion-text-secondary uppercase">Estado</th>
                            <th class="px-4 py-2 text-right text-xs font-medium text-notion-text-secondary uppercase">Acciones</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-notion-border">
                          @for (contact of filteredContacts(); track $index) {
                            <tr class="hover:bg-notion-bg-hover">
                              <td class="px-4 py-3 text-sm text-notion-text">{{ contact.email }}</td>
                              <td class="px-4 py-3 text-sm text-notion-text">{{ contact.name || '-' }}</td>
                              <td class="px-4 py-3 text-sm">
                                @if (contact.subscribed) {
                                  <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Suscrito</span>
                                } @else {
                                  <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">No suscrito</span>
                                }
                              </td>
                              <td class="px-4 py-3 text-sm text-right">
                                <div class="flex justify-end gap-2">
                                  <button (click)="editContact(contact)"
                                          class="p-2 text-notion-text-tertiary hover:bg-notion-bg-hover rounded"
                                          title="Editar">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                  </button>
                                  <button (click)="deleteContact(contact)"
                                          class="p-2 text-notion-text-tertiary hover:text-red-600 hover:bg-red-50 rounded"
                                          title="Eliminar">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Paginación -->
        @if (contactLists().length > 0) {
          <div class="flex justify-center items-center gap-2 mt-6">
            <button 
              (click)="changePage(contactService.currentPage() - 1)" 
              [disabled]="contactService.currentPage() === 0"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Anterior
            </button>
            <span class="px-4 py-2 text-gray-600">
              Página {{ contactService.currentPage() + 1 }} de {{ contactService.totalPages() }}
            </span>
            <button 
              (click)="changePage(contactService.currentPage() + 1)" 
              [disabled]="contactService.currentPage() >= contactService.totalPages() - 1"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        }
      }

      <!-- Modal Crear/Editar Lista -->
      @if (showListModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="closeListModal()">
          <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ isEditingList() ? 'Editar Lista' : 'Nueva Lista' }}</h3>
                <p class="text-sm text-gray-500">{{ isEditingList() ? 'Modifica los datos de tu lista' : 'Crea una nueva lista de contactos' }}</p>
              </div>
              <button (click)="closeListModal()" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la lista</label>
                <input type="text" [(ngModel)]="listName"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="Ej: Newsletter Febrero 2025">
              </div>
              @if (listError()) {
                <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-red-600 text-sm">{{ listError() }}</p>
                </div>
              }
            </div>
            <div class="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button (click)="closeListModal()"
                      class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button (click)="saveList()"
                      [disabled]="!listName.trim() || isSavingList()"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
                @if (isSavingList()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ isSavingList() ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Crear/Editar Contacto -->
      @if (showContactModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="closeContactModal()">
          <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ isEditingContact() ? 'Editar Contacto' : 'Nuevo Contacto' }}</h3>
                <p class="text-sm text-gray-500">{{ isEditingContact() ? 'Modifica los datos del contacto' : 'Agrega un nuevo contacto a tu lista' }}</p>
              </div>
              <button (click)="closeContactModal()" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
                <input type="email" [(ngModel)]="contactEmail"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="correo@ejemplo.com">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" [(ngModel)]="contactName"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                       placeholder="Nombre opcional">
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="contactSubscribed" 
                       id="subscribed" class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500">
                <label for="subscribed" class="text-sm text-gray-700">Suscrito</label>
              </div>
              @if (contactError()) {
                <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-red-600 text-sm">{{ contactError() }}</p>
                </div>
              }
            </div>
            <div class="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button (click)="closeContactModal()"
                      class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button (click)="saveContact()"
                      [disabled]="!contactEmail.trim() || isSavingContact()"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
                @if (isSavingContact()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ isSavingContact() ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Importar CSV/Excel -->
      @if (showImportModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="closeImportModal()">
          <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Importar Contactos</h3>
                <p class="text-sm text-gray-500">Sube un archivo CSV o Excel con tus contactos</p>
              </div>
              <button (click)="closeImportModal()" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div class="p-4 space-y-4">
              @if (importSuccess()) {
                <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div class="flex items-center gap-2 text-green-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="font-medium">¡Importación exitosa!</span>
                  </div>
                  <p class="text-green-700 text-sm mt-1">Los contactos han sido importados correctamente.</p>
                </div>
              } @else {
                @if (!isFileValid()) {
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Archivo CSV o Excel</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                      <input type="file" 
                             (change)="onFileSelected($event)" 
                             accept=".csv,.xlsx,.xls"
                             class="hidden" 
                             id="file-upload">
                      <label for="file-upload" class="cursor-pointer">
                        <svg class="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <p class="text-gray-600">
                          @if (selectedFile()) {
                            {{ selectedFile()?.name }}
                          } @else {
                            Haz clic para seleccionar un archivo
                          }
                        </p>
                        <p class="text-gray-400 text-sm mt-1">Archivos soportados: CSV, Excel (.xlsx, .xls)</p>
                      </label>
                    </div>
                  </div>
                } @else {
                  <div class="space-y-4">
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <span>Archivo: <strong>{{ selectedFile()?.name }}</strong></span>
                      <button (click)="resetFileSelection()" class="text-indigo-600 hover:text-indigo-700 ml-auto">
                        Cambiar archivo
                      </button>
                    </div>

                    <!-- Selección de lista -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Lista de destino</label>
                      @if (showCreateListFromImport()) {
                        <!-- Formulario para crear nueva lista -->
                        <div class="flex gap-2">
                          <input type="text" 
                                 [(ngModel)]="newListName"
                                 class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                 placeholder="Nombre de la nueva lista">
                          <button (click)="createListFromImport()"
                                  [disabled]="!newListName.trim() || isSavingList()"
                                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300">
                            {{ isSavingList() ? 'Guardando...' : 'Crear' }}
                          </button>
                          <button (click)="cancelCreateListFromImport()"
                                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Cancelar
                          </button>
                        </div>
                        @if (listError()) {
                          <p class="text-red-600 text-sm mt-2">{{ listError() }}</p>
                        }
                      } @else {
                        <div class="flex gap-2">
                          <select [(ngModel)]="selectedImportListId" 
                                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">Selecciona una lista...</option>
                            @for (list of contactLists(); track list.id) {
                              <option [value]="list.id">{{ list.name }}</option>
                            }
                          </select>
                          <button (click)="showCreateListFromImport.set(true)"
                                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            Nueva Lista
                          </button>
                        </div>
                      }
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Columnas detectadas</label>
                      <div class="flex flex-wrap gap-2">
                        @for (column of detectedColumns(); track column) {
                          <span class="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                            {{ column }}
                          </span>
                        }
                      </div>
                      <p class="text-sm text-gray-500 mt-2">{{ totalContactsFound() }} contactos encontrados</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Vista previa (primeros 3 registros)</label>
                      <div class="overflow-x-auto border border-gray-200 rounded-lg">
                        <table class="w-full text-sm">
                          <thead class="bg-gray-50">
                            <tr>
                              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200">
                            @for (row of previewData(); track $index) {
                              <tr class="hover:bg-gray-50">
                                <td class="px-3 py-2 text-gray-700">{{ row.email || '-' }}</td>
                                <td class="px-3 py-2 text-gray-700">{{ row.name || '-' }}</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p class="text-blue-700 text-sm">
                        El archivo será procesado por el backend. Asegúrate de que la columna "email" exista en el archivo.
                      </p>
                    </div>
                  </div>
                }

                @if (importError()) {
                  <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-red-600 text-sm">{{ importError() }}</p>
                  </div>
                }
              }
            </div>
            
            <div class="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button (click)="closeImportModal()"
                      class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                {{ importSuccess() ? 'Cerrar' : 'Cancelar' }}
              </button>
              @if (!importSuccess() && isFileValid()) {
                <button (click)="handleFileUpload()"
                        [disabled]="!selectedImportListId || isImporting()"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
                  @if (isImporting()) {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  {{ isImporting() ? 'Importando...' : 'Importar contactos' }}
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ContactListComponent implements OnInit {
  contactService = inject(ContactService);
  private authService = inject(AuthService);
  private importService = inject(ImportService);

  contactLists = computed(() => this.contactService.contactLists());
  contacts = computed(() => this.contactService.contacts());
  isLoading = computed(() => this.contactService.loading());

  constructor() {}

  expandedListId = signal<string | null>(null);
  showListModal = signal(false);
  showContactModal = signal(false);
  isEditingList = signal(false);
  isEditingContact = signal(false);
  isSavingList = signal(false);
  isSavingContact = signal(false);
  isLoadingContacts = signal(false);
  listError = signal('');
  contactError = signal('');
  searchTerm = '';

  filteredContacts = computed(() => {
    const allContacts = this.contacts();
    const term = this.searchTerm.trim().toLowerCase();
    
    if (!term) {
      return allContacts;
    }
    
    return allContacts.filter((c: Contact) => 
      c.email.toLowerCase().includes(term) || 
      (c.name && c.name.toLowerCase().includes(term))
    );
  });

  editingListId = '';
  listName = '';
  editingContactId = '';
  currentListId = '';
  contactEmail = '';
  contactName = '';
  contactSubscribed = true;

  ngOnInit() {
    this.loadContactLists();
  }

  changePage(page: number) {
    const userId = this.authService.currentUser()?.id;
    if (userId && page >= 0) {
      this.contactService.loadUserContactLists(userId, page, 10);
    }
  }

  loadContactLists() {
    const userId = this.authService.currentUser()?.id;
    console.log('👥 CONTACT-LIST - currentUser():', this.authService.currentUser());
    console.log('👥 CONTACT-LIST - userId:', userId);
    if (userId) {
      this.contactService.loadUserContactLists(userId);
    }
  }

  toggleContacts(list: ContactList) {
    this.expandedListId.update(current => current === list.id ? null : list.id);
    if (this.expandedListId() === list.id) {
      this.loadContacts(list.id);
    } else {
      this.contactService.clearContacts();
    }
  }

  loadContacts(listId: string) {
    this.isLoadingContacts.set(true);
    this.contactService.getContactsFromList(listId);
    setTimeout(() => {
      this.isLoadingContacts.set(false);
    }, 300);
  }

  openCreateListModal() {
    this.isEditingList.set(false);
    this.listName = '';
    this.listError.set('');
    this.showListModal.set(true);
  }

  editList(list: ContactList) {
    this.isEditingList.set(true);
    this.editingListId = list.id;
    this.listName = list.name;
    this.listError.set('');
    this.showListModal.set(true);
  }

  saveList() {
    const userId = this.authService.currentUser()?.id;
    if (!userId || !this.listName.trim()) return;

    this.isSavingList.set(true);
    this.listError.set('');

    if (this.isEditingList()) {
      this.contactService.updateContactList(this.editingListId, { name: this.listName, ownerId: userId }).subscribe({
        next: (updatedList) => {
          this.contactService.updateContactListInSignal(updatedList);
          this.closeListModal();
        },
        error: (err: any) => {
          this.listError.set(err.error?.message || 'Error al actualizar');
          this.isSavingList.set(false);
        }
      });
    } else {
      this.contactService.createContactList({ name: this.listName.trim(), ownerId: userId }).subscribe({
        next: (newList) => {
          this.contactService.addContactListToSignal(newList);
          this.closeListModal();
        },
        error: (err: any) => {
          this.listError.set(err.error?.message || 'Error al crear');
          this.isSavingList.set(false);
        }
      });
    }
  }

  deleteList(list: ContactList) {
    if (!confirm(`¿Estás seguro de eliminar "${list.name}"? Se eliminarán todos sus contactos.`)) return;
    
    this.contactService.deleteContactList(list.id).subscribe({
      next: () => {
        this.contactService.removeContactListFromSignal(list.id);
      },
      error: (err: any) => alert(err.error?.message || 'Error al eliminar')
    });
  }

  closeListModal() {
    this.showListModal.set(false);
    this.isEditingList.set(false);
    this.listName = '';
    this.listError.set('');
    this.isSavingList.set(false);
  }

  openAddContactModal(listId: string) {
    this.isEditingContact.set(false);
    this.currentListId = listId;
    this.contactEmail = '';
    this.contactName = '';
    this.contactSubscribed = true;
    this.contactError.set('');
    this.showContactModal.set(true);
  }

  editContact(contact: Contact) {
    this.isEditingContact.set(true);
    this.editingContactId = getContactId(contact);
    // Use contact.listId if available, otherwise use expandedListId
    this.currentListId = contact.listId || this.expandedListId() || '';
    this.contactEmail = contact.email;
    this.contactName = contact.name || '';
    this.contactSubscribed = contact.subscribed;
    this.contactError.set('');
    this.showContactModal.set(true);
  }

  saveContact() {
    if (!this.contactEmail.trim()) return;

    this.isSavingContact.set(true);
    this.contactError.set('');

    if (this.isEditingContact()) {
      if (!this.editingContactId) {
        this.contactError.set('Error: ID del contacto no válido');
        this.isSavingContact.set(false);
        return;
      }
      this.contactService.updateContact(this.editingContactId, this.currentListId, { 
        email: this.contactEmail, 
        name: this.contactName || undefined,
        subscribed: this.contactSubscribed 
      }).subscribe({
        next: (updatedContact) => {
          updatedContact.listId = this.currentListId;
          this.contactService.updateContactInSignal(updatedContact);
          this.closeContactModal();
        },
        error: (err: any) => {
          this.contactError.set(err.error?.message || 'Error al actualizar');
          this.isSavingContact.set(false);
        }
      });
    } else {
      this.contactService.createContact({
        contactListId: this.currentListId,
        email: this.contactEmail,
        name: this.contactName || undefined,
        subscribed: this.contactSubscribed
      }).subscribe({
        next: (newContact) => {
          newContact.listId = this.currentListId;
          this.contactService.addContactToSignal(newContact);
          this.closeContactModal();
        },
        error: (err: any) => {
          this.contactError.set(err.error?.message || 'Error al crear');
          this.isSavingContact.set(false);
        }
      });
    }
  }

  deleteContact(contact: Contact) {
    const contactId = getContactId(contact);
    
    if (!contactId) {
      console.error('Error: Contacto sin ID válido', contact);
      alert('Error: No se puede eliminar el contacto (ID no válido)');
      return;
    }
    
    if (!confirm(`¿Estás seguro de eliminar "${contact.email}"?`)) return;
    
    console.log('Eliminando contacto con ID:', contactId);
    this.contactService.deleteContact(contactId).subscribe({
      next: () => {
        console.log('Contacto eliminado exitosamente');
        this.contactService.removeContactFromSignal(contactId, contact.listId);
      },
      error: (err: any) => {
        console.error('Error eliminando contacto:', err);
        alert(err.error?.message || 'Error al eliminar')
      }
    });
  }

  closeContactModal() {
    this.showContactModal.set(false);
    this.isEditingContact.set(false);
    this.contactEmail = '';
    this.contactName = '';
    this.contactSubscribed = true;
    this.contactError.set('');
    this.isSavingContact.set(false);
  }

  getContactCount(list: ContactList): number {
    if (list.totalContacts > 0) {
      return list.totalContacts;
    }
    return this.contactService.contactsCountByList()[list.id] || 0;
  }

  // Importación
  showImportModal = signal(false);
  isImporting = signal(false);
  importError = signal('');
  importSuccess = signal(false);
  selectedImportListId = '';
  selectedFile = signal<File | null>(null);
  detectedColumns = signal<string[]>([]);
  previewData = signal<ParsedContact[]>([]);
  showCreateListFromImport = signal(false);
  newListName = '';
  parsedFileData: ParsedContact[] = []; // Ahora es pública
  totalContactsFound = signal(0);

  openImportModal() {
    this.showImportModal.set(true);
    this.importError.set('');
    this.importSuccess.set(false);
    this.selectedFile.set(null);
    this.selectedImportListId = '';
    this.detectedColumns.set([]);
    this.previewData.set([]);
    this.parsedFileData = [];
    this.showCreateListFromImport.set(false);
    this.newListName = '';
    this.listError.set('');
    this.totalContactsFound.set(0);
  }

  closeImportModal() {
    this.showImportModal.set(false);
    this.isImporting.set(false);
    this.importError.set('');
    this.importSuccess.set(false);
    this.selectedFile.set(null);
    this.detectedColumns.set([]);
    this.previewData.set([]);
    this.parsedFileData = [];
    this.showCreateListFromImport.set(false);
    this.newListName = '';
    this.listError.set('');
    this.totalContactsFound.set(0);
  }

  resetFileSelection() {
    this.selectedFile.set(null);
    this.detectedColumns.set([]);
    this.previewData.set([]);
    this.parsedFileData = [];
    this.totalContactsFound.set(0);
  }

  createListFromImport() {
    const userId = this.authService.currentUser()?.id;
    if (!userId || !this.newListName.trim()) return;

    this.isSavingList.set(true);
    this.listError.set('');

    this.contactService.createContactList({ name: this.newListName.trim(), ownerId: userId }).subscribe({
      next: (newList) => {
        this.contactService.addContactListToSignal(newList);
        this.selectedImportListId = newList.id;
        this.showCreateListFromImport.set(false);
        this.newListName = '';
        this.isSavingList.set(false);
      },
      error: (err: any) => {
        this.listError.set(err.error?.message || 'Error al crear la lista');
        this.isSavingList.set(false);
      }
    });
  }

  cancelCreateListFromImport() {
    this.showCreateListFromImport.set(false);
    this.newListName = '';
    this.listError.set('');
  }

  isFileValid(): boolean {
    return this.selectedFile() !== null && 
           this.detectedColumns().length > 0 &&
           this.hasRequiredColumns();
  }

  hasRequiredColumns(): boolean {
    const columns = this.detectedColumns().map(c => c.toLowerCase());
    return columns.includes('email');
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedFile.set(file);
    this.importError.set('');

    try {
      const data = await this.parseFile(file);
      this.parsedFileData = data;
      this.totalContactsFound.set(data.length);
      
      if (data.length === 0) {
        this.importError.set('El archivo está vacío o no contiene datos válidos');
        this.resetFileSelection();
        return;
      }

      const columns = Object.keys(data[0]);
      this.detectedColumns.set(columns);
      this.previewData.set(data.slice(0, 3));

      if (!this.hasRequiredColumns()) {
        this.importError.set('El archivo debe contener la columna "email" obligatoriamente');
      }
    } catch (error: any) {
      this.importError.set('Error al leer el archivo: ' + (error.message || 'Formato no válido'));
      this.resetFileSelection();
    }
  }

  private parseFile(file: File): Promise<ParsedContact[]> {
    return new Promise((resolve, reject) => {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as ParsedContact[];
            const cleanedData = data.map(row => {
              const cleaned: ParsedContact = { email: '', name: '' };
              Object.keys(row).forEach(key => {
                const cleanKey = key.trim().toLowerCase();
                const cleanValue = String(row[key] || '').trim();
                if (cleanKey === 'email') cleaned.email = cleanValue;
                if (cleanKey === 'name') cleaned.name = cleanValue;
              });
              return cleaned;
            }).filter(row => row.email || row.name);
            resolve(cleanedData);
          },
          error: (error) => reject(error)
        });
      } else if (extension === 'xlsx' || extension === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];
            
            const cleanedData = jsonData.map(row => {
              const cleaned: ParsedContact = { email: '', name: '' };
              Object.keys(row).forEach(key => {
                const cleanKey = key.trim().toLowerCase();
                const cleanValue = String(row[key] || '').trim();
                if (cleanKey === 'email') cleaned.email = cleanValue;
                if (cleanKey === 'name') cleaned.name = cleanValue;
              });
              return cleaned;
            }).filter(row => row.email || row.name);
            resolve(cleanedData);
          } catch (error: any) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Formato de archivo no soportado'));
      }
    });
  }

  handleFileUpload() {
    if (!this.selectedFile() || !this.selectedImportListId) {
      this.importError.set('Por favor selecciona un archivo y una lista de destino');
      return;
    }

    if (!this.hasRequiredColumns()) {
      this.importError.set('El archivo debe contener la columna "email"');
      return;
    }

    this.isImporting.set(true);
    this.importError.set('');

    const ownerId = this.authService.currentUser()?.id;
    if (!ownerId) {
      this.importError.set('Error: Usuario no autenticado');
      this.isImporting.set(false);
      return;
    }

    const formData = new FormData();
    formData.append('listId', this.selectedImportListId);
    formData.append('ownerId', ownerId);
    formData.append('file', this.selectedFile()!);

    this.importService.importFromFile(this.selectedImportListId, ownerId, this.selectedFile()!).subscribe({
      next: (contacts: any[]) => {
        console.log('Importación exitosa:', contacts.length, 'contactos importados');
        this.isImporting.set(false);
        this.importSuccess.set(true);
        this.loadContacts(this.selectedImportListId);
        this.loadContactLists();
      },
      error: (err: any) => {
        console.error('Error importing file:', err);
        this.isImporting.set(false);
        this.importError.set(err.error?.message || 'Error al importar el archivo');
      }
    });
  }

  selectImportList(listId: string) {
    this.selectedImportListId = listId;
  }
}
