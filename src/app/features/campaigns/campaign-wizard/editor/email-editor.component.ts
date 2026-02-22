import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ViewChild, 
  signal, 
  computed,
  AfterViewInit,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Editor, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';

import { SlashCommandComponent } from './slash-command.component';
import { BubbleMenuComponent } from './bubble-menu.component';
import { ImageConfigDialogComponent, ImageDialogConfig } from './image-config-dialog.component';
import { 
  HeaderConfigDialogComponent, 
  FooterConfigDialogComponent, 
  ColumnsConfigDialogComponent,
  HeaderDialogConfig,
  FooterDialogConfig,
  ColumnsDialogConfig
} from './block-config-dialogs.component';
import { emailExtensions } from './tiptap-extensions';
import { MjmlConverterService } from './mjml-converter.service';
import { 
  SlashCommandOption, 
  EmailDocument, 
  PRESET_COLORS, 
  EMAIL_FONTS, 
  FONT_SIZES 
} from './email-block.model';

// Extensión personalizada para FontSize
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize?.replace(/['"]+/g, ''),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes['fontSize']) {
            return {};
          }
          return {
            style: `font-size: ${attributes['fontSize']}`,
          };
        },
      },
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize: (fontSize: string) => ({ chain }: { chain: () => any }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }: { chain: () => any }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

/**
 * Editor de bloques estilo Notion para diseñar campañas de mailing
 * Utiliza TipTap como motor de edición con nodos personalizados
 */
