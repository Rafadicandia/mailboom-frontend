import { Component, Output, EventEmitter, signal, ChangeDetectorRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EmailDesign, EditorMode, HeaderConfig, FooterConfig, ContentBlock, TextStyle, FontFamily, FontSize } from '../templates/template.model';
import { QuillEditorComponent } from '../../../../shared/components/quill-editor.component';

@Component({
  selector: 'app-design-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, QuillEditorComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Selector de Modo -->
      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 class="text-sm font-medium text-gray-700 mb-3">¿Cómo quieres crear tu email?</h3>
        <div class="flex gap-4">
          <label class="flex-1 cursor-pointer">
            <input type="radio" [(ngModel)]="mode" value="template" class="sr-only peer" (change)="onModeChange()">
            <div class="p-4 bg-white border-2 border-gray-200 rounded-lg peer-checked:border-indigo-600 peer-checked:bg-indigo-50 text-center transition-all">
              <svg class="w-8 h-8 mx-auto mb-2 text-gray-400 peer-checked:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span class="text-sm font-medium">Diseñador visual</span>
              <p class="text-xs text-gray-500 mt-1">Arrastra bloques y personaliza</p>
            </div>
          </label>
          
          <label class="flex-1 cursor-pointer">
            <input type="radio" [(ngModel)]="mode" value="custom-html" class="sr-only peer" (change)="onModeChange()">
            <div class="p-4 bg-white border-2 border-gray-200 rounded-lg peer-checked:border-indigo-600 peer-checked:bg-indigo-50 text-center transition-all">
              <svg class="w-8 h-8 mx-auto mb-2 text-gray-400 peer-checked:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span class="text-sm font-medium">HTML propio</span>
              <p class="text-xs text-gray-500 mt-1">Pega tu código HTML</p>
            </div>
          </label>
        </div>
      </div>

      <!-- MODO: HTML PROPIO -->
      @if (mode() === 'custom-html') {
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Tu código HTML</h3>
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button type="button" (click)="htmlViewMode.set('code')" [class.bg-white]="htmlViewMode() === 'code'" class="px-3 py-1 rounded text-sm">Código</button>
              <button type="button" (click)="htmlViewMode.set('preview')" [class.bg-white]="htmlViewMode() === 'preview'" class="px-3 py-1 rounded text-sm">Vista previa</button>
            </div>
          </div>
          
          @if (htmlViewMode() === 'code') {
            <textarea [(ngModel)]="customHtml" rows="15" class="w-full p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-lg resize-none" placeholder="<!-- Pega tu HTML aquí -->"></textarea>
          } @else {
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <iframe [srcdoc]="getCustomHtmlPreview()" class="w-full h-96 border-0"></iframe>
            </div>
          }
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            💡 Tip: Usa variables como {{ '{{name}}' }}, {{ '{{email}}' }} para personalizar
          </div>
        </div>
      }

      <!-- MODO: DISEÑADOR VISUAL -->
      @if (mode() === 'template') {
        <div class="space-y-6">
          
          <!-- CONFIGURACIÓN GLOBAL -->
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Configuración general</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Color de fondo del email</label>
                <div class="flex items-center gap-2">
                  <input type="color" [(ngModel)]="design.backgroundColor" (ngModelChange)="refreshPreview()" class="w-10 h-10 rounded cursor-pointer border">
                  <span class="text-sm text-gray-500">{{ design.backgroundColor }}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">Ancho máximo (px)</label>
                <input type="number" [(ngModel)]="design.contentMaxWidth" (ngModelChange)="refreshPreview()" class="w-full px-3 py-2 border rounded-lg" min="400" max="800" step="10">
              </div>
            </div>
          </div>

          <!-- HEADER -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-100 px-4 py-3 flex items-center justify-between cursor-pointer" (click)="showHeaderConfig.set(!showHeaderConfig())">
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="design.header.enabled" (ngModelChange)="refreshPreview()" class="w-4 h-4 text-indigo-600">
                <span class="font-medium text-gray-700">Header</span>
              </div>
              <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="showHeaderConfig()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            @if (showHeaderConfig() && design.header.enabled) {
              <div class="p-4 space-y-4 bg-white">
                <div class="flex gap-4">
                  <label class="flex items-center">
                    <input type="radio" [(ngModel)]="design.header.useImage" (ngModelChange)="refreshPreview()" [value]="true" class="mr-2">
                    <span class="text-sm">Imagen (Logo)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" [(ngModel)]="design.header.useImage" (ngModelChange)="refreshPreview()" [value]="false" class="mr-2">
                    <span class="text-sm">Texto</span>
                  </label>
                </div>

                @if (design.header.useImage) {
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">URL del logo</label>
                    <input type="text" [(ngModel)]="design.header.imageUrl" (ngModelChange)="refreshPreview()" class="w-full px-3 py-2 border rounded-lg" placeholder="https://...">
                    @if (design.header.imageUrl) {
                      <img [src]="design.header.imageUrl" class="mt-2 max-h-24 rounded border" alt="Logo preview">
                    }
                  </div>
                } @else {
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Texto del header</label>
                    <input type="text" [(ngModel)]="design.header.text" (ngModelChange)="refreshPreview()" class="w-full px-3 py-2 border rounded-lg" placeholder="Nombre de tu empresa">
                  </div>
                }

                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Color fondo header</label>
                    <div class="flex items-center gap-2">
                      <input type="color" [(ngModel)]="design.header.backgroundColor" (ngModelChange)="refreshPreview()" class="w-8 h-8 rounded cursor-pointer">
                      <span class="text-xs text-gray-500">{{ design.header.backgroundColor }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Color texto</label>
                    <div class="flex items-center gap-2">
                      <input type="color" [(ngModel)]="design.header.textColor" (ngModelChange)="refreshPreview()" class="w-8 h-8 rounded cursor-pointer">
                      <span class="text-xs text-gray-500">{{ design.header.textColor }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Altura (px)</label>
                    <input type="number" [(ngModel)]="design.header.height" (ngModelChange)="refreshPreview()" class="w-full px-2 py-1 border rounded" min="40" max="200">
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- CONTENIDO -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-100 px-4 py-3">
              <span class="font-medium text-gray-700">Contenido del email</span>
            </div>
            <div class="p-4 space-y-4 bg-white">
              
              <!-- Herramientas de formato -->
              <div class="mb-3">
                <p class="text-xs text-gray-500 mb-2">Formato para nuevos bloques</p>
                <div class="flex flex-wrap gap-1 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div class="flex bg-white rounded border mr-2">
                    <button (click)="setAlignment('left')" [class.bg-indigo-100]="currentStyle.align === 'left'" 
                            class="px-2 py-1 hover:bg-gray-100" title="Alinear izquierda">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h16"/></svg>
                    </button>
                    <button (click)="setAlignment('center')" [class.bg-indigo-100]="currentStyle.align === 'center'" 
                            class="px-2 py-1 hover:bg-gray-100" title="Centrar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M12 6v12M4 18h16"/></svg>
                    </button>
                    <button (click)="setAlignment('right')" [class.bg-indigo-100]="currentStyle.align === 'right'" 
                            class="px-2 py-1 hover:bg-gray-100" title="Alinear derecha">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 18h10M4 12h10M4 18h10"/></svg>
                    </button>
                  </div>
                  <button (click)="toggleBold()" [class.bg-indigo-100]="currentStyle.bold" 
                          class="px-2 py-1 font-bold border rounded hover:bg-gray-100" title="Negrita">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/></svg>
                  </button>
                  <button (click)="toggleItalic()" [class.bg-indigo-100]="currentStyle.italic" 
                          class="px-2 py-1 italic border rounded hover:bg-gray-100" title="Cursiva">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                  </button>
                  <button (click)="toggleUnderline()" [class.bg-indigo-100]="currentStyle.underline" 
                          class="px-2 py-1 border rounded hover:bg-gray-100" title="Subrayado" [style.text-decoration]="currentStyle.underline ? 'underline' : 'none'">U</button>
                  <input type="color" [(ngModel)]="currentStyle.color" (ngModelChange)="currentStyle.color = $event"
                         class="w-8 h-8 rounded cursor-pointer border hover:ring-2 hover:ring-indigo-300" title="Color de texto">
                  <select [(ngModel)]="currentStyle.fontSize" class="text-sm border rounded px-2 py-1" title="Tamaño">
                    <option value="small">12px</option>
                    <option value="normal">14px</option>
                    <option value="large">18px</option>
                    <option value="xlarge">24px</option>
                  </select>
                  <select [(ngModel)]="currentStyle.fontFamily" class="text-sm border rounded px-2 py-1" title="Tipo de letra">
                    @for (font of fonts; track font) {
                      <option [value]="font">{{ font }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Bloques de contenido -->
              @for (block of design.content; track block.id; let i = $index) {
                <div class="border border-gray-200 rounded-lg p-3 relative group mb-3 bg-white hover:border-indigo-300 transition-colors">
                  <div class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
                    <button (click)="duplicateBlock(i)" class="w-6 h-6 bg-indigo-500 text-white rounded-full text-xs hover:bg-indigo-600 shadow-sm" title="Duplicar">⧉</button>
                    <button (click)="moveBlock(i, -1)" [disabled]="i === 0" class="w-6 h-6 bg-gray-500 text-white rounded-full text-xs hover:bg-gray-600 shadow-sm disabled:opacity-50" title="Subir">↑</button>
                    <button (click)="moveBlock(i, 1)" [disabled]="i === design.content.length - 1" class="w-6 h-6 bg-gray-500 text-white rounded-full text-xs hover:bg-gray-600 shadow-sm disabled:opacity-50" title="Bajar">↓</button>
                    <button (click)="removeBlock(i)" class="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 shadow-sm" title="Eliminar">×</button>
                  </div>
                  
                  <!-- Tipo de bloque indicador -->
                  <div class="absolute -left-2 -top-2 bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded border border-indigo-200">
                    {{ getBlockLabel(block.type) }}
                  </div>
                  
                  @if (block.type === 'rich-text') {
                    <!-- Editor Quill para texto enriquecido -->
                    <div class="mt-4">
                      <app-quill-editor
                        [(ngModel)]="block.htmlContent"
                        [placeholder]="'Escribe tu contenido enriquecido aquí...'"
                        [showTemplates]="true"
                        (ngModelChange)="onRichTextChange(i, $event); refreshPreview()"
                        (onContentChange)="onRichTextChange(i, $event); refreshPreview()"
                      ></app-quill-editor>
                    </div>
                  } @else if (block.type === 'text') {
                    <div class="mt-4">
                      <textarea [(ngModel)]="block.content" (ngModelChange)="block.content = $event; refreshPreview()" rows="3" 
                                [style.font-family]="block.style?.fontFamily"
                                [style.font-size]="getFontSize(block.style?.fontSize)"
                                [style.color]="block.style?.color"
                                [style.text-align]="block.style?.align"
                                [style.font-weight]="block.style?.bold ? 'bold' : 'normal'"
                                [style.font-style]="block.style?.italic ? 'italic' : 'normal'"
                                class="w-full p-3 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                placeholder="Escribe aquí..."></textarea>
                    </div>
                  } @else if (block.type === 'image') {
                    <div class="mt-4">
                      <input type="text" [(ngModel)]="block.url" (ngModelChange)="block.url = $event; refreshPreview()"
                             class="w-full px-3 py-2 border rounded mb-2 text-sm" 
                             placeholder="URL de la imagen (https://...)">
                      @if (block.url) {
                        <div class="relative">
                          <img [src]="block.url" class="max-h-48 mx-auto rounded border" alt="Vista previa">
                          <button (click)="block.url = ''; refreshPreview()" class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600">×</button>
                        </div>
                      }
                    </div>
                  } @else if (block.type === 'button') {
                    <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                      <label class="block text-xs text-gray-600 mb-2 font-medium">Configuración del botón</label>
                      <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Texto del botón</label>
                          <input type="text" [(ngModel)]="block.content" (ngModelChange)="block.content = $event; refreshPreview()"
                                 class="w-full px-3 py-2 border rounded-lg" placeholder="Click aquí">
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">URL destino</label>
                          <input type="text" [(ngModel)]="block.url" (ngModelChange)="block.url = $event; refreshPreview()"
                                 class="w-full px-3 py-2 border rounded-lg" placeholder="https://...">
                        </div>
                      </div>
                      <div class="grid grid-cols-3 gap-3">
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Color del botón</label>
                          <div class="flex items-center gap-2">
                            <input type="color" [(ngModel)]="buttonColor" (ngModelChange)="buttonColor = $event; refreshPreview()" 
                                   class="w-8 h-8 rounded cursor-pointer">
                            <span class="text-xs text-gray-500">{{ buttonColor() }}</span>
                          </div>
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Color texto</label>
                          <div class="flex items-center gap-2">
                            <input type="color" [(ngModel)]="buttonTextColor" (ngModelChange)="buttonTextColor = $event; refreshPreview()" 
                                   class="w-8 h-8 rounded cursor-pointer">
                            <span class="text-xs text-gray-500">{{ buttonTextColor() }}</span>
                          </div>
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">Border radius</label>
                          <input type="number" [(ngModel)]="buttonBorderRadius" (ngModelChange)="buttonBorderRadius = $event; refreshPreview()"
                                 class="w-full px-2 py-1 border rounded" min="0" max="30">
                        </div>
                      </div>
                      <!-- Vista previa del botón -->
                      <div class="mt-3 p-4 bg-white rounded border text-center">
                        <a [href]="block.url || '#'" 
                           [style.background-color]="buttonColor()"
                           [style.color]="buttonTextColor()"
                           [style.border-radius.px]="buttonBorderRadius()"
                           [style.padding.px]="16"
                           [style.padding-inline.px]="32"
                           [style.display]="'inline-block'"
                           [style.text-decoration]="'none'"
                           [style.font-weight]="'bold'"
                           [style.font-size]="'16px'"
                           target="_blank">
                           {{ block.content || 'Click aquí' }}
                        </a>
                      </div>
                    </div>
                  } @else if (block.type === 'divider') {
                    <div class="mt-4 py-2">
                      <hr [style.border-color]="dividerColor()" class="my-4 border-2">
                      <div class="flex items-center gap-2">
                        <label class="text-xs text-gray-500">Color línea:</label>
                        <input type="color" [(ngModel)]="dividerColor" (ngModelChange)="dividerColor = $event; refreshPreview()" class="w-8 h-8 rounded cursor-pointer">
                        <span class="text-xs text-gray-500">{{ dividerColor() }}</span>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Agregar bloques -->
              <div class="flex gap-2 justify-center pt-4 flex-wrap">
                <button (click)="addBlock('text')" 
                        class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 hover:border-indigo-300 transition-colors flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
                  + Texto simple
                </button>
                <button (click)="addBlock('rich-text')" 
                        class="px-4 py-2 bg-indigo-50 border border-indigo-300 rounded-lg text-sm hover:bg-indigo-100 transition-colors flex items-center gap-1 text-indigo-700">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L15 11.828l-4.586 4.586z"/></svg>
                  + Texto enriquecido
                </button>
                <button (click)="addBlock('image')" 
                        class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 hover:border-indigo-300 transition-colors flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  + Imagen
                </button>
                <button (click)="addBlock('button')" 
                        class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 hover:border-indigo-300 transition-colors flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                  + Botón
                </button>
                <button (click)="addBlock('divider')" 
                        class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 hover:border-indigo-300 transition-colors flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                  + Línea
                </button>
              </div>
            </div>
          </div>

          <!-- FOOTER editable con Quill -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-100 px-4 py-3 flex items-center justify-between cursor-pointer" (click)="showFooterConfig.set(!showFooterConfig())">
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="design.footer.enabled" (ngModelChange)="refreshPreview()" class="w-4 h-4 text-indigo-600">
                <span class="font-medium text-gray-700">Footer</span>
              </div>
              <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="showFooterConfig()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            @if (showFooterConfig() && design.footer.enabled) {
              <div class="p-4 space-y-4 bg-white">
                <!-- Editor Quill para contenido del footer -->
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Contenido del footer (editable)</label>
                  <app-quill-editor
                    [(ngModel)]="footerHtmlContent"
                    [placeholder]="'Edita el contenido de tu footer aquí...'"
                    [showTemplates]="false"
                    (ngModelChange)="refreshPreview()"
                    (onContentChange)="footerHtmlContent.set($event); refreshPreview()"
                  ></app-quill-editor>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Color fondo footer</label>
                    <div class="flex items-center gap-2">
                      <input type="color" [(ngModel)]="design.footer.backgroundColor" (ngModelChange)="refreshPreview()" class="w-10 h-10 rounded cursor-pointer border">
                      <span class="text-sm text-gray-500">{{ design.footer.backgroundColor }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Color texto</label>
                    <div class="flex items-center gap-2">
                      <input type="color" [(ngModel)]="design.footer.textColor" (ngModelChange)="refreshPreview()" class="w-10 h-10 rounded cursor-pointer border">
                      <span class="text-sm text-gray-500">{{ design.footer.textColor }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                  <input type="checkbox" [(ngModel)]="design.footer.showUnsubscribe" (ngModelChange)="refreshPreview()" id="showUnsubscribeFooter" class="w-4 h-4 text-indigo-600">
                  <label for="showUnsubscribeFooter" class="text-sm text-gray-700">Mostrar enlace de baja</label>
                </div>
              </div>
            }
          </div>

        </div>
      }

      <!-- VISTA PREVIA FINAL -->
      <div class="border-2 border-indigo-300 rounded-lg overflow-hidden bg-white shadow-lg">
        <div class="bg-indigo-600 px-4 py-3 text-sm font-medium text-white flex items-center justify-between">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Vista previa del email
          </span>
          <div class="flex items-center gap-2">
            <span class="text-xs opacity-75">📱 Desktop</span>
          </div>
        </div>
        <div class="bg-gray-100 p-4">
          <iframe [srcdoc]="getFinalHtml()" class="w-full h-96 border-0 rounded shadow-sm bg-white" style="min-height: 400px;"></iframe>
        </div>
      </div>

      <!-- BOTONES -->
      <div class="flex justify-between pt-4">
        <button type="button" (click)="onBack.emit()" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          ← Anterior
        </button>
        <button type="button" (click)="continue()" [disabled]="!isValid()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors">
          Siguiente: Audiencia →
        </button>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DesignStepComponent implements OnInit, OnChanges {
  @Input() initialDesign?: EmailDesign | null;
  
  mode = signal<EditorMode>('template');
  htmlViewMode = signal<'code' | 'preview'>('code');
  showHeaderConfig = signal(true);
  showFooterConfig = signal(true);
  
  customHtml = signal('');
  buttonColor = signal('#4f46e5');
  buttonTextColor = signal('#ffffff');
  buttonBorderRadius = signal(8);
  dividerColor = signal('#e5e7eb');
  footerHtmlContent = signal('<p style="text-align: center; margin: 0;"><strong>Mi Empresa</strong></p>');
  
  fonts: FontFamily[] = ['Arial', 'Georgia', 'Helvetica', 'Times New Roman', 'Verdana', 'Roboto'];
  
  currentStyle: TextStyle = {
    fontFamily: 'Arial',
    fontSize: 'normal',
    color: '#333333',
    align: 'left',
    bold: false,
    italic: false,
    underline: false
  };
  
  design: EmailDesign = {
    mode: 'template',
    backgroundColor: '#f5f5f5',
    contentMaxWidth: 600,
    header: {
      enabled: true,
      useImage: false,
      imageUrl: '',
      text: 'Mi Empresa',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      height: 80
    },
    content: [],
    footer: {
      enabled: true,
      companyName: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      socialLinks: {},
      showUnsubscribe: true,
      customText: '',
      backgroundColor: '#f8f9fa',
      textColor: '#666666'
    }
  };

  @Output() onNext = new EventEmitter<EmailDesign>();
  @Output() onBack = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {
    // Si hay un diseño inicial, usarlo; sino agregar un bloque de texto por defecto
    try {
      if (this.initialDesign) {
        this.applyInitialDesign();
      } else {
        this.addBlock('text');
      }
    } catch (e) {
      console.error('Error initializing design:', e);
      this.addBlock('text');
    }
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialDesign']) {
      try {
        if (this.initialDesign) {
          this.applyInitialDesign();
        }
      } catch (e) {
        console.error('Error applying design changes:', e);
      }
    }
  }

  applyInitialDesign() {
    if (!this.initialDesign) return;
    
    const design = this.initialDesign;
    
    // Aplicar el modo
    this.mode.set(design.mode || 'template');
    
    // Aplicar configuración global
    this.design.backgroundColor = design.backgroundColor || '#ffffff';
    this.design.contentMaxWidth = design.contentMaxWidth || 600;
    
    // Aplicar header de forma segura
    if (design.header) {
      this.design.header = {
        enabled: design.header.enabled ?? false,
        backgroundColor: design.header.backgroundColor || '#ffffff',
        textColor: design.header.textColor || '#000000',
        text: design.header.text || '',
        height: design.header.height || 60,
        useImage: design.header.useImage ?? false,
        imageUrl: design.header.imageUrl || ''
      };
    }
    
    // Aplicar contenido
    this.design.content = design.content ? [...design.content] : [];
    
    // Aplicar footer de forma segura
    if (design.footer) {
      this.design.footer = {
        enabled: design.footer.enabled ?? false,
        backgroundColor: design.footer.backgroundColor || '#f3f4f6',
        textColor: design.footer.textColor || '#6b7280',
        companyName: design.footer.companyName || '',
        address: design.footer.address || '',
        phone: design.footer.phone || '',
        email: design.footer.email || '',
        website: design.footer.website || '',
        socialLinks: design.footer.socialLinks || {},
        customText: design.footer.customText || '',
        showUnsubscribe: design.footer.showUnsubscribe ?? false
      };
    }
    
    // Si es modo HTML personalizado, aplicar el customHtml
    if (design.mode === 'custom-html' && design.customHtml) {
      this.customHtml.set(design.customHtml);
    }
    
    // Refrescar vista previa
    this.refreshPreview();
  }

  onModeChange() {
    this.design.mode = this.mode();
    this.refreshPreview();
  }

  getBlockLabel(type: string): string {
    const labels: Record<string, string> = {
      'text': 'Texto simple',
      'rich-text': 'Texto enriquecido',
      'image': 'Imagen',
      'button': 'Botón',
      'divider': 'Línea'
    };
    return labels[type] || type;
  }

  setAlignment(align: 'left' | 'center' | 'right') {
    this.currentStyle.align = align;
  }

  toggleBold() {
    this.currentStyle.bold = !this.currentStyle.bold;
  }

  toggleItalic() {
    this.currentStyle.italic = !this.currentStyle.italic;
  }

  toggleUnderline() {
    this.currentStyle.underline = !this.currentStyle.underline;
  }

  getFontSize(size?: FontSize): string {
    const sizes: Record<string, string> = { small: '14px', normal: '16px', large: '18px', xlarge: '24px' };
    return sizes[size || 'normal'];
  }

  addBlock(type: ContentBlock['type']) {
    const block: ContentBlock = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'button' ? 'Click aquí' : '',
      style: { ...this.currentStyle },
      padding: 20,
      htmlContent: type === 'rich-text' ? '<p>Escribe tu contenido aquí...</p>' : undefined
    };
    this.design.content.push(block);
    this.refreshPreview();
  }

  removeBlock(index: number) {
    if (this.design.content.length > 1) {
      this.design.content.splice(index, 1);
      this.refreshPreview();
    }
  }

  duplicateBlock(index: number) {
    const original = this.design.content[index];
    const duplicate: ContentBlock = {
      ...original,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content: original.content,
      htmlContent: original.htmlContent,
      url: original.url
    };
    this.design.content.splice(index + 1, 0, duplicate);
    this.refreshPreview();
  }

  moveBlock(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < this.design.content.length) {
      const temp = this.design.content[index];
      this.design.content[index] = this.design.content[newIndex];
      this.design.content[newIndex] = temp;
      this.refreshPreview();
    }
  }

  onRichTextChange(index: number, htmlContent: string) {
    if (this.design.content[index]) {
      this.design.content[index].htmlContent = htmlContent;
      this.design.content[index].content = htmlContent;
    }
  }

  refreshPreview() {
    // Use setTimeout to ensure change detection runs
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  getCustomHtmlPreview(): string {
    let html = this.customHtml();
    const sampleData = { name: 'Juan Pérez', email: 'juan@ejemplo.com', unsubscribe_link: '#' };
    Object.entries(sampleData).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return html;
  }

  getFinalHtml(): string {
    if (this.mode() === 'custom-html') {
      return this.getCustomHtmlPreview();
    }

    const d = this.design;
    
    let contentHtml = d.content.map(block => {
      const style = block.style;
      const baseStyle = style ? 
        `font-family:${style.fontFamily};font-size:${this.getFontSize(style.fontSize)};color:${style.color};text-align:${style.align};font-weight:${style.bold ? 'bold' : 'normal'};font-style:${style.italic ? 'italic' : 'normal'};${style.underline ? 'text-decoration:underline;' : ''}` 
        : '';
      
      switch (block.type) {
        case 'rich-text':
        case 'text':
          const content = block.type === 'rich-text' && block.htmlContent ? block.htmlContent : block.content;
          return `<div style="${baseStyle}padding:10px 0;">${content}</div>`;
        case 'image':
          return block.url ? `<div style="text-align:center;padding:10px 0;"><img src="${block.url}" style="max-width:100%;height:auto;" alt="Imagen"></div>` : '';
        case 'button':
          return `<div style="text-align:center;padding:20px 0;"><a href="${block.url || '#'}" style="display:inline-block;padding:16px 32px;background:${this.buttonColor()};color:${this.buttonTextColor()};text-decoration:none;border-radius:${this.buttonBorderRadius()}px;font-weight:bold;font-size:16px;">${block.content}</a></div>`;
        case 'divider':
          return `<hr style="border:none;border-top:2px solid ${this.dividerColor()};margin:20px 0;">`;
        default:
          return '';
      }
    }).join('');

    const headerHtml = d.header.enabled ? 
      (d.header.useImage && d.header.imageUrl 
        ? `<div style="text-align:center;padding:20px;background:${d.header.backgroundColor};"><img src="${d.header.imageUrl}" style="max-height:${d.header.height}px;width:auto;max-width:100%;" alt="Logo"></div>`
        : `<div style="padding:20px;background:${d.header.backgroundColor};color:${d.header.textColor};text-align:center;font-size:24px;font-weight:bold;height:${d.header.height}px;display:flex;align-items:center;justify-content:center;">${d.header.text}</div>`
      ) : '';

    const footerContent = this.footerHtmlContent() || '';
    const unsubscribeLink = d.footer.showUnsubscribe ? `<p style="margin:20px 0 0 0;font-size:12px;"><a href="{{unsubscribe_link}}" style="color:${d.footer.textColor};">Darse de baja</a></p>` : '';
    
    const footerGeneratedHtml = footerContent || `
      <div style="text-align:center;">
        <p style="font-weight:bold;margin:0 0 5px 0;">${d.footer.companyName || 'Mi Empresa'}</p>
        ${d.footer.address ? `<p style="margin:0 0 5px 0;font-size:12px;">${d.footer.address}</p>` : ''}
        ${d.footer.email || d.footer.phone ? `<p style="margin:0 0 5px 0;font-size:12px;">${d.footer.phone || ''} ${d.footer.email ? '| ' + d.footer.email : ''}</p>` : ''}
        ${d.footer.website ? `<p style="margin:0 0 10px 0;font-size:12px;"><a href="${d.footer.website}" style="color:${d.footer.textColor};">${d.footer.website}</a></p>` : ''}
      </div>
    `;

    const footerHtml = d.footer.enabled ? `
      <div style="padding:30px;background:${d.footer.backgroundColor};color:${d.footer.textColor};font-size:14px;text-align:center;border-top:1px solid #e5e7eb;">
        ${footerGeneratedHtml}
        ${unsubscribeLink}
        <p style="margin:20px 0 0 0;font-size:11px;opacity:0.7;">Enviado con <strong>Mailboom</strong></p>
      </div>
    ` : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <style>
    body { margin:0;padding:0;background:${d.backgroundColor};font-family:Arial,sans-serif; }
    .wrapper { padding:20px; }
    .container { max-width:${d.contentMaxWidth}px;margin:0 auto;background:#ffffff; }
    a { color: #4f46e5; }
    img { max-width: 100%; height: auto; }
    @media only screen and (max-width: 600px) {
      .wrapper { padding:10px !important; }
      .container { max-width:100% !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${headerHtml}
      <div style="padding:30px;">
        ${contentHtml}
      </div>
      ${footerHtml}
    </div>
  </div>
</body>
</html>`;
  }

  isValid(): boolean {
    if (this.mode() === 'custom-html') {
      return this.customHtml().trim().length > 0;
    }
    return this.design.content.some(b => {
      if (b.type === 'rich-text' && b.htmlContent) {
        const cleanContent = b.htmlContent.replace(/<[^>]*>/g, '').trim();
        return cleanContent.length > 0 && b.htmlContent !== '<p>Escribe tu contenido aquí...</p>';
      }
      return b.content.trim().length > 0;
    });
  }

  continue() {
    const finalDesign: EmailDesign = {
      ...this.design,
      customHtml: this.mode() === 'custom-html' ? this.customHtml() : undefined
    };
    this.onNext.emit(finalDesign);
  }
}
