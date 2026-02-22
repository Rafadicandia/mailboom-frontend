import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  signal, 
  ViewChild,
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
 * Componente de paso de revisión con vista previa del email
 * Muestra el diseño final del email antes de enviar
 */
@Component({
  selector: 'app-review-step',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    EmailEditorComponent
  ],
  template: `
    <div class="review-step-container h-full flex flex-col">
      
      <!-- Vista previa del email -->
      <div class="flex-1 flex gap-4 p-4 overflow-hidden">
        
        <!-- Panel de vista previa completa -->
        <div class="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
          <div class="bg-gray-900 px-4 py-2 text-sm font-medium text-white flex items-center justify-between">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Vista previa completa
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
                    style="min-height: 600px;"></iframe>
          </div>
        </div>
      </div>

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
          Finalizar y Enviar →
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class ReviewStepComponent implements OnInit {
  @Input() design?: EmailDesign;
  @Output() onNext = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();
  
  previewMode = signal<'desktop' | 'mobile'>('desktop');
  
  constructor(
    private cdr: ChangeDetectorRef,
    private mjmlConverter: MjmlConverterService
  ) {}
  
  ngOnInit() {
    if (this.design) {
      this.applyInitialDesign();
    }
  }
  
  applyInitialDesign() {
    if (!this.design) return;
    
    // Aplicar estilos y contenido del diseño
    this.cdr.detectChanges();
  }
  
  generatePreviewHtml(): string {
    if (!this.design) {
      return '<!DOCTYPE html><html><head></head><body style="font-family: Arial, sans-serif; padding: 40px; color: #666; text-align: center;"><p>No hay diseño para mostrar</p></body></html>';
    }
    
    // Convertir los bloques de contenido a HTML
    const htmlContent = this.design.content.map(block => {
      switch (block.type) {
        case 'text':
        case 'rich-text':
          return block.htmlContent || block.content || '';
        case 'image':
          return `<img src="${block.url || ''}" alt="${block.content || ''}" style="max-width: 100%; height: auto;" />`;
        case 'button':
          return `<a href="${block.url || '#'}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 1em 0;">${block.content || 'Botón'}</a>`;
        case 'divider':
          return '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 20px 0;" />';
        case 'image-with-caption':
          return `<img src="${block.url || ''}" alt="${block.content || ''}" style="max-width: 100%; height: auto;" />
                  <p style="margin: 0.5em 0;">${block.caption?.text || ''}</p>`;
        case 'columns-row':
          return '<div style="display: flex; gap: 20px;">' + 
                 (block.columnConfig?.blocks || []).map(colBlock => 
                   `<div style="flex: 1;">${colBlock.htmlContent || colBlock.content || ''}</div>`
                 ).join('') + '</div>';
        default:
          return block.content || '';
      }
    }).join('');
    
    if (!htmlContent || htmlContent.trim().length === 0) {
      return '<!DOCTYPE html><html><head></head><body style="font-family: Arial, sans-serif; padding: 40px; color: #666; text-align: center;"><p>No hay contenido para mostrar</p></body></html>';
    }
    
    // Incluir estilos CSS para que el contenido se vea correctamente
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
      font-family: Arial, sans-serif; 
      background-color: ${this.design.backgroundColor || '#ffffff'};
      font-size: 16px;
      line-height: 1.6;
      color: #333;
    }
    
    /* Tipografía base */
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
  ${htmlContent}
</body>
</html>`;
  }
  
  isValid(): boolean {
    return this.design !== undefined && 
           this.design.content !== undefined && 
           this.design.content.length > 0;
  }
  
  continue() {
    this.onNext.emit();
  }
}