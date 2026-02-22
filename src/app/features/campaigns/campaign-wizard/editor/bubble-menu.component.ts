import { Component, Input, Output, EventEmitter, signal, computed, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Editor } from '@tiptap/core';
import { PRESET_COLORS } from './email-block.model';

/**
 * Componente de menú flotante (Bubble Menu) para formato de texto
 * Aparece al seleccionar texto y permite aplicar negrita, cursiva, enlaces y colores
 */
@Component({
  selector: 'app-bubble-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isVisible()) {
      <div #menuRef
           class="bubble-menu fixed z-50 bg-gray-900 rounded-lg shadow-xl py-1 px-1 flex items-center gap-0.5"
           [style.top.px]="position().top"
           [style.left.px]="position().left">
        
        <!-- Negrita -->
        <button type="button"
                class="bubble-btn"
                [class.active]="isBold()"
                (click)="toggleBold()"
                title="Negrita (Ctrl+B)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
          </svg>
        </button>
        
        <!-- Cursiva -->
        <button type="button"
                class="bubble-btn"
                [class.active]="isItalic()"
                (click)="toggleItalic()"
                title="Cursiva (Ctrl+I)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4m-2 0v16m-4 0h8"></path>
          </svg>
        </button>
        
        <!-- Subrayado -->
        <button type="button"
                class="bubble-btn"
                [class.active]="isUnderline()"
                (click)="toggleUnderline()"
                title="Subrayado (Ctrl+U)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8v4a5 5 0 0010 0V8M5 20h14"></path>
          </svg>
        </button>
        
        <!-- Separador -->
        <div class="w-px h-5 bg-gray-600 mx-1"></div>
        
        <!-- Color de texto -->
        <div class="relative">
          <button type="button"
                  class="bubble-btn"
                  (click)="showColorPicker.set(!showColorPicker())"
                  title="Color de texto">
            <div class="w-4 h-4 rounded border border-white border-opacity-50"
                 [style.background-color]="currentColor()"></div>
          </button>
          
          @if (showColorPicker()) {
            <div class="color-picker absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl p-2 z-50">
              <div class="grid grid-cols-6 gap-1">
                @for (color of textColors; track color) {
                  <button type="button"
                          class="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                          [style.background-color]="color"
                          [class.ring-2]="currentColor() === color"
                          [class.ring-indigo-500]="currentColor() === color"
                          (click)="setTextColor(color)">
                  </button>
                }
              </div>
            </div>
          }
        </div>
        
        <!-- Separador -->
        <div class="w-px h-5 bg-gray-600 mx-1"></div>
        
        <!-- Enlace -->
        <button type="button"
                class="bubble-btn"
                [class.active]="hasLink()"
                (click)="toggleLink()"
                title="Enlace">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
        </button>
        
        <!-- Input de enlace (visible cuando se está editando) -->
        @if (showLinkInput()) {
          <div class="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl p-2 z-50 w-64">
            <input type="url"
                   [value]="linkUrl()"
                   (input)="linkUrl.set($any($event.target).value)"
                   (keydown.enter)="setLink()"
                   (keydown.escape)="cancelLink()"
                   class="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   placeholder="https://...">
            <div class="flex gap-1 mt-2">
              <button type="button"
                      (click)="setLink()"
                      class="flex-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Aplicar
              </button>
              <button type="button"
                      (click)="cancelLink()"
                      class="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                Cancelar
              </button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .bubble-menu {
      animation: fadeIn 0.15s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .bubble-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      color: #d1d5db;
      transition: all 0.15s;
    }
    
    .bubble-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .bubble-btn.active {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .color-picker {
      animation: fadeIn 0.1s ease-out;
    }
  `]
})
export class BubbleMenuComponent implements OnInit, OnDestroy {
  @Input() editor!: Editor;
  @Output() onClose = new EventEmitter<void>();
  
  @ViewChild('menuRef') menuRef!: ElementRef;
  
  isVisible = signal(false);
  position = signal({ top: 0, left: 0 });
  showColorPicker = signal(false);
  showLinkInput = signal(false);
  linkUrl = signal('');
  
  textColors = PRESET_COLORS.text;
  
  private clickHandler?: (event: MouseEvent) => void;
  
  isBold = computed(() => this.editor?.isActive('bold') ?? false);
  isItalic = computed(() => this.editor?.isActive('italic') ?? false);
  isUnderline = computed(() => this.editor?.isActive('underline') ?? false);
  hasLink = computed(() => this.editor?.isActive('link') ?? false);
  
  currentColor = computed(() => {
    if (!this.editor) return '#000000';
    const attrs = this.editor.getAttributes('textStyle') as Record<string, any>;
    return attrs['color'] || '#000000';
  });
  
  ngOnInit() {
    // Cerrar al hacer clic fuera
    this.clickHandler = (event: MouseEvent) => {
      if (this.isVisible() && this.menuRef?.nativeElement) {
        if (!this.menuRef.nativeElement.contains(event.target)) {
          this.hide();
        }
      }
    };
    
    document.addEventListener('click', this.clickHandler);
  }
  
  ngOnDestroy() {
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler);
    }
  }
  
  /**
   * Muestra el menú en la posición especificada
   */
  show(top: number, left: number) {
    // Calcular posición centrada sobre la selección
    const menuWidth = 280;
    const menuHeight = 40;
    
    let adjustedTop = top - menuHeight - 8;
    let adjustedLeft = left - menuWidth / 2;
    
    // Ajustar para que no se salga de la pantalla
    const viewportWidth = window.innerWidth;
    
    if (adjustedLeft < 10) {
      adjustedLeft = 10;
    } else if (adjustedLeft + menuWidth > viewportWidth - 10) {
      adjustedLeft = viewportWidth - menuWidth - 10;
    }
    
    if (adjustedTop < 10) {
      adjustedTop = top + 24; // Mostrar debajo de la selección
    }
    
    this.position.set({ top: adjustedTop, left: adjustedLeft });
    this.isVisible.set(true);
    this.showColorPicker.set(false);
    this.showLinkInput.set(false);
  }
  
  /**
   * Oculta el menú
   */
  hide() {
    this.isVisible.set(false);
    this.showColorPicker.set(false);
    this.showLinkInput.set(false);
    this.onClose.emit();
  }
  
  /**
   * Toggle negrita
   */
  toggleBold() {
    if (!this.editor) return;
    this.editor.chain().focus().run();
    // Usar comando nativo del editor
    const command = this.editor.commands as any;
    if (command.toggleBold) {
      command.toggleBold();
    }
  }
  
  /**
   * Toggle cursiva
   */
  toggleItalic() {
    if (!this.editor) return;
    this.editor.chain().focus().run();
    const command = this.editor.commands as any;
    if (command.toggleItalic) {
      command.toggleItalic();
    }
  }
  
  /**
   * Toggle subrayado
   */
  toggleUnderline() {
    if (!this.editor) return;
    this.editor.chain().focus().run();
    const command = this.editor.commands as any;
    if (command.toggleUnderline) {
      command.toggleUnderline();
    }
  }
  
  /**
   * Establece el color del texto
   */
  setTextColor(color: string) {
    if (!this.editor) return;
    const command = this.editor.commands as any;
    if (command.setColor) {
      command.setColor(color);
    }
    this.showColorPicker.set(false);
  }
  
  /**
   * Toggle enlace - muestra el input
   */
  toggleLink() {
    if (!this.editor) return;
    
    if (this.hasLink()) {
      // Si ya tiene enlace, lo elimina
      const command = this.editor.commands as any;
      if (command.unsetLink) {
        command.unsetLink();
      }
    } else {
      // Muestra el input para ingresar la URL
      this.showLinkInput.set(true);
      this.linkUrl.set('');
    }
  }
  
  /**
   * Establece el enlace
   */
  setLink() {
    if (!this.editor) return;
    
    const url = this.linkUrl().trim();
    if (url) {
      const command = this.editor.commands as any;
      if (command.setLink) {
        command.setLink({ href: url });
      }
    }
    
    this.showLinkInput.set(false);
    this.linkUrl.set('');
  }
  
  /**
   * Cancela la edición del enlace
   */
  cancelLink() {
    this.showLinkInput.set(false);
    this.linkUrl.set('');
  }
}
