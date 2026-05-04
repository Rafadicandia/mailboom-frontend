import { 
  Component, 
  Output, 
  EventEmitter, 
  Input, 
  OnInit, 
  signal, 
  ViewChild,
  computed,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EmailDesign, EditorMode, HeaderConfig, FooterConfig } from '../templates/template.model';
import { 
  EmailEditorComponent, 
  EmailDocument,
  PRESET_COLORS,
  EMAIL_FONTS,
  SelectedBlock
} from '../editor';

/**
 * Componente de paso de diseño con editor de bloques estilo Notion
 * Utiliza TipTap como motor de edición con nodos personalizados para email
 */
@Component({
  selector: 'app-design-step',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    EmailEditorComponent
  ],
  template: `
    <div class="design-step-container h-full flex flex-col">
      
      <!-- Selector de Modo -->
      <div class="bg-white border-b border-gray-200 p-4">
        <h3 class="text-sm font-medium text-gray-700 mb-3">¿Cómo quieres crear tu email?</h3>
        <div class="flex gap-4">
          <label class="flex-1 cursor-pointer">
            <input type="radio" [(ngModel)]="mode" value="template" class="sr-only peer" (change)="onModeChange()">
            <div class="p-4 bg-white border-2 border-gray-200 rounded-lg peer-checked:border-indigo-600 peer-checked:bg-indigo-50 text-center transition-all">
              <svg class="w-8 h-8 mx-auto mb-2 text-gray-400 peer-checked:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span class="text-sm font-medium text-gray-900">Editor de bloques</span>
              <p class="text-xs text-gray-500 mt-1">Estilo Notion, arrastra y suelta</p>
            </div>
          </label>
          
          <label class="flex-1 cursor-pointer">
            <input type="radio" [(ngModel)]="mode" value="custom-html" class="sr-only peer" (change)="onModeChange()">
            <div class="p-4 bg-white border-2 border-gray-200 rounded-lg peer-checked:border-indigo-600 peer-checked:bg-indigo-50 text-center transition-all">
              <svg class="w-8 h-8 mx-auto mb-2 text-gray-400 peer-checked:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span class="text-sm font-medium text-gray-900">HTML propio</span>
              <p class="text-xs text-gray-500 mt-1">Pega tu código HTML</p>
            </div>
          </label>
        </div>
      </div>

      <!-- MODO: Editor de bloques -->
      @if (mode() === 'template') {
        <div class="flex-1 flex gap-4 p-4 overflow-hidden">
          
          <!-- Panel de configuración lateral -->
          <div class="w-72 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
            @if (selectedBlock()) {
              <!-- Configuración del bloque seleccionado -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ getBlockIcon(selectedBlock()!.type) }}</span>
                  <h4 class="text-sm font-semibold text-gray-900">{{ getBlockTypeName(selectedBlock()!.type) }}</h4>
                </div>
                <button type="button" 
                        (click)="clearBlockSelection()"
                        class="text-gray-400 hover:text-gray-600 p-1"
                        title="Cerrar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              <!-- Configuración específica del botón -->
              @if (selectedBlock()!.type === 'buttonNode') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Texto del botón</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['text']"
                           (ngModelChange)="updateBlock({text: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">URL del enlace</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['url']"
                           (ngModelChange)="updateBlock({url: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                           placeholder="https://...">
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Color de fondo</label>
                      <input type="color" 
                             [ngModel]="selectedBlock()!.attrs['backgroundColor']"
                             (ngModelChange)="updateBlock({backgroundColor: $event})"
                             class="w-full h-10 rounded cursor-pointer border border-gray-200">
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Color del texto</label>
                      <input type="color" 
                             [ngModel]="selectedBlock()!.attrs['textColor']"
                             (ngModelChange)="updateBlock({textColor: $event})"
                             class="w-full h-10 rounded cursor-pointer border border-gray-200">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Redondeado (px)</label>
                    <input type="number" 
                           [ngModel]="selectedBlock()!.attrs['borderRadius']"
                           (ngModelChange)="updateBlock({borderRadius: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                           min="0" max="50">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Alineación</label>
                    <div class="flex gap-2">
                      <button type="button" 
                              (click)="updateBlock({align: 'left'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'left'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Izq</button>
                      <button type="button" 
                              (click)="updateBlock({align: 'center'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'center'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Centro</button>
                      <button type="button" 
                              (click)="updateBlock({align: 'right'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'right'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Der</button>
                    </div>
                  </div>
                  <button type="button"
                          (click)="deleteBlock()"
                          class="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                    Eliminar bloque
                  </button>
                </div>
              }
              
              <!-- Configuración específica de imagen -->
              @if (selectedBlock()!.type === 'imageNode') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">URL de la imagen</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['src']"
                           (ngModelChange)="updateBlock({src: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                           placeholder="https://...">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Texto alternativo (alt)</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['alt']"
                           (ngModelChange)="updateBlock({alt: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Enlace (al hacer clic)</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['link']"
                           (ngModelChange)="updateBlock({link: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                           placeholder="https://...">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Ancho</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['width']"
                           (ngModelChange)="updateBlock({width: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                           placeholder="100%">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Alineación</label>
                    <div class="flex gap-2">
                      <button type="button" 
                              (click)="updateBlock({align: 'left'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'left'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Izq</button>
                      <button type="button" 
                              (click)="updateBlock({align: 'center'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'center'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Centro</button>
                      <button type="button" 
                              (click)="updateBlock({align: 'right'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'right'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Der</button>
                    </div>
                  </div>
                  <button type="button"
                          (click)="deleteBlock()"
                          class="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                    Eliminar bloque
                  </button>
                </div>
              }
              
              <!-- Configuración de header -->
              @if (selectedBlock()!.type === 'headerNode') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Tipo</label>
                    <div class="flex gap-2 mb-2">
                      <button type="button" 
                              (click)="updateBlock({useImage: false})"
                              [class.bg-indigo-100]="!selectedBlock()!.attrs['useImage']"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Texto</button>
                      <button type="button" 
                              (click)="updateBlock({useImage: true})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['useImage']"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Logo</button>
                    </div>
                  </div>
                  @if (selectedBlock()!.attrs['useImage']) {
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">URL del logo</label>
                      <input type="text" 
                             [ngModel]="selectedBlock()!.attrs['logoUrl']"
                             (ngModelChange)="updateBlock({logoUrl: $event})"
                             class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Ancho del logo</label>
                      <input type="text" 
                             [ngModel]="selectedBlock()!.attrs['logoWidth']"
                             (ngModelChange)="updateBlock({logoWidth: $event})"
                             class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    </div>
                  } @else {
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Texto</label>
                      <input type="text" 
                             [ngModel]="selectedBlock()!.attrs['text']"
                             (ngModelChange)="updateBlock({text: $event})"
                             class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Color del texto</label>
                      <input type="color" 
                             [ngModel]="selectedBlock()!.attrs['textColor']"
                             (ngModelChange)="updateBlock({textColor: $event})"
                             class="w-full h-10 rounded cursor-pointer border border-gray-200">
                    </div>
                  }
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Color de fondo</label>
                    <input type="color" 
                           [ngModel]="selectedBlock()!.attrs['backgroundColor']"
                           (ngModelChange)="updateBlock({backgroundColor: $event})"
                           class="w-full h-10 rounded cursor-pointer border border-gray-200">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Alineación</label>
                    <div class="flex gap-2">
                      <button type="button" 
                              (click)="updateBlock({align: 'left'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'left'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Izq</button>
                      <button type="button" 
                              (click)="updateBlock({align: 'center'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'center'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Centro</button>
                      <button type="button" 
                              (click)="updateBlock({align: 'right'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'right'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Der</button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Padding</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['padding']"
                           (ngModelChange)="updateBlock({padding: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  </div>
                  <button type="button"
                          (click)="deleteBlock()"
                          class="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                    Eliminar bloque
                  </button>
                </div>
              }
              
              <!-- Configuración de footer -->
              @if (selectedBlock()!.type === 'footerNode') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Nombre de empresa</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['companyName']"
                           (ngModelChange)="updateBlock({companyName: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Dirección</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['address']"
                           (ngModelChange)="updateBlock({address: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Teléfono</label>
                      <input type="text" 
                             [ngModel]="selectedBlock()!.attrs['phone']"
                             (ngModelChange)="updateBlock({phone: $event})"
                             class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Email</label>
                      <input type="text" 
                             [ngModel]="selectedBlock()!.attrs['email']"
                             (ngModelChange)="updateBlock({email: $event})"
                             class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Sitio web</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['website']"
                           (ngModelChange)="updateBlock({website: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  </div>
                  <div class="flex items-center gap-2">
                    <input type="checkbox" 
                           [ngModel]="selectedBlock()!.attrs['showUnsubscribe']"
                           (ngModelChange)="updateBlock({showUnsubscribe: $event})"
                           class="rounded border-gray-300">
                    <span class="text-sm text-gray-700">Mostrar enlace de baja</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Color de fondo</label>
                      <input type="color" 
                             [ngModel]="selectedBlock()!.attrs['backgroundColor']"
                             (ngModelChange)="updateBlock({backgroundColor: $event})"
                             class="w-full h-10 rounded cursor-pointer border border-gray-200">
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Color del texto</label>
                      <input type="color" 
                             [ngModel]="selectedBlock()!.attrs['textColor']"
                             (ngModelChange)="updateBlock({textColor: $event})"
                             class="w-full h-10 rounded cursor-pointer border border-gray-200">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Alineación</label>
                    <div class="flex gap-2">
                      <button type="button" 
                              (click)="updateBlock({align: 'left'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'left'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Izq</button>
                      <button type="button" 
                              (click)="updateBlock({align: 'center'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'center'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Centro</button>
                      <button type="button" 
                              (click)="updateBlock({align: 'right'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'right'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Der</button>
                    </div>
                  </div>
                  <button type="button"
                          (click)="deleteBlock()"
                          class="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                    Eliminar bloque
                  </button>
                </div>
              }
              
              <!-- Configuración de divisor -->
              @if (selectedBlock()!.type === 'dividerNode') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Color</label>
                    <input type="color" 
                           [ngModel]="selectedBlock()!.attrs['color']"
                           (ngModelChange)="updateBlock({color: $event})"
                           class="w-full h-10 rounded cursor-pointer border border-gray-200">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Estilo</label>
                    <select [ngModel]="selectedBlock()!.attrs['style']"
                            (ngModelChange)="updateBlock({style: $event})"
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option value="solid">Sólido</option>
                      <option value="dashed">Discontinuo</option>
                      <option value="dotted">Punteado</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Padding</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['padding']"
                           (ngModelChange)="updateBlock({padding: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  </div>
                  <button type="button"
                          (click)="deleteBlock()"
                          class="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                    Eliminar bloque
                  </button>
                </div>
              }
              
              <!-- Configuración de espaciador -->
              @if (selectedBlock()!.type === 'spacerNode') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Altura</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['height']"
                           (ngModelChange)="updateBlock({height: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                           placeholder="40px">
                  </div>
                  <button type="button"
                          (click)="deleteBlock()"
                          class="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                    Eliminar bloque
                  </button>
                </div>
              }
              
              <!-- Configuración de redes sociales -->
              @if (selectedBlock()!.type === 'socialNode') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Tamaño de iconos</label>
                    <input type="number" 
                           [ngModel]="selectedBlock()!.attrs['iconSize']"
                           (ngModelChange)="updateBlock({iconSize: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                           min="16" max="64">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Espaciado</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['iconSpacing']"
                           (ngModelChange)="updateBlock({iconSpacing: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Alineación</label>
                    <div class="flex gap-2">
                      <button type="button" 
                              (click)="updateBlock({align: 'left'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'left'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Izq</button>
                      <button type="button" 
                              (click)="updateBlock({align: 'center'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'center'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Centro</button>
                      <button type="button" 
                              (click)="updateBlock({align: 'right'})"
                              [class.bg-indigo-100]="selectedBlock()!.attrs['align'] === 'right'"
                              class="flex-1 px-3 py-2 text-sm border rounded-lg">Der</button>
                    </div>
                  </div>
                  <button type="button"
                          (click)="deleteBlock()"
                          class="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                    Eliminar bloque
                  </button>
                </div>
              }
              
              <!-- Configuración de columnas -->
              @if (selectedBlock()!.type === 'columnsNode') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Espacio entre columnas</label>
                    <input type="text" 
                           [ngModel]="selectedBlock()!.attrs['gap']"
                           (ngModelChange)="updateBlock({gap: $event})"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Color de fondo</label>
                    <input type="color" 
                           [ngModel]="selectedBlock()!.attrs['backgroundColor']"
                           (ngModelChange)="updateBlock({backgroundColor: $event})"
                           class="w-full h-10 rounded cursor-pointer border border-gray-200">
                  </div>
                  <button type="button"
                          (click)="deleteBlock()"
                          class="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                    Eliminar bloque
                  </button>
                </div>
              }
            } @else {
              <!-- Configuración global del email -->
              <h4 class="text-sm font-semibold text-gray-900 mb-4">Configuración del email</h4>
              
              <!-- Color de fondo -->
              <div class="mb-4">
                <label class="block text-xs text-gray-500 mb-1">Color de fondo</label>
                <div class="flex items-center gap-2">
                  <input type="color" 
                         [(ngModel)]="globalStyles.backgroundColor" 
                         (ngModelChange)="onGlobalStylesChange()"
                         class="w-10 h-10 rounded cursor-pointer border border-gray-200">
                  <span class="text-sm text-gray-600">{{ globalStyles.backgroundColor }}</span>
                </div>
              </div>
              
              <!-- Ancho máximo -->
              <div class="mb-4">
                <label class="block text-xs text-gray-500 mb-1">Ancho máximo (px)</label>
                <input type="number" 
                       [(ngModel)]="globalStyles.maxWidth" 
                       (ngModelChange)="onGlobalStylesChange()"
                       class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                       min="400" max="800" step="10">
              </div>
              
              <!-- Fuente -->
              <div class="mb-4">
                <label class="block text-xs text-gray-500 mb-1">Fuente principal</label>
                <select [(ngModel)]="globalStyles.fontFamily" 
                        (ngModelChange)="onGlobalStylesChange()"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  @for (font of fonts; track font.value) {
                    <option [value]="font.value">{{ font.label }}</option>
                  }
                </select>
              </div>
              
              <!-- Preheader -->
              <div class="mb-4">
                <label class="block text-xs text-gray-500 mb-1">Preheader (texto previo)</label>
                <input type="text" 
                       [(ngModel)]="globalStyles.preheaderText" 
                       (ngModelChange)="onGlobalStylesChange()"
                       class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                       placeholder="Texto que aparece antes de abrir..."
                       maxlength="100">
                <p class="text-xs text-gray-400 mt-1">{{ globalStyles.preheaderText?.length || 0 }}/100 caracteres</p>
              </div>
              
              <hr class="my-4 border-gray-200">
              
              <!-- Ayuda -->
              <div class="bg-indigo-50 rounded-lg p-3">
                <h5 class="text-xs font-semibold text-indigo-900 mb-2">💡 Tips</h5>
                <ul class="text-xs text-indigo-700 space-y-1">
                  <li>• Escribe <kbd class="bg-indigo-100 px-1 rounded">/</kbd> para ver los bloques</li>
                  <li>• Haz clic en un bloque para editarlo</li>
                  <li>• Usa variables como {{"{{name}}"}}, {{"{{email}}"}}</li>
                </ul>
              </div>
            }
          </div>
          
          <!-- Editor principal -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <app-email-editor
              #emailEditor
              [globalStyles]="globalStyles"
              (contentChange)="onContentChange($event)"
              (htmlChange)="onHtmlChange($event)"
              (blockSelect)="onBlockSelect($event)">
            </app-email-editor>
          </div>
          
          <!-- Panel de vista previa -->
          <div class="w-96 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
            <div class="bg-gray-900 px-4 py-2 text-sm font-medium text-white flex items-center justify-between">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Vista previa
              </span>
              <div class="flex items-center gap-1 bg-gray-700 rounded p-0.5">
                <button type="button" 
                        (click)="previewMode.set('desktop')"
                        [class.bg-white]="previewMode() === 'desktop'"
                        [class.text-gray-900]="previewMode() === 'desktop'"
                        class="px-2 py-1 text-xs font-medium rounded transition-all text-gray-300"
                        title="Desktop">
                  🖥️
                </button>
                <button type="button" 
                        (click)="previewMode.set('mobile')"
                        [class.bg-white]="previewMode() === 'mobile'"
                        [class.text-gray-900]="previewMode() === 'mobile'"
                        class="px-2 py-1 text-xs font-medium rounded transition-all text-gray-300"
                        title="Mobile">
                  📱
                </button>
              </div>
            </div>
            <div class="flex-1 bg-gray-100 p-2 overflow-y-auto">
              <iframe [srcdoc]="previewHtml()"
                      [class]="previewMode() === 'desktop' ? 'w-full' : 'w-[320px]'"
                      class="h-full border-0 rounded-lg shadow-sm bg-white transition-all mx-auto block"
                      style="min-height: 500px;"></iframe>
            </div>
          </div>
        </div>
      }

      <!-- MODO: HTML propio -->
      @if (mode() === 'custom-html') {
        <div class="flex-1 flex gap-4 p-4 overflow-hidden">
          <!-- Editor HTML -->
          <div class="flex-1 flex flex-col">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-900">Tu código HTML</h3>
              <button type="button"
                      (click)="formatHtml()"
                      class="text-xs text-indigo-600 hover:text-indigo-700">
                Formatear
              </button>
            </div>
            <textarea [(ngModel)]="customHtml"
                      (ngModelChange)="onCustomHtmlChange()"
                      class="flex-1 w-full p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-lg resize-none border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="<!-- Pega tu HTML aquí -->"></textarea>
            
            <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mt-2 text-sm text-indigo-700">
              💡 Tip: Usa variables como {{"{{name}}"}}, {{"{{email}}"}} para personalizar
            </div>
          </div>
          
          <!-- Vista previa HTML -->
          <div class="w-96 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
            <div class="bg-gray-900 px-4 py-2 text-sm font-medium text-white flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Vista previa
            </div>
            <div class="flex-1 bg-gray-100 p-2 overflow-y-auto">
              <iframe [srcdoc]="getCustomHtmlPreview()"
                      class="w-full h-full border-0 rounded-lg shadow-sm bg-white"
                      style="min-height: 500px;"></iframe>
            </div>
          </div>
        </div>
      }

      <!-- Botones de navegación -->
      <div class="bg-white border-t border-gray-200 px-4 py-3 flex justify-between">
        <button type="button" 
                (click)="onBack.emit()" 
                class="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
          ← Anterior
        </button>
        <button type="button" 
                (click)="continue()" 
                [disabled]="!isValid()"
                class="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors">
          Siguiente: Audiencia →
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    
    kbd {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
  `]
})
export class DesignStepComponent implements OnInit {
  @Input() initialDesign?: EmailDesign | null;
  @Output() onNext = new EventEmitter<EmailDesign>();
  @Output() onBack = new EventEmitter<void>();
  
