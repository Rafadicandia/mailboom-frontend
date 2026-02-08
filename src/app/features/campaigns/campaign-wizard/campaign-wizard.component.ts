import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';
import { businessValidators } from '../../../shared/validators/business.validators';
import { EmailDesign } from './templates/template.model';
import { DesignStepComponent } from './steps/design-step.component';

type WizardStep = 0 | 1 | 2 | 3;

@Component({
  selector: 'app-campaign-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DesignStepComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Nueva Campaña</h2>
        <p class="text-gray-600 mt-1">Sigue los pasos para crear tu campaña</p>
      </div>

      <!-- Stepper -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          @for (step of stepLabels; track $index) {
            <div class="flex items-center" [class.flex-1]="$index < stepLabels.length - 1">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all"
                     [class.bg-indigo-600]="currentStep() === $index"
                     [class.text-white]="currentStep() === $index"
                     [class.bg-green-600]="currentStep() > $index"
                     [class.bg-gray-200]="currentStep() < $index">
                  @if (currentStep() > $index) { ✓ } @else { {{ $index + 1 }} }
                </div>
                <span class="mt-2 text-xs font-medium hidden sm:block" 
                      [class.text-indigo-600]="currentStep() === $index"
                      [class.text-gray-500]="currentStep() !== $index">
                  {{ step }}
                </span>
              </div>
              @if ($index < stepLabels.length - 1) {
                <div class="flex-1 h-1 mx-4 rounded-full transition-all"
                     [class.bg-indigo-600]="currentStep() > $index"
                     [class.bg-gray-200]="currentStep() <= $index">
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Contenido -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        
        <!-- PASO 1: CONFIG -->
        @if (currentStep() === 0) {
          <form [formGroup]="configForm" class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">Configuración Básica</h3>
              <p class="text-sm text-gray-600">Define el asunto y remitente</p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Asunto <span class="text-red-500">*</span></label>
              <input type="text" formControlName="subject" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                     [class.border-red-500]="configForm.get('subject')?.invalid && configForm.get('subject')?.touched"
                     maxlength="150">
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">{{ configForm.get('subject')?.value?.length || 0 }}/150</span>
                @if (configForm.get('subject')?.hasError('consecutiveUppercase')) {
                  <span class="text-red-600">⚠️ Evita MAYÚSCULAS excesivas</span>
                }
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Nombre del Remitente <span class="text-red-500">*</span></label>
              <div class="relative">
                <input type="text" formControlName="fromDisplayName" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-32">
                <span class="absolute right-3 top-2 text-gray-400 text-sm">via Mailboom</span>
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <button type="button" (click)="nextStep()" [disabled]="!configForm.valid" 
                      class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300">
                Siguiente →
              </button>
            </div>
          </form>
        }

        <!-- PASO 2: DISEÑO -->
        @if (currentStep() === 1) {
          <app-design-step 
            (onNext)="onDesignComplete($event)"
            (onBack)="prevStep()">
          </app-design-step>
        }

        <!-- PASO 3: AUDIENCIA -->
        @if (currentStep() === 2) {
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">Seleccionar Audiencia</h3>
              <p class="text-sm text-gray-600">Elige la lista de destinatarios</p>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-sm text-yellow-800">⚠️ Funcionalidad de listas en desarrollo</p>
            </div>

            <div class="flex justify-between pt-4">
              <button type="button" (click)="prevStep()" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                ← Anterior
              </button>
              <button type="button" (click)="nextStep()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Siguiente: Revisión →
              </button>
            </div>
          </div>
        }

        <!-- PASO 4: REVISIÓN -->
        @if (currentStep() === 3) {
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">Revisión Final</h3>
              <p class="text-sm text-gray-600">Verifica antes de enviar</p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <p><span class="text-gray-600">Asunto:</span> <span class="font-medium">{{ configForm.value.subject }}</span></p>
              <p><span class="text-gray-600">Remitente:</span> <span class="font-medium">{{ configForm.value.fromDisplayName }} via Mailboom</span></p>
              <p><span class="text-gray-600">Modo:</span> <span class="font-medium">{{ campaignDesign()?.mode === 'custom-html' ? 'HTML personalizado' : 'Diseñador visual' }}</span></p>
            </div>

            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <iframe [srcdoc]="getPreviewHtml()" class="w-full h-64 border-0"></iframe>
            </div>

            <div class="flex justify-between pt-4">
              <button type="button" (click)="prevStep()" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                ← Anterior
              </button>
              <button type="button" (click)="submit()" [disabled]="isSubmitting()" 
                      class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300">
                @if (isSubmitting()) { Enviando... } @else { 🚀 Crear Campaña }
              </button>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class CampaignWizardComponent {
  currentStep = signal<WizardStep>(0);
  stepLabels = ['Configuración', 'Diseño', 'Audiencia', 'Revisión'];
  campaignDesign = signal<EmailDesign | null>(null);
  isSubmitting = signal(false);
  
  configForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private authService: AuthService,
    private router: Router
  ) {
    this.configForm = this.fb.group({
      subject: ['', businessValidators.subject],
      fromDisplayName: ['', businessValidators.fromDisplayName]
    });
  }

  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.update(s => (s + 1) as WizardStep);
    }
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => (s - 1) as WizardStep);
    }
  }

  onDesignComplete(design: EmailDesign) {
    this.campaignDesign.set(design);
    this.nextStep();
  }

  getPreviewHtml(): string {
    const design = this.campaignDesign();
    if (!design) return '';
    
    if (design.mode === 'custom-html' && design.customHtml) {
      return design.customHtml;
    }
    
    // Generar HTML del diseñador visual
    return this.generateHtmlFromDesign(design);
  }

  generateHtmlFromDesign(d: EmailDesign): string {
    const contentHtml = d.content.map(block => {
      const style = block.style;
      const baseStyle = style ? 
        `font-family:${style.fontFamily};font-size:${this.getFontSize(style.fontSize)};color:${style.color};text-align:${style.align};font-weight:${style.bold ? 'bold' : 'normal'};font-style:${style.italic ? 'italic' : 'normal'};` 
        : '';
      
      switch (block.type) {
        case 'text':
          return `<div style="${baseStyle}padding:10px 0;">${block.content}</div>`;
        case 'image':
          return block.url ? `<div style="text-align:center;padding:10px 0;"><img src="${block.url}" style="max-width:100%;height:auto;"></div>` : '';
        case 'button':
          return `<div style="text-align:center;padding:20px 0;"><a href="${block.url || '#'}" style="display:inline-block;padding:12px 30px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px;">${block.content}</a></div>`;
        case 'divider':
          return '<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">';
        default:
          return '';
      }
    }).join('');

    const headerHtml = d.header.enabled ? 
      (d.header.useImage && d.header.imageUrl 
        ? `<div style="text-align:center;padding:20px;background:${d.header.backgroundColor};"><img src="${d.header.imageUrl}" style="max-height:${d.header.height}px;width:auto;"></div>`
        : `<div style="padding:20px;background:${d.header.backgroundColor};color:${d.header.textColor};text-align:center;font-size:24px;font-weight:bold;height:${d.header.height}px;display:flex;align-items:center;justify-content:center;">${d.header.text}</div>`
      ) : '';

    const footerHtml = d.footer.enabled ? `
      <div style="padding:30px;background:${d.footer.backgroundColor};color:${d.footer.textColor};font-size:12px;text-align:center;border-top:1px solid #e5e7eb;">
        ${d.footer.companyName ? `<p style="margin:0 0 5px 0;font-weight:bold;">${d.footer.companyName}</p>` : ''}
        ${d.footer.address ? `<p style="margin:0 0 5px 0;">${d.footer.address}</p>` : ''}
        ${d.footer.phone || d.footer.email ? `<p style="margin:0 0 5px 0;">${d.footer.phone} ${d.footer.email ? '| ' + d.footer.email : ''}</p>` : ''}
        ${d.footer.website ? `<p style="margin:0 0 10px 0;"><a href="${d.footer.website}" style="color:${d.footer.textColor};">${d.footer.website}</a></p>` : ''}
        ${d.footer.customText ? `<p style="margin:10px 0;font-size:11px;">${d.footer.customText}</p>` : ''}
        <p style="margin:15px 0 0 0;font-size:11px;">
          Enviado con <a href="https://mailboom.com" style="color:${d.footer.textColor};font-weight:bold;">Mailboom</a>
          ${d.footer.showUnsubscribe ? ` | <a href="{{unsubscribe_link}}" style="color:${d.footer.textColor};">Darme de baja</a>` : ''}
        </p>
      </div>
    ` : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0;padding:0;background:${d.backgroundColor};font-family:Arial,sans-serif; }
    .wrapper { padding:20px; }
    .container { max-width:${d.contentMaxWidth}px;margin:0 auto;background:#ffffff; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${headerHtml}
      <div style="padding:30px;">
        ${contentHtml}
      </div>
      ${footerHtml}
    </div>
  </div>
</body>
</html>`;
  }

  getFontSize(size?: string): string {
    const sizes: Record<string, string> = { small: '14px', normal: '16px', large: '20px', xlarge: '24px' };
    return sizes[size || 'normal'];
  }

  submit() {
    const design = this.campaignDesign();
    if (!design) return;

    this.isSubmitting.set(true);
    
    const htmlContent = design.mode === 'custom-html' 
      ? (design.customHtml || '') 
      : this.generateHtmlFromDesign(design);
    
    const request = {
      ownerId: this.authService.currentUser()?.id || '',
      subject: this.configForm.value.subject,
      htmlContent: htmlContent,
      sender: `${this.configForm.value.fromDisplayName} via Mailboom`,
      recipientListId: 'temp-list-id'
    };

    this.campaignService.createCampaign(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/campaigns']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert('Error: ' + (err.error?.message || err.message));
      }
    });
  }
}