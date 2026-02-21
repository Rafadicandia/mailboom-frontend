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
    <div class="max-w-5xl mx-auto py-8 px-6">
      <!-- Header estilo Notion limpio -->
      <div class="mb-10">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-3xl font-semibold" style="color: #37352F;">Audiencias</h1>
            </div>
            <p class="text-base" style="color: #787774;">Gestiona tus listas de contactos</p>
          </div>
          <div class="flex gap-3">
            <button (click)="openImportModal()"
                    class="inline-flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm font-medium hover:bg-[#EBEBEA]"
                    style="background-color: #F7F6F3; color: #37352F;">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              Importar CSV/Excel
            </button>
            <button (click)="openCreateListModal()"
                    class="inline-flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
                    style="background-color: #37352F; color: white;">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nueva Lista
            </button>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-5 w-5" style="border: 2px solid #E9E9E7; border-top-color: #37352F;"></div>
        </div>
      } @else if (contactLists().length === 0) {
        <!-- Empty State estilo Notion -->
        <div class="py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 class="text-base font-medium mb-2" style="color: #37352F;">No tienes audiencias aún</h3>
          <p class="text-sm mb-6" style="color: #787774;">Crea tu primera lista de contactos para comenzar a enviar campañas</p>
          <button (click)="openCreateListModal()"
                  class="inline-flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
                  style="background-color: #37352F; color: white;">
            Crear mi primera audiencia
          </button>
        </div>
      } @else {
        <!-- Stats Grid estilo Notion sin bordes -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div class="group cursor-default">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <span class="text-sm" style="color: #787774;">Listas</span>
            </div>
            <p class="text-2xl font-semibold" style="color: #37352F;">{{ contactLists().length }}</p>
          </div>

          <div class="group cursor-default">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <span class="text-sm" style="color: #787774;">Contactos</span>
            </div>
            <p class="text-2xl font-semibold" style="color: #9065B0;">{{ getTotalContacts() }}</p>
          </div>

          <div class="group cursor-default">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <span class="text-sm" style="color: #787774;">Campañas</span>
            </div>
            <p class="text-2xl font-semibold" style="color: #0F7B6C;">{{ getCampaignsCount() }}</p>
          </div>

          <div class="group cursor-default">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-sm" style="color: #787774;">Suscritos</span>
            </div>
            <p class="text-2xl font-semibold" style="color: #37352F;">{{ getSubscribedCount() }}</p>
          </div>
        </div>

        <!-- Lista de audiencias estilo Notion -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium" style="color: #37352F;">Todas las Audiencias</h2>
            <button (click)="loadContactLists()" class="text-sm hover:underline" style="color: #787774;">
              Actualizar
            </button>
          </div>
          
          <div class="space-y-1">
            @for (list of contactLists(); track list.id) {
              <div class="rounded-lg transition-colors">
                <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: rgba(144, 101, 176, 0.15);">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #9065B0;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate" style="color: #37352F;">{{ list.name }}</p>
                      <p class="text-xs" style="color: #9B9A97;">{{ getContactCount(list) }} contactos · Creada {{ list.createdAt | date:'dd/MM/yyyy' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <button (click)="toggleContacts(list)"
                            class="text-xs hover:underline"
                            style="color: #529CCA;">
                      {{ expandedListId() === list.id ? 'Ocultar' : 'Ver' }}
                    </button>
                    <a routerLink="/campaigns/new" [queryParams]="{listId: list.id}"
                       class="text-xs px-3 py-1.5 rounded transition-colors hover:bg-[#EBEBEA]"
                       style="background-color: #F7F6F3; color: #37352F;">
                      Crear campaña
                    </a>
                    <button (click)="editList(list)"
                            class="text-xs hover:underline"
                            style="color: #787774;">
                      Editar
                    </button>
                    <button (click)="deleteList(list)"
                            class="text-xs hover:underline"
                            style="color: #E03E3E;">
                      Eliminar
                    </button>
                  </div>
                </div>

                <!-- Contactos expandidos -->
                @if (expandedListId() === list.id) {
                  <div class="ml-11 mt-2 mb-2 p-4 rounded-lg" style="background-color: #F7F6F3;">
                    <div class="flex flex-col sm:flex-row gap-3 mb-4">
                      <div class="relative flex-1">
                        <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #9B9A97;">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input type="text" 
                               [(ngModel)]="searchTerm"
                               placeholder="Buscar contactos..."
                               class="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none"
                               style="background-color: white; border: 1px solid #E9E9E7; color: #37352F;">
                      </div>
                      <button (click)="openAddContactModal(list.id)"
                              class="inline-flex items-center px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                              style="background-color: #37352F; color: white;">
                        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Agregar
                      </button>
                    </div>

                    @if (isLoadingContacts()) {
                      <div class="flex justify-center py-8">
                        <div class="animate-spin rounded-full h-5 w-5" style="border: 2px solid #E9E9E7; border-top-color: #37352F;"></div>
                      </div>
                    } @else if (filteredContacts().length === 0) {
                      <div class="text-center py-8" style="color: #787774;">
                        @if (contacts().length === 0) {
                          <p class="text-sm">No hay contactos en esta lista</p>
                          <button (click)="openAddContactModal(list.id)" class="text-sm hover:underline mt-2" style="color: #529CCA;">
                            Agregar el primer contacto
                          </button>
                        } @else {
                          <p class="text-sm">No se encontraron resultados para "{{ searchTerm }}"</p>
                        }
                      </div>
                    } @else {
                      <div class="overflow-x-auto rounded-lg" style="background-color: white; border: 1px solid #E9E9E7;">
                        <table class="w-full">
                          <thead>
                            <tr style="border-bottom: 1px solid #E9E9E7;">
                              <th class="px-4 py-2 text-left text-xs font-medium" style="color: #787774;">Email</th>
                              <th class="px-4 py-2 text-left text-xs font-medium" style="color: #787774;">Nombre</th>
                              <th class="px-4 py-2 text-left text-xs font-medium" style="color: #787774;">Estado</th>
                              <th class="px-4 py-2 text-right text-xs font-medium" style="color: #787774;">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (contact of filteredContacts(); track $index) {
                              <tr class="transition-colors hover:bg-[#F7F6F3]" style="border-bottom: 1px solid #E9E9E7;">
                                <td class="px-4 py-2.5 text-sm" style="color: #37352F;">{{ contact.email }}</td>
                                <td class="px-4 py-2.5 text-sm" style="color: #787774;">{{ contact.name || '-' }}</td>
                                <td class="px-4 py-2.5 text-sm">
                                  @if (contact.subscribed) {
                                    <span class="text-xs px-2 py-0.5 rounded" style="background-color: rgba(15, 123, 108, 0.15); color: #0F7B6C;">Suscrito</span>
                                  } @else {
                                    <span class="text-xs px-2 py-0.5 rounded" style="background-color: #F7F6F3; color: #787774;">No suscrito</span>
                                  }
                                </td>
                                <td class="px-4 py-2.5 text-sm text-right">
                                  <div class="flex justify-end gap-2">
                                    <button (click)="editContact(contact)"
                                            class="text-xs hover:underline"
                                            style="color: #529CCA;">
                                      Editar
                                    </button>
                                    <button (click)="deleteContact(contact)"
                                            class="text-xs hover:underline"
                                            style="color: #E03E3E;">
                                      Eliminar
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

          <!-- Paginación estilo Notion limpio -->
          @if (contactService.totalPages() > 1) {
            <div class="flex justify-center items-center gap-3 mt-6 text-sm">
              <button 
                (click)="changePage(contactService.currentPage() - 1)" 
                [disabled]="contactService.currentPage() === 0"
                class="px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F6F3]"
                style="color: #787774;">
                ←
              </button>
              <span style="color: #9B9A97;">
                {{ contactService.currentPage() + 1 }} / {{ contactService.totalPages() }}
              </span>
              <button 
                (click)="changePage(contactService.currentPage() + 1)" 
                [disabled]="contactService.currentPage() >= contactService.totalPages() - 1"
                class="px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F6F3]"
                style="color: #787774;">
                →
              </button>
            </div>
          }
        </div>
      }

      <!-- Modal Crear/Editar Lista estilo Notion -->
      @if (showListModal()) {
        <div class="fixed inset-0 flex items-center justify-center z-50" style="background-color: rgba(0, 0, 0, 0.4);" (click)="closeListModal()">
          <div class="w-full max-w-md overflow-hidden rounded-lg" style="background-color: white;" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between p-4" style="border-bottom: 1px solid #E9E9E7;">
              <div>
                <h3 class="text-base font-medium" style="color: #37352F;">{{ isEditingList() ? 'Editar Lista' : 'Nueva Lista' }}</h3>
                <p class="text-xs" style="color: #787774;">{{ isEditingList() ? 'Modifica los datos de tu lista' : 'Crea una nueva lista de contactos' }}</p>
              </div>
              <button (click)="closeListModal()" class="p-1.5 rounded transition-colors hover:bg-[#F7F6F3]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #9B9A97;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1" style="color: #37352F;">Nombre de la lista</label>
                <input type="text" [(ngModel)]="listName"
                       class="w-full px-4 py-2 text-sm rounded-lg focus:outline-none"
                       style="border: 1px solid #E9E9E7; color: #37352F;"
                       placeholder="Ej: Newsletter Febrero 2025">
              </div>
              @if (listError()) {
                <div class="p-3 rounded-lg" style="background-color: rgba(224, 62, 62, 0.1);">
                  <p class="text-sm" style="color: #E03E3E;">{{ listError() }}</p>
                </div>
              }
            </div>
            <div class="flex justify-end gap-2 p-4" style="border-top: 1px solid #E9E9E7;">
              <button (click)="closeListModal()"
                      class="px-4 py-2 rounded text-sm transition-colors hover:bg-[#F7F6F3]"
                      style="color: #37352F;">
                Cancelar
              </button>
              <button (click)="saveList()"
                      [disabled]="!listName.trim() || isSavingList()"
                      class="px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style="background-color: #37352F; color: white;">
                @if (isSavingList()) {
                  <span class="inline-flex items-center">
                    <svg class="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                } @else {
                  Guardar
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Crear/Editar Contacto estilo Notion -->
      @if (showContactModal()) {
        <div class="fixed inset-0 flex items-center justify-center z-50" style="background-color: rgba(0, 0, 0, 0.4);" (click)="closeContactModal()">
          <div class="w-full max-w-md overflow-hidden rounded-lg" style="background-color: white;" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between p-4" style="border-bottom: 1px solid #E9E9E7;">
              <div>
                <h3 class="text-base font-medium" style="color: #37352F;">{{ isEditingContact() ? 'Editar Contacto' : 'Nuevo Contacto' }}</h3>
                <p class="text-xs" style="color: #787774;">{{ isEditingContact() ? 'Modifica los datos del contacto' : 'Agrega un nuevo contacto a tu lista' }}</p>
              </div>
              <button (click)="closeContactModal()" class="p-1.5 rounded transition-colors hover:bg-[#F7F6F3]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #9B9A97;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1" style="color: #37352F;">Email <span style="color: #E03E3E;">*</span></label>
                <input type="email" [(ngModel)]="contactEmail"
                       class="w-full px-4 py-2 text-sm rounded-lg focus:outline-none"
                       style="border: 1px solid #E9E9E7; color: #37352F;"
                       placeholder="correo@ejemplo.com">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: #37352F;">Nombre</label>
                <input type="text" [(ngModel)]="contactName"
                       class="w-full px-4 py-2 text-sm rounded-lg focus:outline-none"
                       style="border: 1px solid #E9E9E7; color: #37352F;"
                       placeholder="Nombre opcional">
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="contactSubscribed" 
                       id="subscribed" class="w-4 h-4 rounded" style="accent-color: #37352F;">
                <label for="subscribed" class="text-sm" style="color: #37352F;">Suscrito</label>
              </div>
              @if (contactError()) {
                <div class="p-3 rounded-lg" style="background-color: rgba(224, 62, 62, 0.1);">
                  <p class="text-sm" style="color: #E03E3E;">{{ contactError() }}</p>
                </div>
              }
            </div>
            <div class="flex justify-end gap-2 p-4" style="border-top: 1px solid #E9E9E7;">
              <button (click)="closeContactModal()"
                      class="px-4 py-2 rounded text-sm transition-colors hover:bg-[#F7F6F3]"
                      style="color: #37352F;">
                Cancelar
              </button>
              <button (click)="saveContact()"
                      [disabled]="!contactEmail.trim() || isSavingContact()"
                      class="px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style="background-color: #37352F; color: white;">
                @if (isSavingContact()) {
                  <span class="inline-flex items-center">
                    <svg class="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                } @else {
                  Guardar
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Importar CSV/Excel estilo Notion -->
      @if (showImportModal()) {
        <div class="fixed inset-0 flex items-center justify-center z-50" style="background-color: rgba(0, 0, 0, 0.4);" (click)="closeImportModal()">
          <div class="w-full max-w-lg overflow-hidden rounded-lg" style="background-color: white;" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between p-4" style="border-bottom: 1px solid #E9E9E7;">
              <div>
                <h3 class="text-base font-medium" style="color: #37352F;">Importar Contactos</h3>
                <p class="text-xs" style="color: #787774;">Sube un archivo CSV o Excel con tus contactos</p>
              </div>
              <button (click)="closeImportModal()" class="p-1.5 rounded transition-colors hover:bg-[#F7F6F3]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #9B9A97;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div class="p-4 space-y-4">
              @if (importSuccess()) {
                <div class="p-4 rounded-lg" style="background-color: rgba(15, 123, 108, 0.1);">
                  <div class="flex items-center gap-2" style="color: #0F7B6C;">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="font-medium text-sm">¡Importación exitosa!</span>
                  </div>
                  <p class="text-sm mt-1" style="color: #0F7B6C;">Los contactos han sido importados correctamente.</p>
                </div>
              } @else {
                @if (!isFileValid()) {
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: #37352F;">Archivo CSV o Excel</label>
                    <div class="rounded-lg p-6 text-center transition-colors cursor-pointer" 
                         style="border: 2px dashed #E9E9E7;">
                      <input type="file" 
                             (change)="onFileSelected($event)" 
                             accept=".csv,.xlsx,.xls"
                             class="hidden" 
                             id="file-upload">
                      <label for="file-upload" class="cursor-pointer">
                        <svg class="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #9B9A97;">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <p class="text-sm" style="color: #37352F;">
                          @if (selectedFile()) {
                            {{ selectedFile()?.name }}
                          } @else {
                            Haz clic para seleccionar un archivo
                          }
                        </p>
                        <p class="text-xs mt-1" style="color: #9B9A97;">Archivos soportados: CSV, Excel (.xlsx, .xls)</p>
                      </label>
                    </div>
                  </div>
                } @else {
                  <div class="space-y-4">
                    <div class="flex items-center gap-2 text-sm p-3 rounded-lg" style="background-color: #F7F6F3; color: #37352F;">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <span>Archivo: <strong>{{ selectedFile()?.name }}</strong></span>
                      <button (click)="resetFileSelection()" class="text-sm hover:underline ml-auto" style="color: #529CCA;">
                        Cambiar archivo
                      </button>
                    </div>

                    <!-- Selección de lista -->
                    <div>
                      <label class="block text-sm font-medium mb-2" style="color: #37352F;">Lista de destino</label>
                      @if (showCreateListFromImport()) {
                        <!-- Formulario para crear nueva lista -->
                        <div class="flex gap-2">
                          <input type="text" 
                                 [(ngModel)]="newListName"
                                 class="flex-1 px-4 py-2 text-sm rounded-lg focus:outline-none"
                                 style="border: 1px solid #E9E9E7; color: #37352F;"
                                 placeholder="Nombre de la nueva lista">
                          <button (click)="createListFromImport()"
                                  [disabled]="!newListName.trim() || isSavingList()"
                                  class="px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40"
                                  style="background-color: #37352F; color: white;">
                            {{ isSavingList() ? 'Guardando...' : 'Crear' }}
                          </button>
                          <button (click)="cancelCreateListFromImport()"
                                  class="px-4 py-2 rounded text-sm transition-colors hover:bg-[#F7F6F3]"
                                  style="color: #37352F;">
                            Cancelar
                          </button>
                        </div>
                        @if (listError()) {
                          <p class="text-sm mt-2" style="color: #E03E3E;">{{ listError() }}</p>
                        }
                      } @else {
                        <div class="flex gap-2">
                          <select [(ngModel)]="selectedImportListId" 
                                  class="flex-1 px-4 py-2 text-sm rounded-lg focus:outline-none"
                                  style="border: 1px solid #E9E9E7; color: #37352F;">
                            <option value="">Selecciona una lista...</option>
                            @for (list of contactLists(); track list.id) {
                              <option [value]="list.id">{{ list.name }}</option>
                            }
                          </select>
                          <button (click)="showCreateListFromImport.set(true)"
                                  class="inline-flex items-center px-4 py-2 rounded text-sm font-medium transition-colors"
                                  style="background-color: #37352F; color: white;">
                            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            Nueva
                          </button>
                        </div>
                      }
                    </div>

                    <div>
                      <label class="block text-sm font-medium mb-2" style="color: #37352F;">Columnas detectadas</label>
                      <div class="flex flex-wrap gap-2">
                        @for (column of detectedColumns(); track column) {
                          <span class="text-xs px-2 py-1 rounded" style="background-color: rgba(144, 101, 176, 0.15); color: #9065B0;">
                            {{ column }}
                          </span>
                        }
                      </div>
                      <p class="text-sm mt-2" style="color: #787774;">{{ totalContactsFound() }} contactos encontrados</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium mb-2" style="color: #37352F;">Vista previa (primeros 3 registros)</label>
                      <div class="overflow-x-auto rounded-lg" style="border: 1px solid #E9E9E7;">
                        <table class="w-full text-sm">
                          <thead>
                            <tr style="background-color: #F7F6F3; border-bottom: 1px solid #E9E9E7;">
                              <th class="px-3 py-2 text-left text-xs font-medium" style="color: #787774;">Email</th>
                              <th class="px-3 py-2 text-left text-xs font-medium" style="color: #787774;">Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (row of previewData(); track $index) {
                              <tr class="transition-colors hover:bg-[#F7F6F3]" style="border-bottom: 1px solid #E9E9E7;">
                                <td class="px-3 py-2" style="color: #37352F;">{{ row.email || '-' }}</td>
                                <td class="px-3 py-2" style="color: #787774;">{{ row.name || '-' }}</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div class="p-3 rounded-lg" style="background-color: rgba(82, 156, 202, 0.1);">
                      <p class="text-sm" style="color: #529CCA;">
                        El archivo será procesado por el backend. Asegúrate de que la columna "email" exista en el archivo.
                      </p>
                    </div>
                  </div>
                }

                @if (importError()) {
                  <div class="p-3 rounded-lg" style="background-color: rgba(224, 62, 62, 0.1);">
                    <p class="text-sm" style="color: #E03E3E;">{{ importError() }}</p>
                  </div>
                }
              }
            </div>
            
            <div class="flex justify-end gap-2 p-4" style="border-top: 1px solid #E9E9E7;">
              <button (click)="closeImportModal()"
                      class="px-4 py-2 rounded text-sm transition-colors hover:bg-[#F7F6F3]"
                      style="color: #37352F;">
                {{ importSuccess() ? 'Cerrar' : 'Cancelar' }}
              </button>
              @if (!importSuccess() && isFileValid()) {
                <button (click)="handleFileUpload()"
                        [disabled]="!selectedImportListId || isImporting()"
                        class="px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style="background-color: #0F7B6C; color: white;">
                  @if (isImporting()) {
                    <span class="inline-flex items-center">
                      <svg class="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importando...
                    </span>
                  } @else {
                    Importar contactos
                  }
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

  getTotalContacts(): number {
    return this.contactLists().reduce((total, list) => total + this.getContactCount(list), 0);
  }

  getCampaignsCount(): number {
    // This could be enhanced to show actual campaigns count per list
    return this.contactLists().length;
  }

  getSubscribedCount(): number {
    // This could be enhanced to show actual subscribed contacts
    return this.getTotalContacts();
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