  @ViewChild('emailEditor') emailEditor!: EmailEditorComponent;
  
  mode = signal<EditorMode>('template');
  previewMode = signal<'desktop' | 'mobile'>('desktop');
  selectedBlock = signal<SelectedBlock | null>(null);
  
  customHtml = '';
  currentContent: any = null;
  currentHtml = signal(''); // HTML generado por el editor
  previewHtml = signal<SafeHtml>('' as SafeHtml); // Signal para el preview
  
  globalStyles = {
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
    maxWidth: 600,
    preheaderText: ''
  };
  
  // Signals para header y footer
  headerConfig = signal<HeaderConfig>({
    enabled: false,
    useImage: false,
    imageUrl: '',
    text: '',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    height: 80
  });
  
  footerConfig = signal<FooterConfig>({
    enabled: false,
    companyName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    socialLinks: {},
    showUnsubscribe: true,
    customText: '',
    backgroundColor: '#f3f4f6',
    textColor: '#6b7280'
  });
  
  // Signal para mostrar diálogos de header/footer
  showHeaderDialog = signal(false);
  showFooterDialog = signal(false);
  
  fonts = EMAIL_FONTS;
  
  constructor(
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}
  
  ngOnInit() {
    if (this.initialDesign) {
      this.applyInitialDesign();
    }
  }
  
