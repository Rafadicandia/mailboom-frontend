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
import { EmailDesign, EditorMode } from '../templates/template.model';
import { 
  EmailEditorComponent, 
  MjmlConverterService,
  EmailDocument,
  PRESET_COLORS,
  EMAIL_FONTS
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
          <div class="w-64 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
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
                <li>• Selecciona texto para formatear</li>
                <li>• Usa variables como {{"{{name}}"}}, {{"{{email}}"}}</li>
              </ul>
            </div>
          </div>
          
          <!-- Editor principal -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <app-email-editor
              #emailEditor
              [globalStyles]="globalStyles"
              (contentChange)="onContentChange($event)"
              (mjmlChange)="onMjmlChange($event)"
              (htmlChange)="onHtmlChange($event)">
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
              <iframe [srcdoc]="generatePreviewHtml()"
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
  
  customHtml = '';
  currentMjml = signal('');
  currentContent: any = null;
  currentHtml = signal(''); // HTML generado por el editor
  
  globalStyles = {
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
    maxWidth: 600,
    preheaderText: ''
  };
  
  fonts = EMAIL_FONTS;
  
  constructor(
    private cdr: ChangeDetectorRef,
    private mjmlConverter: MjmlConverterService
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
    
    if (this.initialDesign.mode === 'custom-html' && this.initialDesign.customHtml) {
      this.customHtml = this.initialDesign.customHtml;
    }
  }
  
  onModeChange() {
    // Limpiar contenido al cambiar de modo
    this.currentContent = null;
    this.currentMjml.set('');
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
  
  onMjmlChange(mjml: string) {
    this.currentMjml.set(mjml);
    this.cdr.detectChanges();
  }
  
  onHtmlChange(html: string) {
    this.currentHtml.set(html);
    this.cdr.detectChanges();
  }
  
  onCustomHtmlChange() {
    // Actualizar vista previa
    this.cdr.detectChanges();
  }
  
  generatePreviewHtml(): string {
    const html = this.currentHtml();
    if (!html || html.trim().length === 0 || html === '<p></p>') {
      return '<!DOCTYPE html><html><head></head><body style="font-family: Arial, sans-serif; padding: 40px; color: #666; text-align: center;"><p>Escribe "/" para comenzar a diseñar</p></body></html>';
    }
    
    // Incluir estilos CSS para que el contenido se vea correctamente
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
    
    /* Bloques de email */
    .email-button { 
      display: inline-block; 
      padding: 12px 24px; 
      background-color: #4F46E5; 
      color: #ffffff; 
      border-radius: 8px; 
      text-decoration: none; 
      font-weight: 600;
      margin: 1em 0;
    }
    .email-divider { border-top: 2px solid #e5e7eb; margin: 20px 0; }
    .email-spacer { height: 40px; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  }
  
  getCustomHtmlPreview(): string {
    if (!this.customHtml || this.customHtml.trim().length === 0) {
      return '<!DOCTYPE html><html><head></head><body style="font-family: Arial, sans-serif; padding: 40px; color: #666; text-align: center;"><p>Escribe tu HTML en el editor</p></body></html>';
    }
    
    // Agregar estilos base si no tiene estructura HTML completa
    if (!this.customHtml.toLowerCase().includes('<!doctype')) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${this.customHtml}
</body>
</html>`;
    }
    
    return this.customHtml;
  }
  
  /**
   * Convierte MJML a HTML (simplificado para vista previa)
   * En producción, usar el servidor para convertir MJML
   */
  private mjmlToHtml(mjml: string): string {
    // Esta es una conversión muy simplificada para la vista previa
    // El MJML real debe procesarse en el backend con el paquete mjml de Node.js
    
    let html = mjml;
    
    // Convertir etiquetas MJML básicas a HTML
    html = html.replace(/<mjml>/g, '<!DOCTYPE html><html>');
    html = html.replace(/<\/mjml>/g, '</html>');
    html = html.replace(/<mj-body>/g, '<body style="margin:0;padding:0;">');
    html = html.replace(/<\/mj-body>/g, '</body>');
    html = html.replace(/<mj-container>/g, '<div style="max-width:600px;margin:0 auto;">');
    html = html.replace(/<\/mj-container>/g, '</div>');
    html = html.replace(/<mj-section>/g, '<div style="padding:20px;">');
    html = html.replace(/<\/mj-section>/g, '</div>');
    html = html.replace(/<mj-column>/g, '<div style="display:inline-block;vertical-align:top;width:100%;">');
    html = html.replace(/<\/mj-column>/g, '</div>');
    html = html.replace(/<mj-text([^>]*)>/g, '<p$1>');
    html = html.replace(/<\/mj-text>/g, '</p>');
    html = html.replace(/<mj-button([^>]*)>/g, '<a$1 style="display:inline-block;padding:16px 32px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:8px;">');
    html = html.replace(/<\/mj-button>/g, '</a>');
    html = html.replace(/<mj-image([^>]*)\/>/g, '<img$1 style="max-width:100%;height:auto;" />');
    html = html.replace(/<mj-divider([^>]*)\/>/g, '<hr$1 style="border:none;border-top:2px solid #e5e7eb;margin:20px 0;" />');
    html = html.replace(/<mj-spacer([^>]*)\/>/g, '<div$1></div>');
    
    return html;
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
    const design: EmailDesign = {
      mode: this.mode(),
      backgroundColor: this.globalStyles.backgroundColor,
      contentMaxWidth: this.globalStyles.maxWidth,
      header: {
        enabled: false,
        useImage: false,
        imageUrl: '',
        text: '',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        height: 80
      },
      content: [],
      footer: {
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
      }
    };
    
    if (this.mode() === 'custom-html') {
      design.customHtml = this.customHtml;
    } else {
      // Guardar el MJML generado por el editor
      const mjml = this.currentMjml();
      // Convertir MJML a HTML directamente en el frontend
      design.customHtml = this.mjmlConverter.convertMjmlToHtml(mjml);
      // También guardar el JSON del editor para poder editarlo después
      design.editorContent = this.currentContent;
    }
    
    this.onNext.emit(design);
  }
}
