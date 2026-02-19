import { Component, signal, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmailDesign } from './templates/template.model';
import { DesignStepComponent } from './steps/design-step.component';
import { AudienceStepComponent } from './steps/audience-step.component';
import { NewCampaignRequest, Campaign } from '../../../core/models/campaign.model';
import { ContactList } from '../../../core/models/contact.model';
import { ContactService } from '../../../core/services/contact.service';

type WizardStep = 0 | 1 | 2 | 3;

// Subject validators
const subjectValidators = [
  Validators.required,
  Validators.maxLength(150),
  Validators.pattern(/^[^\n]*$/)
];

// From display name validators
const fromDisplayNameValidators = [
  Validators.required,
  Validators.minLength(2),
  Validators.maxLength(50)
];

@Component({
  selector: 'app-campaign-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, JsonPipe, DesignStepComponent, AudienceStepComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">{{ isEditing() ? 'Editar Campaña' : 'Nueva Campaña' }}</h2>
        <p class="text-gray-600 mt-1">{{ isEditing() ? 'Modifica tu campaña existente' : 'Crea y guarda tu campaña como borrador' }}</p>
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
          <!-- Debug: {{ configForm.value | json }} -->
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
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Nombre del Remitente <span class="text-red-500">*</span></label>
              <div class="relative">
                <input type="text" formControlName="fromDisplayName" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-36">
                <span class="absolute right-3 top-2 text-gray-400 text-sm bg-white pl-2">&#64;mailboom.email</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">{{ configForm.get('fromDisplayName')?.value?.length || 0 }}/36</span>
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
            [initialDesign]="campaignDesign()"
            (onNext)="onDesignComplete($event)"
            (onBack)="prevStep()">
          </app-design-step>
        }

        <!-- PASO 3: AUDIENCIA -->
        @if (currentStep() === 2) {
          <app-audience-step
            [preSelectedListId]="selectedAudience()?.id || null"
            (onNext)="onAudienceComplete($event)"
            (onBack)="prevStep()"
            (onListSelected)="onListSelected($event)">
          </app-audience-step>
        }

        <!-- PASO 4: REVISIÓN -->
        @if (currentStep() === 3) {
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">Revisión Final</h3>
              <p class="text-sm text-gray-600">Tu campaña está lista para enviar o guardar</p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <p><span class="text-gray-600">Asunto:</span> <span class="font-medium">{{ configForm.value.subject }}</span></p>
              <p><span class="text-gray-600">Remitente:</span> <span class="font-medium">{{ configForm.value.fromDisplayName }}&#64;mailboom.email</span></p>
              <p><span class="text-gray-600">Modo:</span> <span class="font-medium">{{ campaignDesign()?.mode === 'custom-html' ? 'HTML personalizado' : 'Diseñador visual' }}</span></p>
              @if (selectedAudience()) {
                <p class="flex items-center gap-2">
                  <span class="text-gray-600">Audiencia:</span> 
                  <span class="font-medium flex items-center gap-1">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ selectedAudience()?.name }} 
                    @if (selectedAudience()?.totalContacts && selectedAudience()?.totalContacts! > 0) {
                      ({{ selectedAudience()?.totalContacts }} contactos)
                    } @else {
                      <span class="text-yellow-600 text-sm">(contactos: verificar)</span>
                    }
                  </span>
                </p>
              }
            </div>

            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <iframe [srcdoc]="getPreviewHtml()" class="w-full h-64 border-0"></iframe>
            </div>

            <!-- Acciones -->
            <div class="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <button type="button" (click)="prevStep()" 
                      class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                ← Atrás
              </button>
              <div class="flex gap-3">
                <button type="button" (click)="saveDraft()" [disabled]="isSubmitting()"
                        class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-300">
                  💾 Guardar Borrador
                </button>
                <button type="button" (click)="goToSend()" [disabled]="isSubmitting()"
                        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300">
                  🚀 Enviar Campaña →
                </button>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class CampaignWizardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly campaignService = inject(CampaignService);
  private readonly contactService = inject(ContactService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  currentStep = signal<WizardStep>(0);
  stepLabels = ['Configuración', 'Diseño', 'Audiencia', 'Revisión'];
  campaignDesign = signal<EmailDesign | null>(null);
  selectedAudience = signal<ContactList | null>(null);
  isSubmitting = signal(false);
  isEditing = signal(false);
  editingCampaignId = signal<string | null>(null);

  configForm: FormGroup = this.fb.group({
    subject: ['', subjectValidators],
    fromDisplayName: ['', [...fromDisplayNameValidators, Validators.maxLength(36)]]
  });

  ngOnInit() {
    // Check for edit mode - only process once
    this.route.queryParams.subscribe(params => {
      const editId = params['edit'];
      const listId = params['listId'];
      
      // Skip if already editing and IDs haven't changed
      if (this.editingCampaignId() && this.editingCampaignId() === editId) {
        console.log('Already editing campaign, skipping...');
        return;
      }
      
      if (editId) {
        console.log('Edit mode detected, campaign ID:', editId);
        // Edit existing campaign
        this.loadCampaignForEdit(editId);
      } else if (listId) {
        console.log('List ID detected:', listId);
        // Pre-select the audience for new campaign
        this.selectAudienceFromId(listId);
      }
    });
  }

  loadCampaignForEdit(campaignId: string) {
    this.isEditing.set(true);
    this.editingCampaignId.set(campaignId);
    
    // First, check if we already have the campaign in the service
    const currentCampaign = this.campaignService.currentCampaign();
    if (currentCampaign && currentCampaign.id === campaignId) {
      console.log('Using cached campaign data:', currentCampaign);
      this.populateFormWithCampaign(currentCampaign);
      return;
    }
    
    // If not, fetch from API
    this.campaignService.getCampaign(campaignId).subscribe({
      next: (campaign) => {
        console.log('Campaign loaded for edit from API:', campaign);
        this.populateFormWithCampaign(campaign);
      },
      error: (err) => {
        console.error('Error loading campaign:', err);
        alert('Error al cargar campaña: ' + (err.error?.message || err.message));
        this.router.navigate(['/campaigns']);
      }
    });
  }

  populateFormWithCampaign(campaign: Campaign) {
    console.log('Populating form with campaign:', campaign);
    
    // Handle both 'sender' and 'senderIdentity' fields from backend
    const senderValue = (campaign as any).senderIdentity || campaign.sender || '';
    const senderDisplayName = senderValue.replace(/@.*$/, '');
    
    // Use patchValue to set form values
    this.configForm.patchValue({
      subject: campaign.subject,
      fromDisplayName: senderDisplayName
    });
    
    // Mark fields as touched to show validation state
    this.configForm.get('subject')?.markAsTouched();
    this.configForm.get('fromDisplayName')?.markAsTouched();
    
    // Log form values after patch
    console.log('Form values after patch:', this.configForm.value);
    
    // Load design from HTML
    // Determinar el modo: si hay contenido HTML guardado, usamos custom-html para permitir editarlo
    const hasHtmlContent = campaign.htmlContent && campaign.htmlContent.trim().length > 0;
    
    const designToSet: EmailDesign = {
      mode: hasHtmlContent ? 'custom-html' : 'template',
      content: [],
      customHtml: hasHtmlContent ? campaign.htmlContent : '',
      backgroundColor: '#ffffff',
      contentMaxWidth: 600,
      header: { enabled: false, backgroundColor: '#ffffff', textColor: '#000000', text: '', height: 60, useImage: false, imageUrl: '' },
      footer: { 
        enabled: false, 
        backgroundColor: '#f3f4f6', 
        textColor: '#6b7280', 
        companyName: '', 
        address: '', 
        phone: '', 
        email: '', 
        website: '', 
        socialLinks: {},
        customText: '', 
        showUnsubscribe: false 
      }
    };
    this.campaignDesign.set(designToSet);
    console.log('Design set:', this.campaignDesign());
    
    // Load audience - ensure lists are loaded first
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      // First check if lists are already loaded
      const lists = this.contactService.contactLists();
      if (lists.length > 0) {
        // Lists already loaded, select the audience directly
        this.loadAudienceForEdit(campaign.recipientListId);
      } else {
        // Lists not loaded yet, load them and then select audience
        this.contactService.loadUserContactLists(userId);
        // Poll for lists to be loaded, then select the audience
        const checkListsInterval = setInterval(() => {
          const loadedLists = this.contactService.contactLists();
          if (loadedLists.length > 0) {
            clearInterval(checkListsInterval);
            // Small delay to ensure lists are fully processed
            setTimeout(() => {
              this.loadAudienceForEdit(campaign.recipientListId);
            }, 100);
          }
        }, 100);
        // Fallback: if loading takes too long, still try after 2 seconds
        setTimeout(() => {
          clearInterval(checkListsInterval);
          this.loadAudienceForEdit(campaign.recipientListId);
        }, 2000);
      }
    } else {
      this.loadAudienceForEdit(campaign.recipientListId);
    }
    
    // Start at step 0 to allow viewing all steps
    this.currentStep.set(0);
    console.log('Current step set to:', this.currentStep());
    
    // Force change detection multiple times to ensure template updates
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  loadAudienceForEdit(listId: string) {
    // First try with already loaded lists
    let lists = this.contactService.contactLists();
    if (lists.length > 0) {
      const list = lists.find(l => l.id === listId);
      if (list) {
        this.selectedAudience.set(list);
        return;
      }
    }
    
    // If no lists or list not found, load them
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.contactService.loadUserContactLists(userId);
      // Try again after loading
      setTimeout(() => {
        lists = this.contactService.contactLists();
        console.log('Available lists after load:', lists);
        const list = lists.find(l => l.id === listId);
        if (list) {
          this.selectedAudience.set(list);
          console.log('Audience selected:', list.name);
        } else {
          console.warn('Audience not found with id:', listId);
        }
      }, 500);
    }
  }

  selectAudienceFromId(listId: string) {
    const lists = this.contactService.contactLists();
    const list = lists.find(l => l.id === listId);
    if (list) {
      this.selectedAudience.set(list);
    } else {
      // If lists not loaded yet, load them and then try again
      const userId = this.authService.currentUser()?.id;
      if (userId) {
        this.contactService.loadUserContactLists(userId);
        // Try again after a short delay
        setTimeout(() => {
          const lists2 = this.contactService.contactLists();
          const list2 = lists2.find(l => l.id === listId);
          if (list2) {
            this.selectedAudience.set(list2);
          }
        }, 500);
      }
    }
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

  onListSelected(listId: string) {
    // Find the list in the contact service
    const lists = this.contactService.contactLists();
    const list = lists.find(l => l.id === listId);
    if (list) {
      console.log('onListSelected - Lista encontrada:', list);
      this.selectedAudience.set(list);
    } else {
      console.warn('onListSelected - Lista no encontrada para id:', listId);
      console.log('Listas disponibles:', lists);
    }
  }

  onAudienceComplete(listId: string) {
    this.nextStep();
  }

  getPreviewHtml(): string {
    const design = this.campaignDesign();
    if (!design) return '';
    
    if (design.mode === 'custom-html' && design.customHtml) {
      return design.customHtml;
    }
    
    return this.generateHtmlFromDesign(design);
  }

  generateHtmlFromDesign(d: EmailDesign): string {
    const contentHtml = d.content.map(block => {
      const style = block.style;
      const baseStyle = style ? 
        `font-family:${style.fontFamily};font-size:${this.getFontSize(style.fontSize)};color:${style.color};text-align:${style.align};font-weight:${style.bold ? 'bold' : 'normal'};font-style:${style.italic ? 'italic' : 'normal'};` 
        : '';
      
      switch (block.type) {
        case 'rich-text':
          // Usar htmlContent para texto enriquecido
          const richContent = block.htmlContent || block.content;
          return `<div style="${baseStyle}padding:10px 0;">${richContent}</div>`;
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
    const audience = this.selectedAudience();
    
    if (!design) return;
    if (!audience) {
      alert('Por favor selecciona una audiencia');
      return;
    }

    this.isSubmitting.set(true);
    
    const htmlContent = design.mode === 'custom-html' 
      ? (design.customHtml || '') 
      : this.generateHtmlFromDesign(design);
    
    const ownerId = this.authService.currentUser()?.id || '';
    
    // Crear request con la lista seleccionada
    const request: NewCampaignRequest = {
      ownerId: ownerId,
      subject: this.configForm.value.subject,
      htmlContent: htmlContent,
      sender: this.configForm.value.fromDisplayName,
      recipientListId: audience.id
    };

    // Check if editing or creating
    if (this.isEditing()) {
      // Update existing campaign
      console.log('📤 UPDATE CAMPAIGN (SAVE DRAFT) - Request:', JSON.stringify(request, null, 2));
      this.campaignService.updateCampaign(this.editingCampaignId()!, request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          // Clear editing state
          this.isEditing.set(false);
          this.editingCampaignId.set(null);
          // Navegar a la lista de campañas
          this.router.navigate(['/campaigns']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert('Error: ' + (err.error?.message || err.message));
        }
      });
    } else {
      // Create new campaign
      console.log('📤 SAVE NEW CAMPAIGN - Request:', JSON.stringify(request, null, 2));
      this.campaignService.createCampaign(request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          // Navegar a la lista de campañas
          this.router.navigate(['/campaigns']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert('Error: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  // Guardar borrador sin enviar
  saveDraft() {
    this.submit();
  }

  // Recargar campañas después de crear/actualizar
  loadCampaignsAfterSubmit() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.campaignService.loadUserCampaigns(userId);
    }
  }

  // Ir a la ventana de envío - llama directamente al endpoint de envío
  goToSend() {
    const design = this.campaignDesign();
    const audience = this.selectedAudience();
    
    // Validar que todos los datos estén completos
    if (!design) {
      alert('Por favor completa el diseño de la campaña');
      return;
    }
    if (!audience || !audience.id) {
      alert('Por favor selecciona una audiencia');
      return;
    }
    if (!this.configForm.value.subject) {
      alert('Por favor ingresa un asunto para la campaña');
      return;
    }
    
    // Cargar contactos de la lista y obtener el conteo
    this.isSubmitting.set(true);
    this.contactService.getContactsFromList(audience.id);
    
    // Pequeña espera para que se carguen los contactos
    setTimeout(() => {
      const contactCount = this.contactService.getContactCount(audience.id);
      this.isSubmitting.set(false);
      
      // Confirmar envío
      if (confirm(`¿Estás seguro de enviar la campaña "${this.configForm.value.subject}" a ${contactCount} contactos?`)) {
        // Proceder con el envío
        this.executeSendCampaign(design, audience);
      }
    }, 300);
  }

  executeSendCampaign(design: EmailDesign, audience: ContactList) {
    this.isSubmitting.set(true);
    
    const htmlContent = design.mode === 'custom-html' 
      ? (design.customHtml || '') 
      : this.generateHtmlFromDesign(design);
    
    const ownerId = this.authService.currentUser()?.id || '';
    
    const request: NewCampaignRequest = {
      ownerId: ownerId,
      subject: this.configForm.value.subject,
      htmlContent: htmlContent,
      sender: `${this.configForm.value.fromDisplayName}`,
      recipientListId: audience.id
    };

    if (this.isEditing()) {
      // Modo edición - primero actualizar, luego enviar
      console.log('📤 SAVE NEW CAMPAIGN (EDIT MODE) - Request:', JSON.stringify(request, null, 2));
      this.campaignService.updateCampaign(this.editingCampaignId()!, request).subscribe({
        next: (campaign) => {
          console.log('🚀 SEND CAMPAIGN - campaignId:', campaign.id, ', ownerId:', ownerId);
          this.campaignService.sendCampaign(campaign.id, ownerId).subscribe({
            next: () => {
              this.isSubmitting.set(false);
              alert('✅ Campaña enviada exitosamente');
              this.router.navigate(['/campaigns']);
            },
            error: (err) => {
              this.isSubmitting.set(false);
              alert('Error al enviar: ' + (err.error?.message || err.message));
            }
          });
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert('Error: ' + (err.error?.message || err.message));
        }
      });
    } else {
      // Modo nueva campaña - primero crear, luego enviar
      console.log('📤 SAVE NEW CAMPAIGN (SEND MODE) - Request:', JSON.stringify(request, null, 2));
      this.campaignService.createCampaign(request).subscribe({
        next: (campaign) => {
          console.log('🚀 SEND CAMPAIGN - campaignId:', campaign.id, ', ownerId:', ownerId);
          this.campaignService.sendCampaign(campaign.id, ownerId).subscribe({
            next: () => {
              this.isSubmitting.set(false);
              alert('✅ Campaña enviada exitosamente');
              this.router.navigate(['/campaigns']);
            },
            error: (err) => {
              this.isSubmitting.set(false);
              alert('Error al enviar: ' + (err.error?.message || err.message));
            }
          });
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert('Error: ' + (err.error?.message || err.message));
        }
      });
    }
  }
}