  applyInitialDesign() {
    if (!this.initialDesign) return;
    
    this.mode.set(this.initialDesign.mode || 'template');
    
    if (this.initialDesign.backgroundColor) {
      this.globalStyles.backgroundColor = this.initialDesign.backgroundColor;
    }
    if (this.initialDesign.contentMaxWidth) {
      this.globalStyles.maxWidth = this.initialDesign.contentMaxWidth;
    }
    
    // Restaurar header y footer desde initialDesign
    if (this.initialDesign.header) {
      this.headerConfig.set({ ...this.initialDesign.header });
    }
    if (this.initialDesign.footer) {
      this.footerConfig.set({ ...this.initialDesign.footer });
    }
    
    // Restaurar contenido del editor si existe
    if (this.initialDesign.editorContent && this.emailEditor) {
      // Usar setTimeout para asegurar que el editor esté listo
      setTimeout(() => {
        this.emailEditor.setContent(this.initialDesign!.editorContent);
      }, 0);
    }
    
    if (this.initialDesign.mode === 'custom-html' && this.initialDesign.customHtml) {
      this.customHtml = this.initialDesign.customHtml;
    }
  }
  
  onModeChange() {
    // Limpiar contenido al cambiar de modo
    this.currentContent = null;
    this.currentHtml.set('');
    this.customHtml = '';
  }
  
