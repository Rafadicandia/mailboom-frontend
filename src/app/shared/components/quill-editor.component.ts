import { 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  OnDestroy,
  Input, 
  Output, 
  EventEmitter,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import Quill from 'quill';

export interface QuillConfig {
  modules: Record<string, unknown>;
  placeholder?: string;
  theme?: string;
}

@Component({
  selector: 'app-quill-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuillEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="quill-editor-wrapper">
      <!-- Toolbar personalizado opcional -->
      @if (showToolbar) {
        <div class="mb-2">
          <div #toolbarContainer class="quill-toolbar">
            <span class="ql-formats">
              <select class="ql-header">
                <option value="1">Título 1</option>
                <option value="2">Título 2</option>
                <option value="3">Título 3</option>
                <option selected>Normal</option>
              </select>
            </span>
            <span class="ql-formats">
              <button class="ql-bold"></button>
              <button class="ql-italic"></button>
              <button class="ql-underline"></button>
              <button class="ql-strike"></button>
            </span>
            <span class="ql-formats">
              <select class="ql-color"></select>
              <select class="ql-background"></select>
            </span>
            <span class="ql-formats">
              <button class="ql-list" value="ordered"></button>
              <button class="ql-list" value="bullet"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-blockquote"></button>
              <button class="ql-code-block"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-link"></button>
              <button class="ql-image"></button>
              <button class="ql-video"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-clean"></button>
            </span>
          </div>
        </div>
      }
      
      <!-- Editor Quill -->
      <div 
        #editorContainer
        class="quill-editor-container"
        [class.readonly]="readOnly"
      ></div>
      
      <!-- Contador de caracteres -->
      @if (showCharCount) {
        <div class="char-count mt-1 text-xs text-gray-500">
          {{ characterCount }} caracteres
        </div>
      }
      
      <!-- Plantillas rápidas -->
      @if (showTemplates) {
        <div class="quick-templates mt-2">
          <span class="text-xs text-gray-500 mr-2">Insertar:</span>
          @for (template of quickTemplates; track template.name) {
            <button 
              (click)="insertTemplate(template.html)"
              class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded mr-1 mb-1"
            >
              {{ template.name }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .quill-editor-wrapper {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      overflow: hidden;
      background: white;
    }
    
    .quill-editor-container {
      min-height: 200px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .quill-editor-container.readonly {
      background-color: #f9fafb;
    }
    
    .quill-toolbar {
      background: #f9fafb;
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .ql-toolbar.ql-snow {
      border: none;
      background: transparent;
    }
    
    .ql-container.ql-snow {
      border: none;
      font-family: inherit;
      font-size: 14px;
    }
    
    .ql-editor {
      padding: 12px 16px;
      min-height: 180px;
    }
    
    .ql-editor.ql-blank::before {
      font-style: normal;
      color: #9ca3af;
    }
  `]
})
export class QuillEditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  @ViewChild('toolbarContainer', { static: false }) toolbarContainer?: ElementRef;
  
  @Input() value: string = '';
  @Input() placeholder: string = 'Escribe aquí...';
  @Input() readOnly: boolean = false;
  @Input() showToolbar: boolean = true;
  @Input() showCharCount: boolean = true;
  @Input() showTemplates: boolean = true;
  @Input() theme: string = 'snow';
  
  @Output() onContentChange = new EventEmitter<string>();
  @Output() onBlur = new EventEmitter<void>();
  @Output() onFocus = new EventEmitter<void>();
  
  private quill!: Quill;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  
  characterCount: number = 0;
  
  quickTemplates = [
    { name: 'Saludo', html: '<p>Hola <strong>{{name}}</strong>,</p>' },
    { name: 'Despedida', html: '<p>Saludos cordiales,<br>El equipo</p>' },
    { name: 'CTA Botón', html: '<p><a href="#" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px;">Click aquí</a></p>' },
    { name: 'Link', html: '<p><a href="#">Enlace relevante</a></p>' },
    { name: 'Spacer', html: '<div style="height:20px;"></div>' }
  ];
  
  get quillModules(): Record<string, unknown> {
    const modules: Record<string, unknown> = {
      toolbar: this.showToolbar ? [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ] : false,
      placeholder: this.placeholder,
      theme: this.theme
    };
    
    // Si hay toolbar personalizado, usar container personalizado
    if (this.showToolbar && this.toolbarContainer) {
      modules['toolbar'] = this.toolbarContainer.nativeElement;
    }
    
    return modules;
  }
  
  ngAfterViewInit(): void {
    this.initQuill();
  }
  
  ngOnDestroy(): void {
    if (this.quill) {
      this.quill.off('text-change');
      this.quill.off('selection-change');
    }
  }
  
  private initQuill(): void {
    this.quill = new Quill(this.editorContainer.nativeElement, {
      modules: this.quillModules,
      placeholder: this.placeholder,
      theme: this.theme,
      readOnly: this.readOnly
    });
    
    // Set initial content
    if (this.value) {
      this.quill.root.innerHTML = this.value;
      this.updateCharCount();
    }
    
    // Event listeners
    this.quill.on('text-change', () => {
      const html = this.quill.root.innerHTML;
      this.onChange(html);
      this.onContentChange.emit(html);
      this.updateCharCount();
    });
    
    this.quill.on('selection-change', (range) => {
      if (range && range.length > 0) {
        this.onFocus.emit();
      } else if (!range) {
        this.onBlur.emit();
      }
    });
  }
  
  private updateCharCount(): void {
    this.characterCount = this.quill.getText().replace(/\n/g, '').length;
  }
  
  writeValue(value: string): void {
    this.value = value || '';
    if (this.quill && value !== this.quill.root.innerHTML) {
      this.quill.root.innerHTML = value || '';
      this.updateCharCount();
    }
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.readOnly = isDisabled;
    if (this.quill) {
      this.quill.enable(!isDisabled);
    }
  }
  
  insertTemplate(html: string): void {
    if (this.quill) {
      const range = this.quill.getSelection(true);
      if (range) {
        this.quill.clipboard.dangerouslyPasteHTML(range.index, html);
      }
    }
  }
  
  insertHtml(html: string): void {
    if (this.quill) {
      this.quill.clipboard.dangerouslyPasteHTML(html);
    }
  }
  
  focus(): void {
    if (this.quill) {
      this.quill.focus();
    }
  }
  
  blur(): void {
    if (this.quill) {
      this.quill.blur();
    }
  }
  
  clear(): void {
    if (this.quill) {
      this.quill.setText('');
    }
  }
  
  getContent(): string {
    return this.quill?.root.innerHTML || '';
  }
  
  getText(): string {
    return this.quill?.getText() || '';
  }
}
