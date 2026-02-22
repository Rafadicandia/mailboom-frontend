import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Editor } from '@tiptap/core';
import { SLASH_COMMAND_OPTIONS, SlashCommandOption } from './email-block.model';

/**
 * Componente de menú Slash Command estilo Notion
 * Aparece al presionar "/" en una línea vacía y permite seleccionar
 * el tipo de bloque a insertar
 */
@Component({
  selector: 'app-slash-command',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isVisible()) {
      <div #menuRef 
           class="slash-command-menu fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-72 max-h-80 overflow-y-auto"
           [style.top.px]="position().top"
           [style.left.px]="position().left">
        
        <!-- Buscador -->
        <div class="px-3 pb-2 border-b border-gray-100">
          <input type="text" 
                 [(ngModel)]="searchQuery"
                 (keydown)="onKeyDown($event)"
                 class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                 placeholder="Buscar bloques..."
                 #searchInput>
        </div>
        
        <!-- Categorías -->
        @for (category of categories; track category) {
          @if (getFilteredOptionsByCategory(category).length > 0) {
            <div class="py-1">
              <div class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {{ getCategoryLabel(category) }}
              </div>
              
              @for (option of getFilteredOptionsByCategory(category); track option.id) {
                <button type="button"
                        class="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                        [class.bg-indigo-50]="selectedIndex() === getOptionIndex(option)"
                        [class.text-indigo-700]="selectedIndex() === getOptionIndex(option)"
                        (click)="selectOption(option)"
                        (mouseenter)="selectedIndex.set(getOptionIndex(option))">
                  
                  <!-- Icono -->
                  <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"
                       [class.bg-indigo-100]="selectedIndex() === getOptionIndex(option)">
                    <span class="text-lg">{{ getOptionIcon(option.icon) }}</span>
                  </div>
                  
                  <!-- Texto -->
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900">{{ option.label }}</div>
                    <div class="text-xs text-gray-500 truncate">{{ option.description }}</div>
                  </div>
                </button>
              }
            </div>
          }
        }
        
        <!-- Sin resultados -->
        @if (filteredOptions().length === 0) {
          <div class="px-3 py-4 text-center text-sm text-gray-500">
            No se encontraron bloques
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .slash-command-menu {
      animation: slideIn 0.15s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class SlashCommandComponent implements OnInit, OnDestroy {
  @Input() editor!: Editor;
  @Output() onSelect = new EventEmitter<SlashCommandOption>();
  @Output() onClose = new EventEmitter<void>();
  
  @ViewChild('menuRef') menuRef!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  isVisible = signal(false);
  position = signal({ top: 0, left: 0 });
  searchQuery = '';
  selectedIndex = signal(0);
  
  categories = ['text', 'media', 'interactive', 'layout'] as const;
  
  private keydownHandler?: (event: KeyboardEvent) => void;
  private clickHandler?: (event: MouseEvent) => void;
  
  filteredOptions = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return SLASH_COMMAND_OPTIONS;
    
    return SLASH_COMMAND_OPTIONS.filter(option => 
      option.label.toLowerCase().includes(query) ||
      option.description.toLowerCase().includes(query) ||
      option.keywords?.some(kw => kw.toLowerCase().includes(query))
    );
  });
  
  ngOnInit() {
    // Manejador de teclado global
    this.keydownHandler = (event: KeyboardEvent) => {
      if (!this.isVisible()) return;
      
      if (event.key === 'Escape') {
        this.hide();
        event.preventDefault();
      }
    };
    
    // Cerrar al hacer clic fuera
    this.clickHandler = (event: MouseEvent) => {
      if (this.isVisible() && this.menuRef?.nativeElement) {
        if (!this.menuRef.nativeElement.contains(event.target)) {
          this.hide();
        }
      }
    };
    
    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('click', this.clickHandler);
  }
  
  ngOnDestroy() {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler);
    }
  }
  
  /**
   * Muestra el menú en la posición especificada
   */
  show(top: number, left: number) {
    // Ajustar posición para que no se salga de la pantalla
    const menuHeight = 320;
    const menuWidth = 288;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    let adjustedTop = top;
    let adjustedLeft = left;
    
    if (top + menuHeight > viewportHeight) {
      adjustedTop = viewportHeight - menuHeight - 20;
    }
    
    if (left + menuWidth > viewportWidth) {
      adjustedLeft = viewportWidth - menuWidth - 20;
    }
    
    this.position.set({ top: adjustedTop, left: adjustedLeft });
    this.isVisible.set(true);
    this.searchQuery = '';
    this.selectedIndex.set(0);
    
    // Focus en el input después de que se renderice
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 0);
  }
  
  /**
   * Oculta el menú
   */
  hide() {
    this.isVisible.set(false);
    this.searchQuery = '';
    this.selectedIndex.set(0);
    this.onClose.emit();
  }
  
  /**
   * Maneja eventos de teclado
   */
  onKeyDown(event: KeyboardEvent) {
    const options = this.filteredOptions();
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.set((this.selectedIndex() + 1) % options.length);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.set(this.selectedIndex() === 0 ? options.length - 1 : this.selectedIndex() - 1);
        break;
        
      case 'Enter':
        event.preventDefault();
        if (options[this.selectedIndex()]) {
          this.selectOption(options[this.selectedIndex()]);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.hide();
        break;
    }
  }
  
  /**
   * Selecciona una opción y emite el evento
   */
  selectOption(option: SlashCommandOption) {
    this.onSelect.emit(option);
    this.hide();
  }
  
  /**
   * Obtiene las opciones filtradas por categoría
   */
  getFilteredOptionsByCategory(category: typeof this.categories[number]): SlashCommandOption[] {
    return this.filteredOptions().filter(opt => opt.category === category);
  }
  
  /**
   * Obtiene el índice global de una opción
   */
  getOptionIndex(option: SlashCommandOption): number {
    return this.filteredOptions().findIndex(opt => opt.id === option.id);
  }
  
  /**
   * Obtiene el label de una categoría
   */
  getCategoryLabel(category: typeof this.categories[number]): string {
    const labels: Record<string, string> = {
      text: 'Texto',
      media: 'Media',
      interactive: 'Interactivo',
      layout: 'Estructura'
    };
    return labels[category] || category;
  }
  
  /**
   * Obtiene el emoji/icono para una opción
   */
  getOptionIcon(iconName: string): string {
    const icons: Record<string, string> = {
      'type': '📝',
      'heading-1': 'H1',
      'heading-2': 'H2',
      'heading-3': 'H3',
      'quote': '💬',
      'list': '•',
      'list-ordered': '1.',
      'image': '🖼️',
      'minus': '—',
      'space': '↕',
      'mouse-pointer-click': '👆',
      'share-2': '🔗',
      'columns': '⬜',
      'layout-template': '📄'
    };
    return icons[iconName] || '📄';
  }
}
