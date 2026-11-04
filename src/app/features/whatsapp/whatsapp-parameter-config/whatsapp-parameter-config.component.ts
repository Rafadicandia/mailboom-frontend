import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { TemplateParameter, TemplateInfo } from '../../../core/models/whatsapp.model';

@Component({
  selector: 'app-whatsapp-parameter-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './whatsapp-parameter-config.component.html',
  styleUrl: './whatsapp-parameter-config.component.scss'
})
export class WhatsappParameterConfigComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() template: TemplateInfo | null = null;
  @Input() parameters: TemplateParameter[] = [];
  @Output() parametersChange = new EventEmitter<TemplateParameter[]>();

  parameterForm = this.fb.group({
    parameters: this.fb.array([])
  });

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {}

  ngOnInit(): void {
    this.initializeParameters();
  }

  ngOnChanges(): void {
    this.initializeParameters();
  }

  get parametersArray(): FormArray {
    return this.parameterForm.get('parameters') as FormArray;
  }

  initializeParameters(): void {
    if (!this.template) {
      this.parametersArray.clear();
      return;
    }

    // Extraer placeholders del cuerpo del template
    const bodyComponent = this.template.components.find(c => c.type === 'BODY');
    const placeholderCount = this.extractPlaceholderCount(bodyComponent?.text || '');

    // Crear controles para cada parámetro
    const newControls = Array.from({ length: placeholderCount }, (_, i) =>
      this.fb.group({
        type: ['text', Validators.required],
        text: ['', Validators.required],
        currency: this.fb.group({
          code: ['USD', Validators.required],
          amount_1000: [0, [Validators.required, Validators.min(0)]]
        }),
        date_time: this.fb.group({
          component_type: ['date_time'],
          fallback_value: ['', Validators.required],
          day_of_week: [null],
          year: [null],
          month: [null],
          day_of_month: [null],
          hour: [null],
          minute: [null],
          calendar: ['GREGORIAN']
        }),
        image: this.fb.group({
          link: ['', Validators.required],
          caption: ['']
        }),
        document: this.fb.group({
          link: ['', Validators.required],
          filename: [''],
          caption: ['']
        }),
        video: this.fb.group({
          link: ['', Validators.required],
          caption: ['']
        }),
        location: this.fb.group({
          latitude: [0, Validators.required],
          longitude: [0, Validators.required],
          name: [''],
          address: ['']
        })
      })
    );

    this.parametersArray.clear();
    newControls.forEach(control => this.parametersArray.push(control));

    // Si hay parámetros existentes, actualizar los valores
    if (this.parameters.length > 0) {
      this.parameters.forEach((param, index) => {
        if (this.parametersArray.at(index)) {
          this.parametersArray.at(index).patchValue(param);
        }
      });
    }

    this.emitParameters();
  }

  extractPlaceholderCount(text: string): number {
    const matches = text.match(/\{\{\d+\}\}/g);
    if (!matches) return 0;
    const numbers = matches.map(m => parseInt(m.replace(/\{\{|\}\}/g, '')));
    return Math.max(...numbers);
  }

  onParameterTypeChange(index: number, type: string): void {
    const paramControl = this.parametersArray.at(index);
    if (!paramControl) return;

    // Resetear valores específicos del tipo anterior
    const typeGroups = ['currency', 'date_time', 'image', 'document', 'video', 'location'];
    typeGroups.forEach(group => {
      if (group !== type) {
        paramControl.get(group)?.reset();
      }
    });

    this.emitParameters();
  }

  onParameterValueChange(): void {
    this.emitParameters();
  }

  emitParameters(): void {
    const params = this.parametersArray.value.map((param: any, index: number) => {
      const paramData: any = {
        type: param.type
      };

      // Agregar propiedades según el tipo
      switch (param.type) {
        case 'text':
          paramData.text = param.text;
          break;
        case 'currency':
          paramData.currency = param.currency;
          break;
        case 'date_time':
          paramData.date_time = param.date_time;
          break;
        case 'image':
          paramData.image = param.image;
          break;
        case 'document':
          paramData.document = param.document;
          break;
        case 'video':
          paramData.video = param.video;
          break;
        case 'location':
          paramData.location = param.location;
          break;
      }

      return paramData;
    });

    this.parametersChange.emit(params);
  }

  getPlaceholderForParam(index: number): string {
    return `{{${index + 1}}}`;
  }

  getParamControl(param: any, field: string): FormControl {
    return param.get(field) as FormControl;
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      text: 'T',
      currency: '$',
      date_time: '📅',
      image: '🖼️',
      document: '📄',
      video: '🎬',
      location: '📍'
    };
    return icons[type] || '?';
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      text: 'Texto',
      currency: 'Moneda',
      date_time: 'Fecha/Hora',
      image: 'Imagen',
      document: 'Documento',
      video: 'Video',
      location: 'Ubicación'
    };
    return labels[type] || 'Desconocido';
  }

  isTypeSelected(index: number, type: string): boolean {
    return this.parametersArray.at(index)?.get('type')?.value === type;
  }

  getCurrencyCodes(): string[] {
    return ['USD', 'EUR', 'GBP', 'ARS', 'BRL', 'CLP', 'COP', 'MXN', 'PEN'];
  }

  getMonths(): string[] {
    return ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  }

  getWeekDays(): string[] {
    return ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  }

  trackByFn(index: number): number {
    return index;
  }
}