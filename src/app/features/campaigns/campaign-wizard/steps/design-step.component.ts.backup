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
      <div class="bg-notion-bg-secondary rounded-notion p-4 border border-notion-border">
        <h3 class="text-sm font-medium text-notion-text mb-3">¿Cómo quieres crear tu email?</h3>
        <div class="flex gap-4">
          <label class="flex-1 cursor-pointer">
            <input type="radio" [(ngModel)]="mode" value="template" class="sr-only peer" (change)="onModeChange()">
            <div class="p-4 bg-white border-2 border-notion-border rounded-notion peer-checked:border-notion-text peer-checked:bg-notion-bg-hover text-center transition-all">
              <svg class="w-8 h-8 mx-auto mb-2 text-notion-text-tertiary peer-checked:text-notion-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span class="text-sm font-medium text-notion-text">Diseñador visual</span>
              <p class="text-xs text-notion-text-secondary mt-1">Arrastra bloques y personaliza</p>
            </div>
          </label>
          
          <label class="flex-1 cursor-pointer">
            <input type="radio" [(ngModel)]="mode" value="custom-html" class="sr-only peer" (change)="onModeChange()">
            <div class="p-4 bg-white border-2 border-notion-border rounded-notion peer-checked:border-notion-text peer-checked:bg-notion-bg-hover text-center transition-all">
              <svg class="w-8 h-8 mx-auto mb-2 text-notion-text-tertiary peer-checked:text-notion-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span class="text-sm font-medium text-notion-text">HTML propio</span>
              <p class="text-xs text-notion-text-secondary mt-1">Pega tu código HTML</p>
            </div>
          </label>
        </div>
      </div>

      <!-- MODO: HTML PROPIO -->
      @if (mode() === 'custom-html') {
        <!-- Layout de dos columnas: Editor HTML + Previsualizador -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Columna izquierda: Editor HTML -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-notion-text">Tu código HTML</h3>
            </div>
            
            <textarea [ngModel]="customHtml()" (ngModelChange)="onCustomHtmlChange($event)" rows="20" class="w-full p-4 font-mono text-sm bg-notion-text text-notion-green rounded-notion resize-none border border-notion-border" placeholder="<!-- Pega tu HTML aquí -->"></textarea>
            
            <div class="bg-notion-blue bg-opacity-10 border border-notion-blue border-opacity-20 rounded-notion p-3 text-sm text-notion-blue">
              💡 Tip: Usa variables como {{ '{{name}}' }}, {{ '{{email}}' }} para personalizar
            </div>
          </div>
          
          <!-- Columna derecha: Previsualizador -->
          <div class="rounded-notion overflow-hidden bg-white border border-notion-border shadow-notion">
            <div class="bg-notion-text px-4 py-2 text-sm font-medium text-white flex items-center justify-between">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                Vista previa
              </span>
              <!-- Toggle Desktop/Mobile -->
              <div class="flex items-center gap-1 bg-notion-bg-hover rounded p-0.5">
                <button type="button" 
                        (click)="htmlPreviewMode.set('desktop')"
                        [class.bg-white]="htmlPreviewMode() === 'desktop'"
                        [class.text-notion-text]="htmlPreviewMode() === 'desktop'"
                        class="px-2 py-1 text-xs font-medium rounded transition-all text-white"
                        title="Desktop (600px)">
                  🖥️
                </button>
                <button type="button" 
                        (click)="htmlPreviewMode.set('mobile')"
                        [class.bg-white]="htmlPreviewMode() === 'mobile'"
                        [class.text-notion-text]="htmlPreviewMode() === 'mobile'"
                        class="px-2 py-1 text-xs font-medium rounded transition-all text-white"
                        title="Mobile (320px)">
                  📱
                </button>
              </div>
            </div>
            <div class="bg-notion-bg-secondary p-2">
              <iframe [srcdoc]="getCustomHtmlPreview()" 
                      [class]="htmlPreviewMode() === 'desktop' ? 'w-full' : 'w-[320px]'"
                      class="h-[600px] border-0 rounded-notion shadow-notion bg-white transition-all mx-auto block"
                      style="max-width: 100%;"></iframe>
            </div>
          </div>
          
        </div>
      }

      <!-- MODO: DISEÑADOR VISUAL -->
      @if (mode() === 'template') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Mensaje cuando hay contenido HTML guardado pero no hay bloques -->
          @if (cachedHtml() && cachedHtml().trim().length > 0 && design.content.length === 0) {
            <div class="bg-notion-yellow bg-opacity-10 border border-notion-yellow border-opacity-20 rounded-notion p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-notion-yellow mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-notion-yellow">Contenido guardado detectado</h4>
                  <p class="text-sm text-notion-text-secondary mt-1">
                    Esta campaña tiene contenido HTML guardado. ¿Qué deseas hacer?
                  </p>
                  <div class="flex gap-2 mt-3 flex-wrap">
                    <button type="button" (click)="parseHtmlToBlocks()" 
                            class="px-3 py-1.5 bg-notion-text text-white rounded-notion text-sm hover:bg-opacity-90 transition-colors">
                      Importar al diseñador visual
                    </button>
                    <button type="button" (click)="switchToHtmlMode()" 
                            class="px-3 py-1.5 bg-notion-yellow bg-opacity-20 text-notion-yellow rounded-notion text-sm hover:bg-opacity-30 transition-colors">
                      Editar como HTML
                    </button>
                    <button type="button" (click)="clearCachedHtml()" 
                            class="px-3 py-1.5 bg-notion-bg-secondary text-notion-text-secondary rounded-notion text-sm hover:bg-notion-bg-hover transition-colors">
                      Empezar de nuevo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
          
          <!-- CONFIGURACIÓN GLOBAL -->
          <div class="bg-notion-bg-secondary rounded-notion p-4 border border-notion-border">
            <h4 class="text-sm font-medium text-notion-text mb-3">Configuración general</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-notion-text-secondary mb-1">Color de fondo del email</label>
                <div class="flex items-center gap-2">
                  <input type="color" [(ngModel)]="design.backgroundColor" (ngModelChange)="refreshPreview()" class="w-10 h-10 rounded-notion cursor-pointer border border-notion-border">
                  <span class="text-sm text-notion-text-secondary">{{ design.backgroundColor }}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-notion-text-secondary mb-1">Ancho máximo (px)</label>
                <input type="number" [(ngModel)]="design.contentMaxWidth" (ngModelChange)="refreshPreview()" class="w-full px-3 py-2 border border-notion-border rounded-notion bg-white" min="400" max="800" step="10">
              </div>
            </div>
          </div>

          <!-- HEADER -->
          <div class="border border-notion-border rounded-notion overflow-hidden">
            <div class="bg-notion-bg-secondary px-4 py-3 flex items-center justify-between cursor-pointer" (click)="showHeaderConfig.set(!showHeaderConfig())">
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="design.header.enabled" (ngModelChange)="refreshPreview()" class="w-4 h-4 text-notion-text">
                <span class="font-medium text-notion-text">Header</span>
              </div>
              <svg class="w-5 h-5 text-notion-text-tertiary transition-transform" [class.rotate-180]="showHeaderConfig()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            @if (showHeaderConfig() && design.header.enabled) {
              <div class="p-4 space-y-4 bg-white">
                <div class="flex gap-4">
                  <label class="flex items-center">
                    <input type="radio" [(ngModel)]="design.header.useImage" (ngModelChange)="refreshPreview()" [value]="true" class="mr-2">
                    <span class="text-sm text-notion-text">Imagen (Logo)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" [(ngModel)]="design.header.useImage" (ngModelChange)="refreshPreview()" [value]="false" class="mr-2">
                    <span class="text-sm text-notion-text">Texto</span>
                  </label>
                </div>

                @if (design.header.useImage) {
                  <div>
                    <label class="block text-xs text-notion-text-secondary mb-1">URL del logo</label>
                    <input type="text" [(ngModel)]="design.header.imageUrl" (ngModelChange)="refreshPreview()" class="w-full px-3 py-2 border border-notion-border rounded-notion" placeholder="https://...">
                    @if (design.header.imageUrl) {
                      <img [src]="design.header.imageUrl" class="mt-2 max-h-24 rounded-notion border border-notion-border" alt="Logo preview">
                    }
                  </div>
                } @else {
                  <div>
                    <label class="block text-xs text-notion-text-secondary mb-1">Texto del header</label>
                    <input type="text" [(ngModel)]="design.header.text" (ngModelChange)="refreshPreview()" class="w-full px-3 py-2 border border-notion-border rounded-notion" placeholder="Nombre de tu empresa">
                  </div>
                }

                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs text-notion-text-secondary mb-1">Color fondo header</label>
                    <div class="flex items-center gap-2">
                      <input type="color" [(ngModel)]="design.header.backgroundColor" (ngModelChange)="refreshPreview()" class="w-8 h-8 rounded-notion cursor-pointer border border-notion-border">
                      <span class="text-xs text-notion-text-secondary">{{ design.header.backgroundColor }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-notion-text-secondary mb-1">Color texto</label>
                    <div class="flex items-center gap-2">
                      <input type="color" [(ngModel)]="design.header.textColor" (ngModelChange)="refreshPreview()" class="w-8 h-8 rounded-notion cursor-pointer border border-notion-border">
                      <span class="text-xs text-notion-text-secondary">{{ design.header.textColor }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-notion-text-secondary mb-1">Altura (px)</label>
                    <input type="number" [(ngModel)]="design.header.height" (ngModelChange)="refreshPreview()" class="w-full px-2 py-1 border border-notion-border rounded-notion" min="40" max="200">
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- CONTENIDO -->
          <div class="border border-notion-border rounded-notion overflow-hidden">
            <div class="bg-notion-bg-secondary px-4 py-3">
              <span class="font-medium text-notion-text">Contenido del email</span>
            </div>
            <div class="p-4 space-y-4 bg-white">

              <!-- Bloques de contenido -->
              @for (block of design.content; track block.id; let i = $index) {
                <div class="border border-notion-border rounded-notion p-3 relative group mb-3 bg-white hover:border-notion-text transition-colors">
                  <div class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
                    <button (click)="duplicateBlock(i)" class="w-6 h-6 bg-notion-text text-white rounded-full text-xs hover:bg-opacity-80 shadow-notion" title="Duplicar">⧉</button>
                    <button (click)="moveBlock(i, -1)" [disabled]="i === 0" class="w-6 h-6 bg-notion-text-secondary text-white rounded-full text-xs hover:bg-notion-text shadow-notion disabled:opacity-50" title="Subir">↑</button>
                    <button (click)="moveBlock(i, 1)" [disabled]="i === design.content.length - 1" class="w-6 h-6 bg-notion-text-secondary text-white rounded-full text-xs hover:bg-notion-text shadow-notion disabled:opacity-50" title="Bajar">↓</button>
                    <button (click)="removeBlock(i)" class="w-6 h-6 bg-notion-red text-white rounded-full text-xs hover:bg-opacity-80 shadow-notion" title="Eliminar">×</button>
                  </div>
                  
                  <!-- Tipo de bloque indicador -->
                  <div class="absolute -left-2 -top-2 bg-notion-bg-secondary text-notion-text text-xs px-2 py-0.5 rounded-notion border border-notion-border">
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
                                class="w-full p-3 border border-notion-border rounded-notion resize-none focus:ring-2 focus:ring-notion-blue focus:border-transparent" 
                                placeholder="Escribe aquí..."></textarea>
                    </div>
                  } @else if (block.type === 'image') {
                    <div class="mt-4">
                      <input type="text" [(ngModel)]="block.url" (ngModelChange)="block.url = $event; refreshPreview()"
                             class="w-full px-3 py-2 border border-notion-border rounded-notion mb-2 text-sm" 
                             placeholder="URL de la imagen (https://...)">
                      @if (block.url) {
                        <div class="relative">
                          <img [src]="block.url" class="max-h-48 mx-auto rounded-notion border border-notion-border" alt="Vista previa">
                          <button (click)="block.url = ''; refreshPreview()" class="absolute top-2 right-2 w-6 h-6 bg-notion-red text-white rounded-full text-xs hover:bg-opacity-80">×</button>
                        </div>
                      }
                    </div>
                  } @else if (block.type === 'button') {
                    <div class="mt-4 p-4 bg-notion-bg-secondary rounded-notion">
                      <label class="block text-xs text-notion-text-secondary mb-2 font-medium">Configuración del botón</label>
                      <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label class="block text-xs text-notion-text-tertiary mb-1">Texto del botón</label>
                          <input type="text" [(ngModel)]="block.content" (ngModelChange)="block.content = $event; refreshPreview()"
                                 class="w-full px-3 py-2 border border-notion-border rounded-notion" placeholder="Click aquí">
                        </div>
                        <div>
                          <label class="block text-xs text-notion-text-tertiary mb-1">URL destino</label>
                          <input type="text" [(ngModel)]="block.url" (ngModelChange)="block.url = $event; refreshPreview()"
                                 class="w-full px-3 py-2 border border-notion-border rounded-notion" placeholder="https://...">
                        </div>
                      </div>
                      <div class="grid grid-cols-3 gap-3">
                        <div>
                          <label class="block text-xs text-notion-text-tertiary mb-1">Color del botón</label>
                          <div class="flex items-center gap-2">
                            <input type="color" [(ngModel)]="buttonColor" (ngModelChange)="buttonColor = $event; refreshPreview()" 
                                   class="w-8 h-8 rounded-notion cursor-pointer border border-notion-border">
                            <span class="text-xs text-notion-text-secondary">{{ buttonColor() }}</span>
                          </div>
                        </div>
                        <div>
                          <label class="block text-xs text-notion-text-tertiary mb-1">Color texto</label>
                          <div class="flex items-center gap-2">
                            <input type="color" [(ngModel)]="buttonTextColor" (ngModelChange)="buttonTextColor = $event; refreshPreview()" 
                                   class="w-8 h-8 rounded-notion cursor-pointer border border-notion-border">
                            <span class="text-xs text-notion-text-secondary">{{ buttonTextColor() }}</span>
                          </div>
                        </div>
                        <div>
                          <label class="block text-xs text-notion-text-tertiary mb-1">Border radius</label>
                          <input type="number" [(ngModel)]="buttonBorderRadius" (ngModelChange)="buttonBorderRadius = $event; refreshPreview()"
                                 class="w-full px-2 py-1 border border-notion-border rounded-notion" min="0" max="30">
                        </div>
                      </div>
                      <!-- Vista previa del botón -->
                      <div class="mt-3 p-4 bg-white rounded-notion border border-notion-border text-center">
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
                        <label class="text-xs text-notion-text-secondary">Color línea:</label>
                        <input type="color" [(ngModel)]="dividerColor" (ngModelChange)="dividerColor = $event; refreshPreview()" class="w-8 h-8 rounded-notion cursor-pointer border border-notion-border">
                        <span class="text-xs text-notion-text-secondary">{{ dividerColor() }}</span>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Agregar bloques -->
              <div class="flex gap-2 justify-center pt-4 flex-wrap">
                <button (click)="addBlock('rich-text')" 
                        class="px-4 py-2 bg-notion-bg-secondary border border-notion-border rounded-notion text-sm hover:bg-notion-bg-hover transition-colors flex items-center gap-1 text-notion-text">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L15 11.828l-4.586 4.586z"/></svg>
                  + Texto enriquecido
                </button>
                <button (click)="addBlock('image')" 
                        class="px-4 py-2 bg-white border border-notion-border rounded-notion text-sm hover:bg-notion-bg-hover transition-colors flex items-center gap-1 text-notion-text">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  + Imagen
                </button>
                <button (click)="addBlock('button')" 
                        class="px-4 py-2 bg-white border border-notion-border rounded-notion text-sm hover:bg-notion-bg-hover transition-colors flex items-center gap-1 text-notion-text">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                  + Botón
                </button>
                <button (click)="addBlock('divider')" 
                        class="px-4 py-2 bg-white border border-notion-border rounded-notion text-sm hover:bg-notion-bg-hover transition-colors flex items-center gap-1 text-notion-text">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                  + Línea
                </button>
              </div>
            </div>
          </div>

          <!-- FOOTER editable con Quill -->
          <div class="border border-notion-border rounded-notion overflow-hidden">
            <div class="bg-notion-bg-secondary px-4 py-3 flex items-center justify-between cursor-pointer" (click)="showFooterConfig.set(!showFooterConfig())">
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="design.footer.enabled" (ngModelChange)="refreshPreview()" class="w-4 h-4 text-notion-text">
                <span class="font-medium text-notion-text">Footer</span>
              </div>
              <svg class="w-5 h-5 text-notion-text-tertiary transition-transform" [class.rotate-180]="showFooterConfig()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            @if (showFooterConfig() && design.footer.enabled) {
              <div class="p-4 space-y-4 bg-white">
                <!-- Editor Quill para contenido del footer -->
                <div>
                  <label class="block text-xs text-notion-text-secondary mb-1">Contenido del footer (editable)</label>
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
                    <label class="block text-xs text-notion-text-secondary mb-1">Color fondo footer</label>
                    <div class="flex items-center gap-2">
                      <input type="color" [(ngModel)]="design.footer.backgroundColor" (ngModelChange)="refreshPreview()" class="w-10 h-10 rounded-notion cursor-pointer border border-notion-border">
                      <span class="text-sm text-notion-text-secondary">{{ design.footer.backgroundColor }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-notion-text-secondary mb-1">Color texto</label>
                    <div class="flex items-center gap-2">
                      <input type="color" [(ngModel)]="design.footer.textColor" (ngModelChange)="refreshPreview()" class="w-10 h-10 rounded-notion cursor-pointer border border-notion-border">
                      <span class="text-sm text-notion-text-secondary">{{ design.footer.textColor }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                  <input type="checkbox" [(ngModel)]="design.footer.showUnsubscribe" (ngModelChange)="refreshPreview()" id="showUnsubscribeFooter" class="w-4 h-4 text-notion-text">
                  <label for="showUnsubscribeFooter" class="text-sm text-notion-text">Mostrar enlace de baja</label>
                </div>
              </div>
            }
          </div>

        </div>
      }

        <!-- Columna derecha: Previsualizador -->
        <div class="rounded-notion overflow-hidden bg-white border border-notion-border shadow-notion h-fit sticky top-4">
          <div class="bg-notion-text px-4 py-2 text-sm font-medium text-white flex items-center justify-between">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Vista previa
            </span>
            <span class="text-xs opacity-75">📱 Desktop</span>
          </div>
          <div class="bg-notion-bg-secondary p-2">
            <iframe [srcdoc]="getFinalHtml()" class="w-full h-[600px] border-0 rounded-notion shadow-notion bg-white"></iframe>
          </div>
        </div>

      <!-- BOTONES -->
      <div class="flex justify-between pt-4">
        <button type="button" (click)="onBack.emit()" class="px-5 py-2 border border-notion-border text-notion-text rounded-notion hover:bg-notion-bg-hover text-sm font-medium">
          ← Anterior
        </button>
        <button type="button" (click)="continue()" [disabled]="!isValid()" class="px-5 py-2 bg-notion-text text-white rounded-notion hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
          Siguiente: Audiencia →
        </button>
      </div>

    </div>
    
    <!-- Modal de confirmación personalizado -->
    @if (showConfirmModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-notion shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          <div class="bg-notion-text px-6 py-4">
            <h3 class="text-lg font-semibold text-white">Confirmar acción</h3>
          </div>
          <div class="p-6">
            <p class="text-notion-text text-base mb-6">{{ confirmModalMessage() }}</p>
            
            <!-- Si hay contenido en ambos editores, mostrar opciones -->
            @if (hasVisualAndHtmlContent()) {
              <div class="flex gap-3">
                <button type="button" (click)="chooseEditor('visual')" 
                        class="flex-1 px-4 py-3 bg-notion-bg-secondary border-2 border-notion-border text-notion-text rounded-notion hover:bg-notion-bg-hover transition-colors font-medium">
                  Editor visual
                </button>
                <button type="button" (click)="chooseEditor('html')" 
                        class="flex-1 px-4 py-3 bg-notion-bg-secondary border-2 border-notion-border text-notion-text rounded-notion hover:bg-notion-bg-hover transition-colors font-medium">
                  HTML propio
                </button>
              </div>
            } @else {
              <div class="flex gap-3 justify-end">
                <button type="button" (click)="closeConfirmModal(false)" 
                        class="px-4 py-2 border border-notion-border text-notion-text rounded-notion hover:bg-notion-bg-hover transition-colors">
                  Cancelar
                </button>
                <button type="button" (click)="closeConfirmModal(true)" 
                        class="px-4 py-2 bg-notion-text text-white rounded-notion hover:bg-opacity-90 transition-colors">
                  Aceptar
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }
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
  htmlPreviewMode = signal<'desktop' | 'mobile'>('desktop');
  showHeaderConfig = signal(true);
  showFooterConfig = signal(true);
  
  customHtml = signal('');
  cachedHtml = signal(''); // Caché para HTML personalizado
  
  // Estado del modal de confirmación
  showConfirmModal = signal(false);
  confirmModalMessage = signal('');
  confirmModalAction = signal<(() => void) | null>(null);
  
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
    // Si hay un diseño inicial, usarlo; sino dejar vacío para que el usuario agregue bloques
    try {
      if (this.initialDesign) {
        this.applyInitialDesign();
      }
      // No se agregan bloques por defecto
    } catch (e) {
      console.error('Error initializing design:', e);
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
    
    // Si hay customHtml (del borrador guardado) y estamos en modo template,
    // guardarlo en caché para que el usuario pueda verlo si cambia a HTML
    if (design.customHtml && design.customHtml.trim().length > 0) {
      this.cachedHtml.set(design.customHtml);
    }
    
    // Refrescar vista previa
    this.refreshPreview();
  }

  onModeChange() {
    // El usuario puede cambiar libremente entre modos
    // Al cambiar, se maneja la caché automáticamente
    const newMode = this.mode();
    const previousMode = this.design.mode;
    
    if (newMode === 'custom-html') {
      // Cambiar a HTML: cargar de caché si no hay HTML actual
      if (!this.customHtml() && this.cachedHtml()) {
        this.customHtml.set(this.cachedHtml());
      }
    } else if (newMode === 'template') {
      // Cambiar a editor visual: guardar HTML en caché antes de limpiar
      if (this.customHtml() && this.customHtml().trim().length > 0) {
        this.cachedHtml.set(this.customHtml());
      }
      this.customHtml.set('');
    }
    
    this.design.mode = newMode;
    this.refreshPreview();
  }
  

  closeConfirmModal(confirmed: boolean) {
    this.showConfirmModal.set(false);
    if (confirmed && this.confirmModalAction()) {
      this.confirmModalAction()!();
    }
    this.confirmModalAction.set(null);
  }
  
  hasVisualAndHtmlContent(): boolean {
    const hasVisualContent = this.design.content && this.design.content.length > 0;
    const hasHtmlContent = !!(this.customHtml() && this.customHtml().trim().length > 0) || 
                           !!(this.cachedHtml() && this.cachedHtml().trim().length > 0);
    return hasVisualContent && hasHtmlContent;
  }
  
  chooseEditor(choice: 'visual' | 'html') {
    this.showConfirmModal.set(false);
    
    if (choice === 'visual') {
      // Usar editor visual - asegurar que estamos en modo template
      this.mode.set('template');
      this.design.mode = 'template';
      // Limpiar HTML actual si hay uno en el campo (mantener solo caché)
      this.customHtml.set('');
    } else {
      // Usar HTML - obtener de campo actual o caché (sin sanitizar)
      const htmlToUse = this.customHtml() || this.cachedHtml();
      this.customHtml.set(htmlToUse);
      this.mode.set('custom-html');
      this.design.mode = 'custom-html';
      // Limpiar contenido visual
      this.design.content = [];
    }
    
    this.confirmModalAction.set(null);
    this.emitFinalDesign();
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

  switchToHtmlMode() {
    // Copiar el HTML guardado al campo de customHtml (sin sanitizar)
    if (this.cachedHtml()) {
      this.customHtml.set(this.cachedHtml());
    }
    // Cambiar al modo HTML
    this.mode.set('custom-html');
    this.design.mode = 'custom-html';
    this.refreshPreview();
  }

  clearCachedHtml() {
    // Limpiar el HTML guardado en caché
    this.cachedHtml.set('');
    this.refreshPreview();
  }

  // Parsear HTML guardado y convertir a bloques del diseñador visual
  parseHtmlToBlocks() {
    const html = this.cachedHtml();
    if (!html || html.trim().length === 0) {
      alert('No hay contenido HTML para importar');
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const blocks: ContentBlock[] = [];

    // Buscar el contenedor principal del email
    const container = doc.querySelector('.container') || doc.body;
    
    // Procesar cada elemento hijo directo del contenido
    const contentDivs = container.querySelectorAll('div');
    
    contentDivs.forEach((div, index) => {
      const style = div.getAttribute('style') || '';
      const textAlign = style.includes('text-align:center') ? 'center' : 
                        style.includes('text-align:right') ? 'right' : 'left';
      const fontWeight = style.includes('font-weight:bold') ? true : false;
      const fontStyle = style.includes('font-style:italic') ? 'italic' : 'normal';
      const fontSize = style.includes('font-size:24px') ? 'xlarge' : 
                       style.includes('font-size:20px') ? 'large' : 
                       style.includes('font-size:14px') ? 'small' : 'normal';
      const fontFamily = style.match(/font-family:([^;]+)/)?.[1] || 'Arial';
      const color = style.match(/color:\s*([^;]+)/)?.[1] || '#333333';

      // Detectar tipo de bloque por contenido y estructura
      const img = div.querySelector('img');
      const button = div.querySelector('a');
      const hr = div.querySelector('hr');

      // Verificar si es un botón (tiene estilo de botón)
      const buttonStyle = button?.getAttribute('style') || '';
      const isButton = button && (
        buttonStyle.includes('background:') || 
        buttonStyle.includes('background-color:') ||
        button.textContent?.trim()
      );

      if (hr) {
        // Es un divisor
        blocks.push({
          id: Date.now().toString() + index,
          type: 'divider',
          content: '',
          padding: 20,
          style: { fontFamily: 'Arial', fontSize: 'normal', color: '#333333', align: 'left' }
        });
      } else if (img && !button) {
        // Es una imagen
        const imgSrc = img.getAttribute('src') || '';
        blocks.push({
          id: Date.now().toString() + index,
          type: 'image',
          content: '',
          url: imgSrc,
          padding: 20,
          style: { fontFamily: 'Arial', fontSize: 'normal', color: '#333333', align: textAlign }
        });
      } else if (isButton) {
        // Es un botón
        const buttonText = button?.textContent?.trim() || 'Click aquí';
        const buttonUrl = button?.getAttribute('href') || '#';
        const btnBgColor = buttonStyle.match(/background(-color)?:\s*([^;]+)/)?.[2]?.trim() || '#4f46e5';
        const btnTextColor = buttonStyle.match(/color:\s*([^;]+)/)?.[1]?.trim() || '#ffffff';
        const btnRadius = parseInt(buttonStyle.match(/border-radius:\s*(\d+)px/)?.[1] || '6');

        // Actualizar colores del botón global
        this.buttonColor.set(btnBgColor);
        this.buttonTextColor.set(btnTextColor);
        this.buttonBorderRadius.set(btnRadius);

        blocks.push({
          id: Date.now().toString() + index,
          type: 'button',
          content: buttonText,
          url: buttonUrl,
          padding: 20,
          style: { fontFamily: 'Arial', fontSize: 'normal', color: '#333333', align: textAlign }
        });
      } else if (div.textContent?.trim() || div.innerHTML.includes('<')) {
        // Es texto (rich-text o texto simple)
        const innerHtml = div.innerHTML.trim();
        const hasFormatting = innerHtml.includes('<b>') || 
                            innerHtml.includes('<strong>') || 
                            innerHtml.includes('<i>') || 
                            innerHtml.includes('<em>') ||
                            innerHtml.includes('<u>') ||
                            innerHtml.includes('<p>') ||
                            innerHtml.includes('<br');

        if (hasFormatting || innerHtml.includes('<')) {
          // Usar rich-text si tiene formato HTML
          blocks.push({
            id: Date.now().toString() + index,
            type: 'rich-text',
            content: '',
            htmlContent: div.innerHTML,
            padding: 20,
            style: { fontFamily: fontFamily as FontFamily, fontSize: fontSize as FontSize, color: color, align: textAlign as 'left' | 'center' | 'right', bold: fontWeight, italic: fontStyle === 'italic' }
          });
        } else {
          // Texto simple
          blocks.push({
            id: Date.now().toString() + index,
            type: 'text',
            content: div.textContent?.trim() || '',
            padding: 20,
            style: { fontFamily: fontFamily as FontFamily, fontSize: fontSize as FontSize, color: color, align: textAlign as 'left' | 'center' | 'right', bold: fontWeight, italic: fontStyle === 'italic' }
          });
        }
      }
    });

    // Si no se detectaron bloques, intentar buscar en todo el body
    if (blocks.length === 0) {
      const bodyElements = doc.body.querySelectorAll('*');
      bodyElements.forEach((el, index) => {
        if (el.tagName === 'IMG' && !el.closest('a')) {
          blocks.push({
            id: Date.now().toString() + 'img' + index,
            type: 'image',
            content: '',
            url: el.getAttribute('src') || '',
            padding: 20,
            style: { fontFamily: 'Arial', fontSize: 'normal', color: '#333333', align: 'center' }
          });
        } else if (el.tagName === 'A' && el.closest('div')) {
          const aStyle = el.getAttribute('style') || '';
          if (aStyle.includes('display:inline-block') || aStyle.includes('background')) {
            blocks.push({
              id: Date.now().toString() + 'btn' + index,
              type: 'button',
              content: el.textContent?.trim() || 'Click aquí',
              url: el.getAttribute('href') || '#',
              padding: 20,
              style: { fontFamily: 'Arial', fontSize: 'normal', color: '#333333', align: 'center' }
            });
          }
        } else if (el.tagName === 'HR') {
          blocks.push({
            id: Date.now().toString() + 'hr' + index,
            type: 'divider',
            content: '',
            padding: 20,
            style: { fontFamily: 'Arial', fontSize: 'normal', color: '#333333', align: 'left' }
          });
        }
      });
    }

    if (blocks.length > 0) {
      // Asignar los bloques al diseño
      this.design.content = blocks;
      // Limpiar la caché después de importar
      this.cachedHtml.set('');
      // Forzar actualización de la vista
      this.refreshPreview();
      this.cdr.detectChanges();
    } else {
      alert('No se pudieron detectar bloques en el HTML. Puedes editar el contenido como HTML.');
    }
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

  onCustomHtmlChange(value: string) {
    this.customHtml.set(value);
    this.refreshPreview();
  }

  getCustomHtmlPreview(): string {
    const userHtml = this.customHtml();
    
    if (!userHtml || userHtml.trim().length === 0) {
      return '<!DOCTYPE html><html><head></head><body style="font-family: Arial, sans-serif; padding: 20px; color: #666;"><p style="text-align: center;">Escribe tu HTML en el editor</p></body></html>';
    }
    
    const cssReset = '<style>body{margin:0!important;padding:0!important}table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt}td,th{border-collapse:collapse;padding:0}img{border:0;height:auto;line-height:100%;-ms-interpolation-mode:bicubic;max-width:100%}</style>';
    
    const hasHtml = userHtml.toLowerCase().includes('<html');
    const hasHead = userHtml.toLowerCase().includes('<head>');
    const hasBody = userHtml.toLowerCase().includes('<body');
    
    if (hasHtml && hasHead) {
      return userHtml.replace(/<head[^>]*>/i, '$&' + cssReset);
    }
    
    if (hasBody) {
      return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' + cssReset + '</head>' + userHtml + '</html>';
    }
    
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' + cssReset + '</head><body>' + userHtml + '</body></html>';
  }

  /**
   * Sanitiza el HTML para que sea compatible con clientes de correo electrónico
   * Los clientes de correo (especialmente Outlook) tienen soporte limitado para CSS moderno
   * Esta función preserva el HTML del usuario y solo hace correcciones mínimas necesarias
   */
  sanitizeHtmlForEmail(html: string): string {
    if (!html || html.trim().length === 0) {
      return html;
    }

    // 1. NO eliminar los estilos del <style> - preservarlos ya que Gmail/Apple Mail los soportan
    // Solo hacemos correcciones mínimas

    // 2. Verificar y agregar DOCTYPE si no existe
    if (!html.toLowerCase().includes('<!doctype html>')) {
      html = '<!DOCTYPE html>' + html;
    }

    // 3. Agregar meta viewport si no existe (importante para móviles)
    if (!html.includes('viewport')) {
      html = html.replace(/<head>/i, '<head><meta name="viewport" content="width=device-width, initial-scale=1.0">');
    }

    // 4. Asegurar que las imágenes tengan estilos responsive
    html = html.replace(/<img([^>]*)>/gi, (match, attrs) => {
      // Si ya tiene style, no modificar
      if (attrs.includes('style=')) {
        return match;
      }
      return `<img${attrs} style="max-width:100%;height:auto;">`;
    });

    // 5. Eliminar JavaScript (no se ejecuta en emails y puede causar problemas)
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

    // 6. Los comentarios condicionales de IE pueden mantenerse o eliminarse
    // Por seguridad, los mantenemos ya que el HTML del usuario ya los tiene correctamente

    // 7. Agregar preheader si no existe (texto oculto que aparece antes de abrir)
    if (!html.includes('preheader') && !html.includes('display:none')) {
      html = html.replace(/<body[^>]*>/i, '<body><div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Email de Mailboom</div>');
    }

    return html;
  }

  getFinalHtml(): string {
    // Si hay contenido HTML personalizado existente, mostrarlo tal cual
    if (this.customHtml() && this.customHtml().trim().length > 0) {
      return this.customHtml();
    }

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
    const hasVisualContent = this.design.content && this.design.content.length > 0;
    const hasHtmlContent = (this.customHtml() && this.customHtml().trim().length > 0) || 
                           (this.cachedHtml() && this.cachedHtml().trim().length > 0);
    
    // Si hay contenido en AMBOS editores, pedirle al usuario que elija
    if (hasVisualContent && hasHtmlContent) {
      this.showConfirmModal.set(true);
      this.confirmModalMessage.set('Tienes contenido en ambos editores. ¿Qué contenido quieres usar?');
      this.confirmModalAction.set(() => {
        // Usamos el modo actual
        this.proceedWithCurrentMode();
      });
      return;
    }
    
    // Si solo hay contenido en un modo, continuar normalmente
    this.proceedWithCurrentMode();
  }
  
  proceedWithCurrentMode() {
    // Si hay HTML en caché y estamos en modo visual, preguntar si quiere usarlo
    if (this.mode() === 'template' && this.cachedHtml() && this.cachedHtml().trim().length > 0) {
      this.showConfirmModal.set(true);
      this.confirmModalMessage.set('Tienes HTML personalizado en caché. ¿Quieres usarlo?');
      this.confirmModalAction.set(() => {
        this.customHtml.set(this.cachedHtml());
        this.mode.set('custom-html');
        this.design.mode = 'custom-html';
        this.emitFinalDesign();
      });
      return;
    }
    
    this.emitFinalDesign();
  }
  
  emitFinalDesign() {
    const finalDesign: EmailDesign = {
      ...this.design,
      customHtml: this.mode() === 'custom-html' ? this.customHtml() : undefined
    };
    this.onNext.emit(finalDesign);
  }
}