  onGlobalStylesChange() {
    // Actualizar estilos globales
    this.cdr.detectChanges();
  }
  
  onContentChange(content: any) {
    this.currentContent = content;
    this.cdr.detectChanges();
  }
  
  onHtmlChange(html: string) {
    console.log('[DEBUG] onHtmlChange - HTML received, length:', html.length);
    console.log('[DEBUG] onHtmlChange - HTML preview:', html.substring(0, 300));
    this.currentHtml.set(html);
    
    // Actualizar el preview con el HTML directo
    if (html && html.trim().length > 0) {
      this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
    }
    
    this.cdr.detectChanges();
  }
  
  onBlockSelect(block: SelectedBlock | null) {
    this.selectedBlock.set(block);
    this.cdr.detectChanges();
  }
  
  /**
   * Obtiene el nombre legible del tipo de bloque
   */
  getBlockTypeName(type: string): string {
    const names: Record<string, string> = {
      'buttonNode': 'Botón',
      'imageNode': 'Imagen',
      'dividerNode': 'Divisor',
      'socialNode': 'Redes Sociales',
      'columnsNode': 'Columnas',
      'headerNode': 'Encabezado',
      'footerNode': 'Pie de página',
      'spacerNode': 'Espaciador'
    };
    return names[type] || 'Bloque';
  }
  
