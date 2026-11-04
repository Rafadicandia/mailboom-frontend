import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WhatsappTemplateSelectorComponent } from '../../../../../whatsapp/whatsapp-template-selector/whatsapp-template-selector.component';
import { WhatsappParameterConfigComponent } from '../../../../../whatsapp/whatsapp-parameter-config/whatsapp-parameter-config.component';
import { WhatsappPreviewComponent } from '../../../../../whatsapp/whatsapp-preview/whatsapp-preview.component';
import { WhatsappTemplateCreateComponent } from './whatsapp-template-create.component';
import { TemplateInfo, TemplateParameter } from '../../../../../core/models/whatsapp.model';

@Component({
  selector: 'app-whatsapp-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WhatsappTemplateSelectorComponent,
    WhatsappParameterConfigComponent,
    WhatsappPreviewComponent,
    WhatsappTemplateCreateComponent
  ],
  templateUrl: './whatsapp-step.component.html',
  styleUrl: './whatsapp-step.component.scss'
})
export class WhatsappStepComponent implements OnInit {
  @Input() campaignType: string = 'email';
  @Output() stepComplete = new EventEmitter<{ valid: boolean; data: any }>();
  @Output() stepChange = new EventEmitter<number>();

  selectedTemplate = signal<TemplateInfo | null>(null);
  templateParameters = signal<TemplateParameter[]>([]);
  phoneNumber = signal<string>('');
  languageCode = signal<string>('es');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Estado del flujo
  currentStep = signal<'select' | 'configure' | 'preview'>('select');
  
  // Control de creación de plantilla
  showTemplateCreate = signal(false);

  constructor() {}

  ngOnInit(): void {}

  onTemplateSelected(data: { templateName: string; languageCode: string }): void {
    this.languageCode.set(data.languageCode);
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Simular carga de template
    setTimeout(() => {
      const mockTemplate: TemplateInfo = {
        name: data.templateName,
        language: data.languageCode,
        category: 'UTILITY',
        status: 'approved',
        components: [
          {
            type: 'BODY',
            text: this.getTemplateBody(data.templateName),
            format: '',
            example: null
          }
        ]
      };
      this.selectedTemplate.set(mockTemplate);
      this.currentStep.set('configure');
      this.isLoading.set(false);
    }, 500);
  }

  onLanguageChanged(languageCode: string): void {
    this.languageCode.set(languageCode);
    if (this.selectedTemplate()) {
      // Recargar template en nuevo idioma si es necesario
      this.onTemplateSelected({
        templateName: this.selectedTemplate()!.name,
        languageCode
      });
    }
  }

  onParametersChanged(parameters: TemplateParameter[]): void {
    this.templateParameters.set(parameters);
  }

  onPhoneNumberChange(phone: string): void {
    this.phoneNumber.set(phone);
  }

  onPreviewComplete(): void {
    this.validateAndComplete();
  }

  onEditTemplate(): void {
    this.currentStep.set('select');
  }

  validateAndComplete(): void {
    if (!this.selectedTemplate()) {
      this.errorMessage.set('Por favor seleccione una plantilla');
      return;
    }

    if (!this.phoneNumber()) {
      this.errorMessage.set('Por favor ingrese un número de teléfono');
      return;
    }

    // Validar parámetros requeridos
    const requiredParams = this.extractRequiredParams();
    const hasAllParams = requiredParams.every((_, index) => {
      const param = this.templateParameters()[index];
      return param && this.isParameterValid(param);
    });

    if (!hasAllParams && requiredParams.length > 0) {
      this.errorMessage.set('Por favor complete todos los parámetros requeridos');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set('Configuración completada exitosamente');

    const stepData = {
      campaignType: 'whatsapp' as const,
      templateName: this.selectedTemplate()!.name,
      languageCode: this.languageCode(),
      phoneNumber: this.phoneNumber(),
      parameters: this.templateParameters(),
      template: this.selectedTemplate()
    };

    this.stepComplete.emit({
      valid: true,
      data: stepData
    });
  }

  goToNextStep(): void {
    if (this.currentStep() === 'select' && this.selectedTemplate()) {
      this.currentStep.set('configure');
    } else if (this.currentStep() === 'configure') {
      this.currentStep.set('preview');
      this.validateAndComplete();
    } else if (this.currentStep() === 'preview') {
      this.validateAndComplete();
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep() === 'preview') {
      this.currentStep.set('configure');
    } else if (this.currentStep() === 'configure') {
      this.currentStep.set('select');
    }
  }

  canGoNext(): boolean {
    if (this.currentStep() === 'select') {
      return !!this.selectedTemplate();
    }
    if (this.currentStep() === 'configure') {
      return this.templateParameters().length > 0;
    }
    return true;
  }

  getStepTitle(): string {
    const titles = {
      select: 'Seleccionar Plantilla',
      configure: 'Configurar Parámetros',
      preview: 'Vista Previa'
    };
    return titles[this.currentStep()];
  }

  getProgressPercentage(): number {
    const steps = { select: 33, configure: 66, preview: 100 };
    return steps[this.currentStep()];
  }

  // Manejar creación de nueva plantilla
  onCreateTemplate(template: TemplateInfo): void {
    this.selectedTemplate.set(template);
    this.languageCode.set(template.language);
    this.currentStep.set('configure');
    this.showTemplateCreate.set(false);
    this.successMessage.set('Plantilla creada y lista para usar');
  }

  onCancelCreateTemplate(): void {
    this.showTemplateCreate.set(false);
  }

  openTemplateCreate(): void {
    this.showTemplateCreate.set(true);
  }

  private getTemplateBody(templateName: string): string {
    const templates: { [key: string]: string } = {
      'bienvenida': 'Hola {{1}}, bienvenido a nuestro servicio. Tu código de verificación es {{2}}.',
      'notificacion_pedido': 'Estimado {{1}}, su pedido #{{2}} ha sido confirmado. Total: {{3}}.',
      'recordatorio': 'Hola {{1}}, te recordamos que tienes una cita pendiente el {{2}} a las {{3}}.',
      'promocion_especial': 'Hola {{1}}, aprovecha nuestra promoción exclusiva con {{2}}% de descuento. Válido hasta {{3}}.'
    };
    return templates[templateName] || 'Plantilla sin contenido';
  }

  private extractRequiredParams(): number[] {
    if (!this.selectedTemplate()) return [];
    const body = this.selectedTemplate()!.components.find((c: any) => c.type === 'BODY');
    if (!body) return [];
    const matches = body.text.match(/\{\{\d+\}\}/g) || [];
    return matches.map((m: string) => parseInt(m.replace(/\{\{|\}\}/g, '')));
  }

  private isParameterValid(param: TemplateParameter): boolean {
    switch (param.type) {
      case 'text':
        return !!param.text && param.text.trim().length > 0;
      case 'currency':
        return !!(param.currency && param.currency.code && param.currency.amount_1000 !== undefined);
      case 'date_time':
        return !!(param.date_time && param.date_time.fallback_value);
      case 'image':
      case 'document':
      case 'video':
        const media = param[param.type];
        return !!(media && media.link);
      case 'location':
        return !!(param.location && param.location.latitude !== undefined && param.location.longitude !== undefined);
      default:
        return false;
    }
  }

  trackByFn(index: number): number {
    return index;
  }
}