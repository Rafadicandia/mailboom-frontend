import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { SendTemplateMessageRequest, SendTemplateMessageResponse, TemplateInfo, TemplateLanguage, TemplateComponent } from '../../../core/models/whatsapp.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-whatsapp-sender',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './whatsapp-sender.component.html',
  styleUrl: './whatsapp-sender.component.scss'
})
export class WhatsappSenderComponent implements OnInit {
  private adminService = inject(AdminService);
  fb = inject(FormBuilder);

  sendForm: FormGroup = this.fb.group({
    to: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
    templateName: ['', Validators.required],
    languageCode: ['es', Validators.required],
    parameters: this.fb.array([])
  });

  availableTemplates: TemplateInfo[] = [];
  availableLanguages: TemplateLanguage[] = [];
  sending = false;
  sendResult: SendTemplateMessageResponse | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Plantillas de ejemplo (mock) - en producción se cargarían desde el API
  mockTemplates: TemplateInfo[] = [
    {
      name: 'bienvenida',
      language: 'es',
      category: 'UTILITY',
      status: 'approved',
      components: [
        {
          type: 'BODY',
          text: 'Hola {{1}}, bienvenido a nuestro servicio. Tu código de verificación es {{2}}.',
          format: '',
          example: null
        },
        {
          type: 'FOOTER',
          text: 'Este mensaje es automático, no responda.',
          format: '',
          example: null
        }
      ]
    },
    {
      name: 'notificacion_pedido',
      language: 'es',
      category: 'UTILITY',
      status: 'approved',
      components: [
        {
          type: 'BODY',
          text: 'Estimado {{1}}, su pedido #{{2}} ha sido confirmado. Total: {{3}}.',
          format: '',
          example: null
        }
      ]
    },
    {
      name: 'recordatorio',
      language: 'es',
      category: 'MARKETING',
      status: 'approved',
      components: [
        {
          type: 'BODY',
          text: 'Hola {{1}}, te recordamos que tienes una cita pendiente el {{2}} a las {{3}}.',
          format: '',
          example: null
        }
      ]
    }
  ];

  // Idiomas disponibles para las plantillas
  mockLanguages: TemplateLanguage[] = [
    { code: 'es', name: 'Español', region: 'ES' },
    { code: 'en', name: 'Inglés', region: 'US' },
    { code: 'pt', name: 'Portugués', region: 'BR' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  get parameters(): FormArray {
    return this.sendForm.get('parameters') as FormArray;
  }

  loadTemplates(): void {
    this.adminService.getTemplates().subscribe({
      next: (templates) => {
        this.availableTemplates = templates;
        if (templates.length > 0) {
          this.onTemplateChange(templates[0].name);
        }
      },
      error: (err) => {
        console.error('Error al cargar plantillas:', err);
        this.errorMessage = 'Error al cargar plantillas: ' + err.message;
        // Usar plantillas mock como fallback
        this.availableTemplates = [...this.mockTemplates];
        if (this.availableTemplates.length > 0) {
          this.onTemplateChange(this.availableTemplates[0].name);
        }
      }
    });
  }

  onTemplateChange(templateName: string): void {
    const template = this.availableTemplates.find(t => t.name === templateName);
    if (template) {
      // Usar el idioma de la plantilla o el primero disponible
      this.availableLanguages = this.mockLanguages.filter(l => l.code === template.language);
      if (this.availableLanguages.length === 0) {
        this.availableLanguages = this.mockLanguages;
      }
      this.sendForm.patchValue({ languageCode: template.language });
      this.buildParametersForm(template);
    }
  }

  onTemplateSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onTemplateChange(target.value);
  }

  buildParametersForm(template: TemplateInfo): void {
    this.parameters.clear();
    const bodyComponent = template.components.find((c: TemplateComponent) => c.type === 'BODY');
    if (bodyComponent && bodyComponent.text) {
      const paramCount = (bodyComponent.text.match(/\{\{\d+\}\}/g) || []).length;
      for (let i = 0; i < paramCount; i++) {
        this.parameters.push(this.fb.group({
          type: ['text'],
          text: ['', Validators.required]
        }));
      }
    }
  }

  addParameter(): void {
    this.parameters.push(this.fb.group({
      type: ['text'],
      text: ['', Validators.required]
    }));
  }

  removeParameter(index: number): void {
    this.parameters.removeAt(index);
  }

  onSubmit(): void {
    if (this.sendForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos';
      return;
    }

    this.sending = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.sendResult = null;

    const formValue = this.sendForm.value;
    const request: SendTemplateMessageRequest = {
      to: formValue.to,
      templateName: formValue.templateName,
      languageCode: formValue.languageCode,
      parameters: formValue.parameters || []
    };

    this.adminService.sendTemplateMessage(request).subscribe({
      next: (response) => {
        this.sendResult = response;
        this.successMessage = 'Mensaje enviado exitosamente';
        this.sendForm.reset({
          languageCode: 'es',
          parameters: []
        });
        this.parameters.clear();
      },
      error: (err) => {
        this.errorMessage = 'Error al enviar mensaje: ' + (err.error?.message || err.message);
      },
      complete: () => {
        this.sending = false;
      }
    });
  }

  getParameterTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      text: 'Texto',
      currency: 'Moneda',
      date_time: 'Fecha/Hora',
      image: 'Imagen',
      document: 'Documento',
      video: 'Video',
      location: 'Ubicación'
    };
    return labels[type] || type;
  }

  getPlaceholderForParam(index: number): string {
    return `Parámetro {{${index + 1}}}`;
  }

  getParamControl(param: any, controlName: string): FormControl {
    return param.get(controlName) as FormControl;
  }
}