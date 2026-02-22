import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Configuración de imagen para el diálogo
 */
export interface ImageDialogConfig {
  src: string;
  alt: string;
  link: string;
  width: string;
  height: string;
  align: 'left' | 'center' | 'right';
}

/**
 * Diálogo de configuración de imagen
 * Permite configurar URL, tamaño, alineación y otros atributos de la imagen
 */
@Component({
  selector: 'app-image-config-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isVisible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="onCancel()">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h3 class="text-lg font-semibold text-white">Configurar Imagen</h3>
            <p class="text-indigo-100 text-sm mt-1">Ajusta las propiedades de la imagen</p>
          </div>
          
          <!-- Content -->
          <div class="p-6 space-y-4">
            <!-- URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL de la imagen *</label>
              <input type="url" 
                     [(ngModel)]="config.src"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                     placeholder="https://ejemplo.com/imagen.jpg">
            </div>
            
            <!-- Alt Text -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Texto alternativo</label>
              <input type="text" 
                     [(ngModel)]="config.alt"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                     placeholder="Descripción de la imagen">
            </div>
            
            <!-- Tamaño -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ancho</label>
                <div class="flex items-center gap-2">
                  <input type="number" 
                         [(ngModel)]="widthValue"
                         (ngModelChange)="updateWidth()"
                         class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                         placeholder="100">
                  <select [(ngModel)]="widthUnit" 
                          (ngModelChange)="updateWidth()"
                          class="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="%">%</option>
                    <option value="px">px</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alto</label>
                <div class="flex items-center gap-2">
                  <input type="text" 
                         [(ngModel)]="config.height"
                         class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                         placeholder="auto">
                  <span class="text-xs text-gray-500">auto/px</span>
                </div>
              </div>
            </div>
            
            <!-- Presets de tamaño -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tamaños predefinidos</label>
              <div class="flex flex-wrap gap-2">
                <button type="button" 
                        (click)="setPresetSize('100%', 'auto')"
                        class="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Ancho completo
                </button>
                <button type="button" 
                        (click)="setPresetSize('75%', 'auto')"
                        class="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  75%
                </button>
                <button type="button" 
                        (click)="setPresetSize('50%', 'auto')"
                        class="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  50%
                </button>
                <button type="button" 
                        (click)="setPresetSize('300px', 'auto')"
                        class="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  300px
                </button>
                <button type="button" 
                        (click)="setPresetSize('600px', 'auto')"
                        class="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  600px
                </button>
              </div>
            </div>
            
            <!-- Alineación -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Alineación</label>
              <div class="flex gap-2">
                <button type="button" 
                        (click)="config.align = 'left'"
                        [class.bg-indigo-100]="config.align === 'left'"
                        [class.text-indigo-700]="config.align === 'left'"
                        [class.border-indigo-500]="config.align === 'left'"
                        class="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  ← Izquierda
                </button>
                <button type="button" 
                        (click)="config.align = 'center'"
                        [class.bg-indigo-100]="config.align === 'center'"
                        [class.text-indigo-700]="config.align === 'center'"
                        [class.border-indigo-500]="config.align === 'center'"
                        class="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  ↑ Centro
                </button>
                <button type="button" 
                        (click)="config.align = 'right'"
                        [class.bg-indigo-100]="config.align === 'right'"
                        [class.text-indigo-700]="config.align === 'right'"
                        [class.border-indigo-500]="config.align === 'right'"
                        class="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  → Derecha
                </button>
              </div>
            </div>
            
            <!-- Link -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Enlace (opcional)</label>
              <input type="url" 
                     [(ngModel)]="config.link"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                     placeholder="https://ejemplo.com">
            </div>
            
            <!-- Preview -->
            @if (config.src) {
              <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p class="text-xs text-gray-500 mb-2">Vista previa:</p>
                <div class="flex justify-center" [class]="getAlignmentClass()">
                  <img [src]="config.src" 
                       [alt]="config.alt || 'Preview'"
                       [style.width]="config.width"
                       [style.height]="config.height"
                       class="max-w-full rounded-lg shadow-sm"
                       style="max-height: 150px; object-fit: contain;"
                       (error)="onImageError($event)">
                </div>
              </div>
            }
          </div>
          
          <!-- Footer -->
          <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button type="button" 
                    (click)="onCancel()"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="button" 
                    (click)="onInsert()"
                    [disabled]="!config.src"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Insertar Imagen
            </button>
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
export class ImageConfigDialogComponent {
  @Input() isVisible = signal(false);
  @Input() initialSrc = '';
  @Output() onConfirm = new EventEmitter<ImageDialogConfig>();
  @Output() onCancelClick = new EventEmitter<void>();
  
  config: ImageDialogConfig = {
    src: '',
    alt: '',
    link: '',
    width: '100%',
    height: 'auto',
    align: 'center'
  };
  
  widthValue = 100;
  widthUnit = '%';
  
  ngOnInit() {
    if (this.initialSrc) {
      this.config.src = this.initialSrc;
    }
  }
  
  show(src: string = '') {
    this.config = {
      src: src,
      alt: '',
      link: '',
      width: '100%',
      height: 'auto',
      align: 'center'
    };
    this.parseWidth();
    this.isVisible.set(true);
  }
  
  hide() {
    this.isVisible.set(false);
  }
  
  updateWidth() {
    if (this.widthUnit === '%') {
      this.config.width = `${Math.min(100, Math.max(1, this.widthValue))}%`;
    } else {
      this.config.width = `${Math.max(1, this.widthValue)}px`;
    }
  }
  
  parseWidth() {
    const width = this.config.width;
    if (width.endsWith('%')) {
      this.widthValue = parseInt(width) || 100;
      this.widthUnit = '%';
    } else if (width.endsWith('px')) {
      this.widthValue = parseInt(width) || 300;
      this.widthUnit = 'px';
    } else {
      this.widthValue = 100;
      this.widthUnit = '%';
    }
  }
  
  setPresetSize(width: string, height: string) {
    this.config.width = width;
    this.config.height = height;
    this.parseWidth();
  }
  
  getAlignmentClass(): string {
    switch (this.config.align) {
      case 'left': return 'justify-start';
      case 'right': return 'justify-end';
      default: return 'justify-center';
    }
  }
  
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZW5jb250cmFkYTwvdGV4dD48L3N2Zz4=';
  }
  
  onInsert() {
    if (this.config.src) {
      this.onConfirm.emit({ ...this.config });
      this.hide();
    }
  }
  
  onCancel() {
    this.hide();
    this.onCancelClick.emit();
  }
}
