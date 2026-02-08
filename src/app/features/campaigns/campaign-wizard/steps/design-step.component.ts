import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EmailDesign, EditorMode, HeaderConfig, FooterConfig, ContentBlock, TextStyle, FontFamily, FontSize } from '../templates/template.model';

@Component({
  selector: 'app-design-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
          
          @if (mode() === 'custom-html') {
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
      @if (mode () === 'template') {
        <div class="space-y-6">
          
          <!-- CONFIGURACIÓN GLOBAL -->
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Configuración general</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Color de fondo</label>
                <input type="color" [(ngModel)]="design.backgroundColor" class="w-full h-10 rounded cursor-pointer">
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">Ancho máximo (px)</label>
                <input type="number" [(ngModel)]="design.contentMaxWidth" class="w-full px-3 py-2 border rounded-lg" min="400" max="800" step="10">
              </div>
            </div>
          </div>

          <!-- HEADER -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-100 px-4 py-3 flex items-center justify-between cursor-pointer" (click)="showHeaderConfig.set(!showHeaderConfig())">
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="design.header.enabled" class="w-4 h-4 text-indigo-600">
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
                    <input type="radio" [(ngModel)]="design.header.useImage" [value]="true" class="mr-2">
                    <span class="text-sm">Imagen</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" [(ngModel)]="design.header.useImage" [value]="false" class="mr-2">
                    <span class="text-sm">Texto</span>
                  </label>
                </div>

                @if (design.header.useImage) {
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">URL de la imagen</label>
                    <input type="text" [(ngModel)]="design.header.imageUrl" class="w-full px-3 py-2 border rounded-lg" placeholder="https://...">
                    @if (design.header.imageUrl) {
                      <img [src]="design.header.imageUrl" class="mt-2 max-h-24 rounded border" alt="Header preview">
                    }
                  </div>
                } @else {
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Texto del header</label>
                    <input type="text" [(ngModel)]="design.header.text" class="w-full px-3 py-2 border rounded-lg" placeholder="Nombre de tu empresa">
                  </div>
                }

                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Color fondo</label>
                    <input type="color" [(ngModel)]="design.header.backgroundColor" class="w-full h-8 rounded cursor-pointer">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Color texto</label>
                    <input type="color" [(ngModel)]="design.header.textColor" class="w-full h-8 rounded cursor-pointer">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Altura (px)</label>
                    <input type="number" [(ngModel)]="design.header.height" class="w-full px-2 py-1 border rounded" min="40" max="200">
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- CONTENIDO -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-100 px-4 py-3">
              <span class="font-medium text-gray-700">Contenido</span>
            </div>
            <div class="p-4 space-y-4 bg-white">
              
              <!-- Herramientas de texto -->
              <div class="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border">
                <select [(ngModel)]="currentStyle.fontFamily" class="text-sm border rounded px-2 py-1">
                  @for (font of fonts; track font) {
                    <option [value]="font">{{ font }}</option>
                  }
                </select>
                <select [(ngModel)]="currentStyle.fontSize" class="text-sm border rounded px-2 py-1">
                  <option value="small">Pequeño</option>
                  <option value="normal">Normal</option>
                  <option value="large">Grande</option>
                  <option value="xlarge">Muy grande</option>
                </select>
                <input type="color" [(ngModel)]="currentStyle.color" class="w-8 h-8 rounded cursor-pointer">
                <div class="flex bg-white rounded border">
                  <button (click)="currentStyle.align = 'left'" [class.bg-gray-200]="currentStyle.align === 'left'" class="px-2 py-1">⬅</button>
                  <button (click)="currentStyle.align = 'center'" [class.bg-gray-200]="currentStyle.align === 'center'" class="px-2 py-1">⬌</button>
                  <button (click)="currentStyle.align = 'right'" [class.bg-gray-200]="currentStyle.align === 'right'" class="px-2 py-1">➡</button>
                </div>
                <button (click)="currentStyle.bold = !currentStyle.bold" [class.bg-gray-200]="currentStyle.bold" class="px-3 py-1 font-bold border rounded">B</button>
                <button (click)="currentStyle.italic = !currentStyle.italic" [class.bg-gray-200]="currentStyle.italic" class="px-3 py-1 italic border rounded">I</button>
              </div>

              <!-- Bloques de contenido -->
              @for (block of design.content; track block.id; let i = $index) {
                <div class="border border-gray-200 rounded-lg p-3 relative group">
                  <div class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button (click)="removeBlock(i)" class="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600">×</button>
                  </div>
                  
                  @if (block.type === 'text') {
                    <div [style.font-family]="block.style?.fontFamily"
                         [style.font-size]="getFontSize(block.style?.fontSize)"
                         [style.color]="block.style?.color"
                         [style.text-align]="block.style?.align"
                         [style.font-weight]="block.style?.bold ? 'bold' : 'normal'"
                         [style.font-style]="block.style?.italic ? 'italic' : 'normal'">
                      <textarea [(ngModel)]="block.content" rows="3" class="w-full p-2 border-0 resize-none focus:ring-0" placeholder="Escribe aquí..."></textarea>
                    </div>
                  } @else if (block.type === 'image') {
                    <div>
                      <input type="text" [(ngModel)]="block.url" class="w-full px-3 py-2 border rounded mb-2 text-sm" placeholder="URL de la imagen">
                      @if (block.url) {
                        <img [src]="block.url" class="max-h-48 mx-auto rounded">
                      }
                    </div>
                  } @else if (block.type === 'button') {
                    <div class="text-center py-2">
                      <input type="text" [(ngModel)]="block.url" class="w-full px-3 py-2 border rounded mb-2 text-sm" placeholder="URL del botón">
                      <input type="text" [(ngModel)]="block.content" class="px-6 py-2 bg-indigo-600 text-white rounded-lg" placeholder="Texto del botón">
                    </div>
                  } @else if (block.type === 'divider') {
                    <hr class="my-4 border-gray-300">
                  }
                </div>
              }

              <!-- Agregar bloques -->
              <div class="flex gap-2 justify-center pt-2">
                <button (click)="addBlock('text')" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">+ Texto</button>
                <button (click)="addBlock('image')" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">+ Imagen</button>
                <button (click)="addBlock('button')" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">+ Botón</button>
                <button (click)="addBlock('divider')" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">+ Línea</button>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-100 px-4 py-3 flex items-center justify-between cursor-pointer" (click)="showFooterConfig.set(!showFooterConfig())">
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="design.footer.enabled" class="w-4 h-4 text-indigo-600">
                <span class="font-medium text-gray-700">Footer profesional</span>
              </div>
              <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="showFooterConfig()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            @if (showFooterConfig() && design.footer.enabled) {
              <div class="p-4 space-y-4 bg-white">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Nombre empresa</label>
                    <input type="text" [(ngModel)]="design.footer.companyName" class="w-full px-3 py-2 border rounded-lg">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Email</label>
                    <input type="text" [(ngModel)]="design.footer.email" class="w-full px-3 py-2 border rounded-lg">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Teléfono</label>
                    <input type="text" [(ngModel)]="design.footer.phone" class="w-full px-3 py-2 border rounded-lg">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Web</label>
                    <input type="text" [(ngModel)]="design.footer.website" class="w-full px-3 py-2 border rounded-lg">
                  </div>
                </div>
                
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Dirección</label>
                  <input type="text" [(ngModel)]="design.footer.address" class="w-full px-3 py-2 border rounded-lg">
                </div>

                <div>
                  <label class="block text-xs text-gray-600 mb-1">Texto adicional</label>
                  <textarea [(ngModel)]="design.footer.customText" rows="2" class="w-full px-3 py-2 border rounded-lg" placeholder="Horario de atención, notas legales, etc."></textarea>
                </div>

                <div class="flex items-center gap-2">
                  <input type="checkbox" [(ngModel)]="design.footer.showUnsubscribe" id="showUnsubscribe" class="w-4 h-4 text-indigo-600">
                  <label for="showUnsubscribe" class="text-sm text-gray-700">Mostrar enlace de baja</label>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Color fondo footer</label>
                    <input type="color" [(ngModel)]="design.footer.backgroundColor" class="w-full h-8 rounded cursor-pointer">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Color texto</label>
                    <input type="color" [(ngModel)]="design.footer.textColor" class="w-full h-8 rounded cursor-pointer">
                  </div>
                </div>
              </div>
            }
          </div>

        </div>
      }

      <!-- VISTA PREVIA FINAL -->
      <div class="border-2 border-indigo-200 rounded-lg overflow-hidden">
        <div class="bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-900 flex items-center justify-between">
          <span>Vista previa final</span>
          <span class="text-xs text-indigo-600">Se actualiza automáticamente</span>
        </div>
        <div class="bg-gray-100">
          <iframe [srcdoc]="getFinalHtml()" class="w-full h-96 border-0"></iframe>
        </div>
      </div>

      <!-- BOTONES -->
      <div class="flex justify-between pt-4">
        <button type="button" (click)="onBack.emit()" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          ← Anterior
        </button>
        <button type="button" (click)="continue()" [disabled]="!isValid()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300">
          Siguiente: Audiencia →
        </button>
      </div>

    </div>
  `
})
export class DesignStepComponent {
  mode = signal<EditorMode>('template');
  htmlViewMode = signal<'code' | 'preview'>('code');
  showHeaderConfig = signal(true);
  showFooterConfig = signal(true);
  
  customHtml = signal('');
  
  fonts: FontFamily[] = ['Arial', 'Georgia', 'Helvetica', 'Times New Roman', 'Verdana', 'Roboto'];
  
  currentStyle: TextStyle = {
    fontFamily: 'Arial',
    fontSize: 'normal',
    color: '#333333',
    align: 'left',
    bold: false,
    italic: false
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

  constructor() {
    this.addBlock('text');
  }

  onModeChange() {
    this.design.mode = this.mode();
  }

  getFontSize(size?: FontSize): string {
    const sizes = { small: '14px', normal: '16px', large: '20px', xlarge: '24px' };
    return sizes[size || 'normal'];
  }

  addBlock(type: ContentBlock['type']) {
    const block: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'button' ? 'Click aquí' : '',
      style: { ...this.currentStyle },
      padding: 20
    };
    this.design.content.push(block);
  }

  removeBlock(index: number) {
    this.design.content.splice(index, 1);
  }

  getCustomHtmlPreview(): string {
    let html = this.customHtml();
    // Reemplazar variables de ejemplo
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

    // Generar HTML del diseñador visual
    const d = this.design;
    
    let contentHtml = d.content.map(block => {
      const style = block.style;
      const baseStyle = style ? 
        `font-family:${style.fontFamily};font-size:${this.getFontSize(style.fontSize)};color:${style.color};text-align:${style.align};font-weight:${style.bold ? 'bold' : 'normal'};font-style:${style.italic ? 'italic' : 'normal'};` 
        : '';
      
      switch (block.type) {
        case 'text':
          return `<div style="${baseStyle}padding:10px 0;">${block.content}</div>`;
        case 'image':
          return block.url ? `<div style="text-align:center;padding:10px 0;"><img src="${block.url}" style="max-width:100%;height:auto;"></div>` : '';
        case 'button':
          return `<div style="text-align:center;padding:20px 0;"><a href="${block.url || '#'}" style="display:inline-block;padding:12px 30px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px;">${block.content}</a></div>`;
        case 'divider':
          return '<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">';
        default:
          return '';
      }
    }).join('');

    const headerHtml = d.header.enabled ? 
      (d.header.useImage && d.header.imageUrl 
        ? `<div style="text-align:center;padding:20px;background:${d.header.backgroundColor};"><img src="${d.header.imageUrl}" style="max-height:${d.header.height}px;width:auto;"></div>`
        : `<div style="padding:20px;background:${d.header.backgroundColor};color:${d.header.textColor};text-align:center;font-size:24px;font-weight:bold;height:${d.header.height}px;display:flex;align-items:center;justify-content:center;">${d.header.text}</div>`
      ) : '';

    const footerHtml = d.footer.enabled ? `
      <div style="padding:30px;background:${d.footer.backgroundColor};color:${d.footer.textColor};font-size:12px;text-align:center;border-top:1px solid #e5e7eb;">
        ${d.footer.companyName ? `<p style="margin:0 0 5px 0;font-weight:bold;">${d.footer.companyName}</p>` : ''}
        ${d.footer.address ? `<p style="margin:0 0 5px 0;">${d.footer.address}</p>` : ''}
        ${d.footer.phone || d.footer.email ? `<p style="margin:0 0 5px 0;">${d.footer.phone} ${d.footer.email ? '| ' + d.footer.email : ''}</p>` : ''}
        ${d.footer.website ? `<p style="margin:0 0 10px 0;"><a href="${d.footer.website}" style="color:${d.footer.textColor};">${d.footer.website}</a></p>` : ''}
        ${d.footer.customText ? `<p style="margin:10px 0;font-size:11px;">${d.footer.customText}</p>` : ''}
        <p style="margin:15px 0 0 0;font-size:11px;">
          Enviado con <a href="https://mailboom.com" style="color:${d.footer.textColor};font-weight:bold;">Mailboom</a>
          ${d.footer.showUnsubscribe ? ` | <a href="{{unsubscribe_link}}" style="color:${d.footer.textColor};">Darme de baja</a>` : ''}
        </p>
      </div>
    ` : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0;padding:0;background:${d.backgroundColor};font-family:Arial,sans-serif; }
    .wrapper { padding:20px; }
    .container { max-width:${d.contentMaxWidth}px;margin:0 auto;background:#ffffff; }
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
    return this.design.content.some(b => b.content.trim().length > 0);
  }

  continue() {
    const finalDesign: EmailDesign = {
      ...this.design,
      customHtml: this.mode() === 'custom-html' ? this.customHtml() : undefined
    };
    this.onNext.emit(finalDesign);
  }
}