  /**
   * Obtiene el icono del tipo de bloque
   */
  getBlockIcon(type: string): string {
    const icons: Record<string, string> = {
      'buttonNode': '🔘',
      'imageNode': '🖼️',
      'dividerNode': '➖',
      'socialNode': '🔗',
      'columnsNode': '📊',
      'headerNode': '📝',
      'footerNode': '📋',
      'spacerNode': '↕️'
    };
    return icons[type] || '📦';
  }
  
  /**
   * Actualiza los atributos del bloque seleccionado
   */
  updateBlock(attrs: Record<string, any>) {
    const block = this.selectedBlock();
    if (block && this.emailEditor) {
      this.emailEditor.updateBlockAttributes(block.position, attrs);
    }
  }
  
  /**
   * Elimina el bloque seleccionado
   */
  deleteBlock() {
    if (this.emailEditor) {
      this.emailEditor.deleteSelectedBlock();
    }
  }
  
  /**
   * Cancela la selección del bloque
   */
  clearBlockSelection() {
    this.selectedBlock.set(null);
  }
  
  onCustomHtmlChange() {
    // Actualizar vista previa
    this.cdr.detectChanges();
  }
  
  generatePreviewHtml(): SafeHtml {
    // Usar el HTML directo del editor
    const html = this.currentHtml();
    if (!html || html.trim().length === 0 || html === '<p></p>') {
      return this.sanitizer.bypassSecurityTrustHtml('<!DOCTYPE html><html><head></head><body style="font-family: Arial, sans-serif; padding: 40px; color: #666; text-align: center;"><p>Escribe "/" para comenzar a diseñar</p></body></html>');
    }
    
    // El HTML ya viene envuelto en una plantilla de email desde el editor
    // Los estilos inline (font-family, font-size, color) tienen prioridad sobre estos estilos base
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset y estilos base */
    * { box-sizing: border-box; }
    
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: ${this.globalStyles.fontFamily || 'Arial, sans-serif'}; 
      background-color: ${this.globalStyles.backgroundColor || '#ffffff'};
      font-size: 16px;
      line-height: 1.6;
      color: #333;
    }
    
