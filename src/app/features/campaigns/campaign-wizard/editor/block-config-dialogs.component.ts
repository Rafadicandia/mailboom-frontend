import { Component, Output, EventEmitter, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Configuración de Header para el diálogo
 */
export interface HeaderDialogConfig {
  useImage: boolean;
  logoUrl: string;
  logoWidth: string;
  text: string;
  backgroundColor: string;
  textColor: string;
  align: 'left' | 'center' | 'right';
  padding: string;
}

/**
 * Configuración de Footer para el diálogo
 */
export interface FooterDialogConfig {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  showUnsubscribe: boolean;
  backgroundColor: string;
  textColor: string;
  align: 'left' | 'center' | 'right';
  padding: string;
}

/**
 * Configuración de Columnas para el diálogo
 */
export interface ColumnsDialogConfig {
  columns: { width: string; content: string }[];
  gap: string;
  backgroundColor: string;
}

/**
 * Diálogo de configuración de Header
 */
@Component({
  selector: 'app-header-config-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isVisible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="onCancel()">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" (click)="$event.stopPropagation()">
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h3 class="text-lg font-semibold text-white">Configurar Header</h3>
            <p class="text-indigo-100 text-sm mt-1">Personaliza el encabezado del email</p>
          </div>
          
          <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <!-- Tipo de header -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de header</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2">
                  <input type="radio" [(ngModel)]="config.useImage" [value]="false" name="headerType">
                  <span class="text-sm">Texto</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" [(ngModel)]="config.useImage" [value]="true" name="headerType">
                  <span class="text-sm">Logo/Imagen</span>
                </label>
              </div>
            </div>
            
            @if (config.useImage) {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">URL del logo</label>
                <input type="url" [(ngModel)]="config.logoUrl"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                       placeholder="https://ejemplo.com/logo.png">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ancho del logo</label>
                <input type="text" [(ngModel)]="config.logoWidth"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                       placeholder="200px">
              </div>
            } @else {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Texto del header</label>
                <input type="text" [(ngModel)]="config.text"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                       placeholder="Mi Empresa">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Color del texto</label>
                <div class="flex gap-2">
                  <input type="color" [(ngModel)]="config.textColor" class="w-10 h-10 rounded cursor-pointer">
                  <input type="text" [(ngModel)]="config.textColor"
                         class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>
            }
            
            <!-- Colores -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Color de fondo</label>
              <div class="flex gap-2">
                <input type="color" [(ngModel)]="config.backgroundColor" class="w-10 h-10 rounded cursor-pointer">
                <input type="text" [(ngModel)]="config.backgroundColor"
                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>
            
            <!-- Alineación -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Alineación</label>
              <div class="flex gap-2">
                <button type="button" (click)="config.align = 'left'"
                        [class.bg-indigo-100]="config.align === 'left'"
                        [class.border-indigo-500]="config.align === 'left'"
                        class="flex-1 px-4 py-2 text-sm border rounded-lg">Izquierda</button>
                <button type="button" (click)="config.align = 'center'"
                        [class.bg-indigo-100]="config.align === 'center'"
                        [class.border-indigo-500]="config.align === 'center'"
                        class="flex-1 px-4 py-2 text-sm border rounded-lg">Centro</button>
                <button type="button" (click)="config.align = 'right'"
                        [class.bg-indigo-100]="config.align === 'right'"
                        [class.border-indigo-500]="config.align === 'right'"
                        class="flex-1 px-4 py-2 text-sm border rounded-lg">Derecha</button>
              </div>
            </div>
            
            <!-- Padding -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Padding</label>
              <input type="text" [(ngModel)]="config.padding"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                     placeholder="20px">
            </div>
          </div>
          
          <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button type="button" (click)="onCancel()"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="button" (click)="onInsert()"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Aplicar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class HeaderConfigDialogComponent {
  @Input() isVisible = signal(false);
  @Output() onConfirm = new EventEmitter<HeaderDialogConfig>();
  @Output() onCancelClick = new EventEmitter<void>();
  
  config: HeaderDialogConfig = {
    useImage: false,
    logoUrl: '',
    logoWidth: '200px',
    text: 'Mi Empresa',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    align: 'center',
    padding: '20px'
  };
  
  show() {
    this.isVisible.set(true);
  }
  
  hide() {
    this.isVisible.set(false);
  }
  
  onInsert() {
    this.onConfirm.emit({ ...this.config });
    this.hide();
  }
  
  onCancel() {
    this.hide();
    this.onCancelClick.emit();
  }
}

/**
 * Diálogo de configuración de Footer
 */
@Component({
  selector: 'app-footer-config-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isVisible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="onCancel()">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" (click)="$event.stopPropagation()">
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h3 class="text-lg font-semibold text-white">Configurar Footer</h3>
            <p class="text-indigo-100 text-sm mt-1">Personaliza el pie de página del email</p>
          </div>
          
          <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
              <input type="text" [(ngModel)]="config.companyName"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                     placeholder="Mi Empresa S.L.">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input type="text" [(ngModel)]="config.address"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                     placeholder="Calle Principal 123, Madrid">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" [(ngModel)]="config.phone"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                       placeholder="+34 912 345 678">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" [(ngModel)]="config.email"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                       placeholder="info@miempresa.com">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
              <input type="text" [(ngModel)]="config.website"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                     placeholder="www.miempresa.com">
            </div>
            
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="config.showUnsubscribe">
                <span class="text-sm text-gray-700">Mostrar enlace para darse de baja</span>
              </label>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Color de fondo</label>
                <input type="color" [(ngModel)]="config.backgroundColor" class="w-full h-10 rounded cursor-pointer">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Color del texto</label>
                <input type="color" [(ngModel)]="config.textColor" class="w-full h-10 rounded cursor-pointer">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Alineación</label>
              <div class="flex gap-2">
                <button type="button" (click)="config.align = 'left'"
                        [class.bg-indigo-100]="config.align === 'left'"
                        class="flex-1 px-4 py-2 text-sm border rounded-lg">Izquierda</button>
                <button type="button" (click)="config.align = 'center'"
                        [class.bg-indigo-100]="config.align === 'center'"
                        class="flex-1 px-4 py-2 text-sm border rounded-lg">Centro</button>
                <button type="button" (click)="config.align = 'right'"
                        [class.bg-indigo-100]="config.align === 'right'"
                        class="flex-1 px-4 py-2 text-sm border rounded-lg">Derecha</button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Padding</label>
              <input type="text" [(ngModel)]="config.padding"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                     placeholder="30px">
            </div>
          </div>
          
          <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button type="button" (click)="onCancel()"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="button" (click)="onInsert()"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Aplicar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class FooterConfigDialogComponent {
  @Input() isVisible = signal(false);
  @Output() onConfirm = new EventEmitter<FooterDialogConfig>();
  @Output() onCancelClick = new EventEmitter<void>();
  
  config: FooterDialogConfig = {
    companyName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    showUnsubscribe: true,
    backgroundColor: '#f3f4f6',
    textColor: '#6b7280',
    align: 'center',
    padding: '30px'
  };
  
  show() {
    this.isVisible.set(true);
  }
  
  hide() {
    this.isVisible.set(false);
  }
  
  onInsert() {
    this.onConfirm.emit({ ...this.config });
    this.hide();
  }
  
  onCancel() {
    this.hide();
    this.onCancelClick.emit();
  }
}

/**
 * Diálogo de configuración de Columnas
 */
@Component({
  selector: 'app-columns-config-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isVisible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="onCancel()">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" (click)="$event.stopPropagation()">
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h3 class="text-lg font-semibold text-white">Configurar Columnas</h3>
            <p class="text-indigo-100 text-sm mt-1">Define el layout de dos columnas</p>
          </div>
          
          <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <!-- Columna 1 -->
            <div class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Columna 1 (Izquierda)</h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ancho</label>
                  <select [(ngModel)]="config.columns[0].width"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="50%">50%</option>
                    <option value="33%">33%</option>
                    <option value="25%">25%</option>
                    <option value="66%">66%</option>
                    <option value="75%">75%</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                  <textarea [(ngModel)]="config.columns[0].content" rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Contenido de la columna 1..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Columna 2 -->
            <div class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Columna 2 (Derecha)</h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ancho</label>
                  <select [(ngModel)]="config.columns[1].width"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="50%">50%</option>
                    <option value="33%">33%</option>
                    <option value="25%">25%</option>
                    <option value="66%">66%</option>
                    <option value="75%">75%</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                  <textarea [(ngModel)]="config.columns[1].content" rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Contenido de la columna 2..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Opciones globales -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Espacio entre columnas</label>
                <input type="text" [(ngModel)]="config.gap"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                       placeholder="20px">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Color de fondo</label>
                <input type="color" [(ngModel)]="config.backgroundColor" class="w-full h-10 rounded cursor-pointer">
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button type="button" (click)="onCancel()"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="button" (click)="onInsert()"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Aplicar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ColumnsConfigDialogComponent {
  @Input() isVisible = signal(false);
  @Output() onConfirm = new EventEmitter<ColumnsDialogConfig>();
  @Output() onCancelClick = new EventEmitter<void>();
  
  config: ColumnsDialogConfig = {
    columns: [
      { width: '50%', content: 'Contenido de la columna 1' },
      { width: '50%', content: 'Contenido de la columna 2' }
    ],
    gap: '20px',
    backgroundColor: 'transparent'
  };
  
  show() {
    this.config = {
      columns: [
        { width: '50%', content: 'Contenido de la columna 1' },
        { width: '50%', content: 'Contenido de la columna 2' }
      ],
      gap: '20px',
      backgroundColor: 'transparent'
    };
    this.isVisible.set(true);
  }
  
  hide() {
    this.isVisible.set(false);
  }
  
  onInsert() {
    this.onConfirm.emit({ ...this.config });
    this.hide();
  }
  
  onCancel() {
    this.hide();
    this.onCancelClick.emit();
  }
}