@Component({
  selector: 'app-email-editor',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    SlashCommandComponent, 
    BubbleMenuComponent,
    ImageConfigDialogComponent,
    HeaderConfigDialogComponent,
    FooterConfigDialogComponent,
    ColumnsConfigDialogComponent
  ],
  providers: [MjmlConverterService],
  template: `
    <div class="email-editor-container flex flex-col h-full">
      
      <!-- Toolbar superior -->
      <div class="editor-toolbar bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-wrap">
        
        <!-- Deshacer/Rehacer -->
        <div class="flex items-center gap-1">
          <button type="button"
                  (click)="undo()"
                  [disabled]="!canUndo()"
                  class="toolbar-btn"
                  title="Deshacer (Ctrl+Z)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
            </svg>
          </button>
          <button type="button"
                  (click)="redo()"
                  [disabled]="!canRedo()"
                  class="toolbar-btn"
                  title="Rehacer (Ctrl+Y)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"/>
            </svg>
          </button>
        </div>
        
        <div class="w-px h-6 bg-gray-200"></div>
        
        <!-- Selector de fuente -->
        <select [ngModel]="currentFont()"
                (ngModelChange)="setFontFamily($event)"
                class="toolbar-select">
          @for (font of fonts; track font.value) {
            <option [value]="font.value">{{ font.label }}</option>
          }
        </select>
        
        <!-- Selector de tamaño -->
        <select [ngModel]="currentFontSize()"
                (ngModelChange)="setFontSize($event)"
                class="toolbar-select w-32">
          @for (size of fontSizes; track size.value) {
            <option [value]="size.value">{{ size.label }}</option>
          }
        </select>
        
        <div class="w-px h-6 bg-gray-200"></div>
        
        <!-- Formato -->
        <button type="button"
                (click)="toggleBold()"
                [class.active]="isBold()"
                class="toolbar-btn"
                title="Negrita (Ctrl+B)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
          </svg>
        </button>
        
        <button type="button"
                (click)="toggleItalic()"
                [class.active]="isItalic()"
                class="toolbar-btn"
                title="Cursiva (Ctrl+I)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4m-2 0v16m-4 0h8"></path>
          </svg>
        </button>
        
        <button type="button"
                (click)="toggleUnderline()"
                [class.active]="isUnderline()"
                class="toolbar-btn"
                title="Subrayado (Ctrl+U)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8v4a5 5 0 0010 0V8M5 20h14"></path>
          </svg>
        </button>
        
        <div class="w-px h-6 bg-gray-200"></div>
        
        <!-- Color de texto -->
        <div class="relative">
          <button type="button"
                  (click)="showTextColorPicker.set(!showTextColorPicker())"
                  class="toolbar-btn flex items-center gap-1"
                  title="Color de texto">
            <div class="w-4 h-4 rounded border border-gray-300"
                 [style.background-color]="currentTextColor()"></div>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          
          @if (showTextColorPicker()) {
            <div class="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl p-2 z-50 border border-gray-200">
              <div class="grid grid-cols-6 gap-1">
                @for (color of textColors; track color) {
                  <button type="button"
                          class="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                          [style.background-color]="color"
                          (click)="setTextColor(color)">
                  </button>
                }
              </div>
            </div>
          }
        </div>
        
        <!-- Color de fondo -->
        <div class="relative">
          <button type="button"
                  (click)="showBgColorPicker.set(!showBgColorPicker())"
                  class="toolbar-btn flex items-center gap-1"
                  title="Color de fondo">
            <div class="w-4 h-4 rounded border border-gray-300"
                 [style.background-color]="currentBgColor()"></div>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          
          @if (showBgColorPicker()) {
            <div class="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl p-2 z-50 border border-gray-200">
              <div class="grid grid-cols-6 gap-1">
                @for (color of bgColors; track color) {
                  <button type="button"
                          class="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                          [style.background-color]="color"
                          (click)="setHighlightColor(color)">
                  </button>
                }
              </div>
            </div>
          }
        </div>
        
        <div class="w-px h-6 bg-gray-200"></div>
        
        <!-- Alineación -->
        <button type="button"
                (click)="setTextAlign('left')"
                [class.active]="isAlignLeft()"
                class="toolbar-btn"
                title="Alinear izquierda">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h14"/>
          </svg>
        </button>
        
        <button type="button"
                (click)="setTextAlign('center')"
                [class.active]="isAlignCenter()"
                class="toolbar-btn"
                title="Centrar">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M5 18h14"/>
          </svg>
        </button>
        
        <button type="button"
                (click)="setTextAlign('right')"
                [class.active]="isAlignRight()"
                class="toolbar-btn"
                title="Alinear derecha">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 12h10M6 18h14"/>
          </svg>
        </button>
        
        <div class="w-px h-6 bg-gray-200"></div>
        
        <!-- Listas -->
        <button type="button"
                (click)="toggleBulletList()"
                [class.active]="isBulletList()"
                class="toolbar-btn"
                title="Lista con viñetas">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            <circle cx="2" cy="6" r="1" fill="currentColor"/>
            <circle cx="2" cy="12" r="1" fill="currentColor"/>
            <circle cx="2" cy="18" r="1" fill="currentColor"/>
          </svg>
        </button>
        
        <button type="button"
                (click)="toggleOrderedList()"
                [class.active]="isOrderedList()"
                class="toolbar-btn"
                title="Lista numerada">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13"/>
            <text x="2" y="8" font-size="8" fill="currentColor">1</text>
            <text x="2" y="14" font-size="8" fill="currentColor">2</text>
            <text x="2" y="20" font-size="8" fill="currentColor">3</text>
          </svg>
        </button>
        
        <div class="flex-1"></div>
        
        <!-- Botón de ayuda -->
        <button type="button"
                class="toolbar-btn text-gray-500"
                title="Escribe '/' para ver los bloques disponibles">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
      </div>
      
      <!-- Área del editor -->
      <div class="editor-content flex-1 overflow-y-auto bg-gray-50 p-8">
        <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-full">
          <div #editorRef 
               class="tiptap-editor prose prose-sm max-w-none p-8 min-h-[600px] focus:outline-none">
          </div>
        </div>
      </div>
      
      <!-- Slash Command Menu -->
      <app-slash-command
        [editor]="editor()!"
        (onSelect)="insertBlock($event)"
        (onClose)="onSlashCommandClose()">
      </app-slash-command>
      
      <!-- Bubble Menu -->
      <app-bubble-menu
        [editor]="editor()!"
        (onClose)="onBubbleMenuClose()">
      </app-bubble-menu>
      
      <!-- Image Config Dialog -->
      <app-image-config-dialog
        #imageConfigDialog
        (onConfirm)="onImageConfigConfirm($event)">
      </app-image-config-dialog>
      
      <!-- Header Config Dialog -->
      <app-header-config-dialog
        #headerConfigDialog
        (onConfirm)="onHeaderConfigConfirm($event)">
      </app-header-config-dialog>
      
      <!-- Footer Config Dialog -->
      <app-footer-config-dialog
        #footerConfigDialog
        (onConfirm)="onFooterConfigConfirm($event)">
      </app-footer-config-dialog>
      
      <!-- Columns Config Dialog -->
      <app-columns-config-dialog
        #columnsConfigDialog
        (onConfirm)="onColumnsConfigConfirm($event)">
      </app-columns-config-dialog>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    
    .toolbar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      color: #374151;
      transition: all 0.15s;
    }
    
    .toolbar-btn:hover:not(:disabled) {
      background-color: #f3f4f6;
    }
    
    .toolbar-btn.active {
      background-color: #e0e7ff;
      color: #4f46e5;
    }
    
    .toolbar-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .toolbar-select {
      padding: 6px 8px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 13px;
      color: #374151;
      background: white;
      cursor: pointer;
    }
    
    .toolbar-select:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
    }
    
    /* Estilos del editor TipTap estilo Notion */
    :host ::ng-deep .tiptap-editor {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }
    
    :host ::ng-deep .tiptap-editor p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: #9ca3af;
      pointer-events: none;
      height: 0;
    }
    
    :host ::ng-deep .tiptap-editor p {
      margin: 0.5em 0;
      line-height: 1.6;
    }
    
    :host ::ng-deep .tiptap-editor h1 {
      font-size: 2em;
      font-weight: 700;
      margin: 1em 0 0.5em;
      line-height: 1.2;
    }
    
    :host ::ng-deep .tiptap-editor h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 1em 0 0.5em;
      line-height: 1.3;
    }
    
    :host ::ng-deep .tiptap-editor h3 {
      font-size: 1.25em;
      font-weight: 600;
      margin: 1em 0 0.5em;
      line-height: 1.4;
    }
    
    :host ::ng-deep .tiptap-editor ul,
    :host ::ng-deep .tiptap-editor ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
      list-style-position: outside;
    }
    
    :host ::ng-deep .tiptap-editor ul {
      list-style-type: disc;
    }
    
    :host ::ng-deep .tiptap-editor ol {
      list-style-type: decimal;
    }
    
    :host ::ng-deep .tiptap-editor li {
      margin: 0.25em 0;
      display: list-item;
    }
    
    :host ::ng-deep .tiptap-editor li p {
      margin: 0;
    }
    
    :host ::ng-deep .tiptap-editor blockquote {
      border-left: 3px solid #e5e7eb;
      padding-left: 1em;
      margin: 1em 0;
      color: #6b7280;
      font-style: italic;
    }
    
    :host ::ng-deep .tiptap-editor a {
      color: #4f46e5;
      text-decoration: underline;
    }
    
    :host ::ng-deep .tiptap-editor a:hover {
      color: #4338ca;
    }
    
    :host ::ng-deep .tiptap-editor hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 2em 0;
    }
    
    :host ::ng-deep .tiptap-editor [data-type="button-node"] {
      margin: 1em 0;
    }
    
    :host ::ng-deep .tiptap-editor [data-type="image-node"] img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    
    :host ::ng-deep .tiptap-editor [data-type="social-node"] {
      margin: 1em 0;
    }
    
    :host ::ng-deep .tiptap-editor [data-type="spacer-node"] {
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 5px,
        #f3f4f6 5px,
        #f3f4f6 10px
      );
    }
    
    :host ::ng-deep .tiptap-editor .ProseMirror-selectednode {
      outline: 2px solid #4f46e5;
      outline-offset: 2px;
    }
  `]
})
export class EmailEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() initialContent: any = null;
  @Input() globalStyles = {
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
    maxWidth: 600
  };
  
  @Output() contentChange = new EventEmitter<any>();
  @Output() mjmlChange = new EventEmitter<string>();
  @Output() htmlChange = new EventEmitter<string>();
  
  @ViewChild('editorRef') editorRef!: ElementRef;
  @ViewChild(SlashCommandComponent) slashCommandMenu!: SlashCommandComponent;
  @ViewChild(BubbleMenuComponent) bubbleMenu!: BubbleMenuComponent;
  @ViewChild(ImageConfigDialogComponent) imageConfigDialog!: ImageConfigDialogComponent;
  @ViewChild(HeaderConfigDialogComponent) headerConfigDialog!: HeaderConfigDialogComponent;
  @ViewChild(FooterConfigDialogComponent) footerConfigDialog!: FooterConfigDialogComponent;
  @ViewChild(ColumnsConfigDialogComponent) columnsConfigDialog!: ColumnsConfigDialogComponent;
  
  editor = signal<Editor | null>(null);
  
  showTextColorPicker = signal(false);
  showBgColorPicker = signal(false);
  
  textColors = PRESET_COLORS.text;
  bgColors = PRESET_COLORS.background;
  fonts = EMAIL_FONTS;
  fontSizes = FONT_SIZES;
  
  private slashCommandComponent?: SlashCommandComponent;
  private bubbleMenuComponent?: BubbleMenuComponent;
  
  // Computed properties para el estado del editor
  canUndo = computed(() => this.editor()?.can().undo() ?? false);
  canRedo = computed(() => this.editor()?.can().redo() ?? false);
  
  isBold = computed(() => this.editor()?.isActive('bold') ?? false);
  isItalic = computed(() => this.editor()?.isActive('italic') ?? false);
  isUnderline = computed(() => this.editor()?.isActive('underline') ?? false);
  
  isBulletList = computed(() => this.editor()?.isActive('bulletList') ?? false);
  isOrderedList = computed(() => this.editor()?.isActive('orderedList') ?? false);
  
  isAlignLeft = computed(() => this.editor()?.isActive({ textAlign: 'left' }) ?? false);
  isAlignCenter = computed(() => this.editor()?.isActive({ textAlign: 'center' }) ?? false);
  isAlignRight = computed(() => this.editor()?.isActive({ textAlign: 'right' }) ?? false);
  
  currentFont = computed(() => {
    const editor = this.editor();
    if (!editor) return 'Arial, sans-serif';
    const attrs = editor.getAttributes('textStyle') as Record<string, any>;
    return attrs['fontFamily'] || 'Arial, sans-serif';
  });
  
  currentFontSize = computed(() => {
    const editor = this.editor();
    if (!editor) return '16px';
    const attrs = editor.getAttributes('textStyle') as Record<string, any>;
    return attrs['fontSize'] || '16px';
  });
  
  currentTextColor = computed(() => {
    const editor = this.editor();
    if (!editor) return '#000000';
    const attrs = editor.getAttributes('textStyle') as Record<string, any>;
    return attrs['color'] || '#000000';
  });
  
  currentBgColor = computed(() => {
    const editor = this.editor();
    if (!editor) return 'transparent';
    const attrs = editor.getAttributes('highlight') as Record<string, any>;
    return attrs['color'] || 'transparent';
  });
  
  constructor(private mjmlConverter: MjmlConverterService) {}
  
  ngOnInit() {}
  
  ngAfterViewInit() {
    this.initEditor();
  }
  
  ngOnDestroy() {
    this.editor()?.destroy();
  }
  
  /**
   * Inicializa el editor TipTap
   */
  private initEditor() {
    const editorElement = this.editorRef.nativeElement;
    const self = this;
    
    const editor = new Editor({
      element: editorElement,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3]
          }
        }),
        Placeholder.configure({
          placeholder: "Escribe '/' para insertar un bloque..."
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph']
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'email-link'
          }
        }),
        Highlight.configure({
          multicolor: true
        }),
        Color,
        TextStyle, // Necesario para FontFamily y FontSize
        FontSize,
        FontFamily.configure({
          types: ['textStyle'],
        }),
        ...emailExtensions
      ],
      content: this.initialContent || '<p></p>',
      editorProps: {
        attributes: {
          class: 'focus:outline-none'
        },
        handleKeyDown: (view, event) => {
          // Detectar "/" en línea vacía para mostrar slash command
          if (event.key === '/') {
            const { empty, $from } = view.state.selection;
            const isEmptyTextBlock = empty && 
              $from.parent.isTextblock && 
              $from.parent.content.size === 0;
            
            if (isEmptyTextBlock) {
              // Mostrar el menú slash command después de que se escriba el "/"
              const { from } = view.state.selection;
              const coords = view.coordsAtPos(from);
              
              // Usar setTimeout para asegurar que el ViewChild esté disponible
              setTimeout(() => {
                if (self.slashCommandMenu) {
                  self.slashCommandMenu.show(coords.top + 20, coords.left);
                }
              }, 10);
              // No prevenir que se escriba el "/" - dejamos que se escriba normalmente
            }
          }
          return false;
        }
      },
      onUpdate: ({ editor }) => {
        this.onContentUpdate(editor);
      }
    });
    
    this.editor.set(editor);
  }
  
  /**
   * Maneja actualizaciones del contenido
   */
  private onContentUpdate(editor: Editor) {
    const json = editor.getJSON();
    const html = editor.getHTML();
    
    this.contentChange.emit(json);
    this.htmlChange.emit(html);
    
    // Generar MJML
    const document = this.mjmlConverter.convertTipTapJsonToEmailDocument(json, this.globalStyles);
    const mjml = this.mjmlConverter.convertToMjml(document);
    this.mjmlChange.emit(mjml);
  }
  
  /**
   * Inserta un bloque basado en la selección del slash command
   */
  insertBlock(option: SlashCommandOption) {
    const editor = this.editor();
    if (!editor) return;
    
    // Primero, eliminar el "/" que se escribió
    const { from, to } = editor.state.selection;
    if (from === to && from > 0) {
      const textBefore = editor.state.doc.textBetween(from - 1, from);
      if (textBefore === '/') {
        editor.chain()
          .focus()
          .deleteRange({ from: from - 1, to: from })
          .run();
      }
    }
    
    const chain = editor.chain().focus();
    
    switch (option.blockType) {
      case 'paragraph':
        chain.setParagraph().run();
        break;
      case 'heading1':
        chain.toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        chain.toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        chain.toggleHeading({ level: 3 }).run();
        break;
      case 'bulletList':
        chain.toggleBulletList().run();
        break;
      case 'orderedList':
        chain.toggleOrderedList().run();
        break;
      case 'quote':
        chain.toggleBlockquote().run();
        break;
      case 'button':
        this.insertButtonBlock();
        break;
      case 'image':
        this.insertImageBlock();
        break;
      case 'divider':
        this.insertDividerBlock();
        break;
      case 'social':
        this.insertSocialBlock();
        break;
      case 'columns':
        this.insertColumnsBlock();
        break;
      case 'header':
        this.insertHeaderBlock();
        break;
      case 'footer':
        this.insertFooterBlock();
        break;
      case 'spacer':
        this.insertSpacerBlock();
        break;
    }
    
    editor.commands.focus();
  }
  
  /**
   * Inserta un bloque de botón
   */
  private insertButtonBlock() {
    const editor = this.editor();
    if (!editor) return;
    
    editor.chain()
      .focus()
      .insertContent({
        type: 'buttonNode',
        attrs: {
          text: 'Click aquí',
          url: '#',
          backgroundColor: '#4F46E5',
          textColor: '#ffffff',
          borderRadius: 8,
          width: 'auto',
          align: 'center'
        }
      })
      .run();
  }
  
  /**
   * Inserta un bloque de imagen
   */
  private insertImageBlock() {
    const editor = this.editor();
    if (!editor) return;
    
    // Mostrar el diálogo de configuración de imagen
    this.imageConfigDialog?.show('');
  }
  
  /**
   * Callback cuando se confirma la configuración de imagen
   */
  onImageConfigConfirm(config: ImageDialogConfig) {
    const editor = this.editor();
    if (!editor || !config.src) return;
    
    editor.chain()
      .focus()
      .insertContent({
        type: 'imageNode',
        attrs: {
          src: config.src,
          alt: config.alt || '',
          link: config.link || '',
          width: config.width || '100%',
          height: config.height || 'auto',
          align: config.align || 'center'
        }
      })
      .run();
  }
  
  /**
   * Inserta un bloque divisor
   */
  private insertDividerBlock() {
    const editor = this.editor();
    if (!editor) return;
    
    editor.chain()
      .focus()
      .insertContent({
        type: 'dividerNode',
        attrs: {
          color: '#e5e7eb',
          width: '100%',
          style: 'solid',
          padding: '20px 0'
        }
      })
      .run();
  }
  
  /**
   * Inserta un bloque de redes sociales
   */
  private insertSocialBlock() {
    const editor = this.editor();
    if (!editor) return;
    
    editor.chain()
      .focus()
      .insertContent({
        type: 'socialNode',
        attrs: {
          icons: JSON.stringify([
            { network: 'facebook', url: 'https://facebook.com' },
            { network: 'twitter', url: 'https://twitter.com' },
            { network: 'instagram', url: 'https://instagram.com' }
          ]),
          align: 'center',
          iconSize: 32,
          iconSpacing: '16px'
        }
      })
      .run();
  }
  
  /**
   * Inserta un bloque de columnas
   */
  private insertColumnsBlock() {
    this.columnsConfigDialog?.show();
  }
  
  /**
   * Callback cuando se confirma la configuración de columnas
   */
  onColumnsConfigConfirm(config: ColumnsDialogConfig) {
    const editor = this.editor();
    if (!editor) return;
    
    editor.chain()
      .focus()
      .insertContent({
        type: 'columnsNode',
        attrs: {
          columns: JSON.stringify(config.columns),
          gap: config.gap,
          backgroundColor: config.backgroundColor
        }
      })
      .run();
  }
  
  /**
   * Inserta un bloque de header
   */
  private insertHeaderBlock() {
    this.headerConfigDialog?.show();
  }
  
  /**
   * Callback cuando se confirma la configuración de header
   */
  onHeaderConfigConfirm(config: HeaderDialogConfig) {
    const editor = this.editor();
    if (!editor) return;
    
    editor.chain()
      .focus()
      .insertContent({
        type: 'headerNode',
        attrs: {
          useImage: config.useImage,
          logoUrl: config.logoUrl,
          logoWidth: config.logoWidth,
          text: config.text,
          backgroundColor: config.backgroundColor,
          textColor: config.textColor,
          align: config.align,
          padding: config.padding
        }
      })
      .run();
  }
  
  /**
   * Inserta un bloque de footer
   */
  private insertFooterBlock() {
    this.footerConfigDialog?.show();
  }
  
  /**
   * Callback cuando se confirma la configuración de footer
   */
  onFooterConfigConfirm(config: FooterDialogConfig) {
    const editor = this.editor();
    if (!editor) return;
    
    editor.chain()
      .focus()
      .insertContent({
        type: 'footerNode',
        attrs: {
          companyName: config.companyName,
          address: config.address,
          phone: config.phone,
          email: config.email,
          website: config.website,
          showUnsubscribe: config.showUnsubscribe,
          backgroundColor: config.backgroundColor,
          textColor: config.textColor,
          align: config.align,
          padding: config.padding
        }
      })
      .run();
  }
  
  /**
   * Inserta un bloque de espaciador
   */
  private insertSpacerBlock() {
    const editor = this.editor();
    if (!editor) return;
    
    editor.chain()
      .focus()
      .insertContent({
        type: 'spacerNode',
        attrs: {
          height: '40px',
          backgroundColor: 'transparent'
        }
      })
      .run();
  }
  
  /**
   * Callback cuando se cierra el slash command
   */
  onSlashCommandClose() {
    // Limpiar el "/" que se escribió si el menú se cierra sin seleccionar
    const editor = this.editor();
    if (editor) {
      const { from, to, $from } = editor.state.selection;
      // Verificar si el carácter anterior es "/"
      if (from === to && from > 0) {
        const textBefore = editor.state.doc.textBetween(from - 1, from);
        if (textBefore === '/') {
          editor.chain()
            .focus()
            .deleteRange({ from: from - 1, to: from })
            .run();
        }
      }
    }
  }
  
  /**
   * Callback cuando se cierra el bubble menu
   */
  onBubbleMenuClose() {
    // No se requiere acción adicional
  }
  
  // Métodos de la toolbar
  
  undo() {
    this.editor()?.chain().focus().undo().run();
  }
  
  redo() {
    this.editor()?.chain().focus().redo().run();
  }
  
  toggleBold() {
    const editor = this.editor();
    if (!editor) return;
    const command = editor.commands as any;
    if (command.toggleBold) {
      command.toggleBold();
    }
  }
  
  toggleItalic() {
    const editor = this.editor();
    if (!editor) return;
    const command = editor.commands as any;
    if (command.toggleItalic) {
      command.toggleItalic();
    }
  }
  
  toggleUnderline() {
    const editor = this.editor();
    if (!editor) return;
    const command = editor.commands as any;
    if (command.toggleUnderline) {
      command.toggleUnderline();
    }
  }
  
  toggleBulletList() {
    const editor = this.editor();
    if (!editor) return;
    const command = editor.commands as any;
    if (command.toggleBulletList) {
      command.toggleBulletList();
    }
  }
  
  toggleOrderedList() {
    const editor = this.editor();
    if (!editor) return;
    const command = editor.commands as any;
    if (command.toggleOrderedList) {
      command.toggleOrderedList();
    }
  }
  
  setFontFamily(font: string) {
    const editor = this.editor();
    if (!editor) return;
    editor.chain().focus().setFontFamily(font).run();
  }
  
  setFontSize(size: string) {
    const editor = this.editor();
    if (!editor) return;
    editor.chain().focus().setFontSize(size).run();
  }
  
  setTextColor(color: string) {
    const editor = this.editor();
    if (!editor) return;
    const command = editor.commands as any;
    if (command.setColor) {
      command.setColor(color);
    }
    this.showTextColorPicker.set(false);
  }
  
  setHighlightColor(color: string) {
    const editor = this.editor();
    if (!editor) return;
    const command = editor.commands as any;
    if (command.toggleHighlight) {
      command.toggleHighlight({ color });
    }
    this.showBgColorPicker.set(false);
  }
  
  setTextAlign(align: 'left' | 'center' | 'right') {
    const editor = this.editor();
    if (!editor) return;
    const command = editor.commands as any;
    if (command.setTextAlign) {
      command.setTextAlign(align);
    }
  }
  
  /**
   * Obtiene el contenido actual del editor en formato JSON
   */
  getContent(): any {
    return this.editor()?.getJSON();
  }
  
  /**
   * Obtiene el contenido actual del editor en formato HTML
   */
  getHtml(): string {
    return this.editor()?.getHTML() || '';
  }
  
  /**
   * Obtiene el MJML generado
   */
  getMjml(): string {
    const json = this.getContent();
    if (!json) return '';
    
    const document = this.mjmlConverter.convertTipTapJsonToEmailDocument(json, this.globalStyles);
    return this.mjmlConverter.convertToMjml(document);
  }
  
  /**
   * Establece el contenido del editor
   */
  setContent(content: any) {
    this.editor()?.commands.setContent(content);
  }
}