    /* Contenedor del email */
    .email-container {
      max-width: ${this.globalStyles.maxWidth || 600}px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    /* Tipografía base - los inline styles de TipTap tienen prioridad */
    h1 { font-weight: 700; margin: 1em 0 0.5em; line-height: 1.2; }
    h2 { font-weight: 600; margin: 1em 0 0.5em; line-height: 1.3; }
    h3 { font-weight: 600; margin: 1em 0 0.5em; line-height: 1.4; }
    p { margin: 0.5em 0; }
    
    /* Listas */
    ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
    ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
    li { margin: 0.25em 0; display: list-item; }
    
    /* Otros elementos */
    blockquote { border-left: 3px solid #e5e7eb; padding-left: 1em; margin: 1em 0; color: #6b7280; font-style: italic; }
    a { color: #4f46e5; text-decoration: underline; }
    hr { border: none; border-top: 2px solid #e5e7eb; margin: 2em 0; }
    img { max-width: 100%; height: auto; }
    
    /* Bloques de email - Botón */
    [data-type="button-node"],
    .email-button-wrapper {
      margin: 16px 0;
      text-align: center;
    }
    
    /* Bloques de email - Imagen */
    [data-type="image-node"] {
      margin: 16px 0;
    }
    
    [data-type="image-node"] img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    
    /* Bloques de email - Header */
    [data-type="header-node"] {
      padding: 20px;
    }
    
    /* Bloques de email - Footer */
    [data-type="footer-node"] {
      padding: 30px;
      border-top: 1px solid #e5e7eb;
    }
    
    /* Bloques de email - Divisor */
    [data-type="divider-node"] {
      padding: 20px 0;
    }
    
    [data-type="divider-node"] hr {
      margin: 0;
      border: none;
      border-top: 2px solid #e5e7eb;
    }
    
    /* Bloques de email - Espaciador */
    [data-type="spacer-node"] {
      height: 40px;
      background-color: transparent;
    }
    
    /* Bloques de email - Redes sociales */
    [data-type="social-node"] {
      padding: 16px 0;
      text-align: center;
    }
    
    [data-type="social-node"] a {
      display: inline-block;
      margin: 0 8px;
    }
    
    [data-type="social-node"] img {
      width: 32px !important;
      height: 32px !important;
      max-width: 32px !important;
    }
    
    /* Also limit img tags in general to prevent giant social icons */
    .email-container img {
      max-width: 100%;
      height: auto;
    }
    
    /* Fix for social links that might have different structure */
    [data-type="social-node"] a img {
      width: 32px !important;
      height: 32px !important;
      max-width: 32px !important;
    }
    
    /* Bloques de email - Columnas */
    [data-type="columns-node"] {
      display: table;
      width: 100%;
      border-spacing: 0;
    }
    
    /* Bloques seleccionados en el editor */
    .ProseMirror-selectednode {
      outline: 2px solid #4f46e5;
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    ${html}
  </div>
</body>
</html>`;
  }
  
  getCustomHtmlPreview(): string {
    if (!this.customHtml || this.customHtml.trim().length === 0) {
      return '<!DOCTYPE html><html><head></head><body style="font-family: Arial, sans-serif; padding: 40px; color: #666; text-align: center;"><p>Escribe tu HTML en el editor</p></body></html>';
    }
    
    const hasDoctype = this.customHtml.toLowerCase().includes('<!doctype');
    
    if (hasDoctype) {
      // If user provides complete HTML, use it as-is with a robust reset
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset styles to prevent external CSS from affecting the preview */
    html, body, div, span, p, table, tr, td, th, a, img, h1, h2, h3, h4, h5, h6 {
      all: initial;
      display: block;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
${this.customHtml}
</body>
</html>`;
    } else {
      // If fragment, wrap it
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html, body, div, span, p, table, tr, td, th, a, img, h1, h2, h3, h4, h5, h6 {
      all: initial;
      display: block;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }
    table {
      border-collapse: collapse;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
${this.customHtml}
</body>
</html>`;
    }
  }

  formatHtml() {
    // Implementar formateo de HTML
    try {
      // Formateo básico
      let formatted = this.customHtml;
      formatted = formatted.replace(/></g, '>\n<');
      formatted = formatted.replace(/^\s+/gm, '');
      this.customHtml = formatted;
    } catch (e) {
      console.error('Error formatting HTML:', e);
    }
  }
  
  isValid(): boolean {
    if (this.mode() === 'custom-html') {
      return this.customHtml.trim().length > 0;
    }
    
    // Verificar si hay contenido en el editor
    return this.currentContent !== null && 
           this.currentContent.content && 
           this.currentContent.content.length > 0;
  }
  
  continue() {
    console.log('[DEBUG design-step] continue() - Generating design');
    console.log('[DEBUG design-step] currentHtml length:', this.currentHtml().length);
    console.log('[DEBUG design-step] currentHtml preview:', this.currentHtml().substring(0, 500));
    
    const design: EmailDesign = {
      mode: this.mode(),
      backgroundColor: this.globalStyles.backgroundColor,
      fontFamily: this.globalStyles.fontFamily,
      contentMaxWidth: this.globalStyles.maxWidth,
      header: this.headerConfig(),
      content: [],
      footer: this.footerConfig()
    };
    
    if (this.mode() === 'custom-html') {
      design.customHtml = this.customHtml;
    } else {
      // Usar el HTML directo generado por el editor
      design.customHtml = this.currentHtml();
      // También guardar el JSON del editor para poder editarlo después
      design.editorContent = this.currentContent;
    }
    
    this.onNext.emit(design);
  }
}
