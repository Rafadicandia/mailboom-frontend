import { Component, signal, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmailDesign } from './templates/template.model';
import { DesignStepComponent } from './steps/design-step.component';
import { AudienceStepComponent } from './steps/audience-step.component';
import { ReviewStepComponent } from './steps/review-step.component';
import { NewCampaignRequest, Campaign } from '../../../core/models/campaign.model';
import { ContactList } from '../../../core/models/contact.model';
import { ContactService } from '../../../core/services/contact.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

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
  imports: [CommonModule, ReactiveFormsModule, DesignStepComponent, AudienceStepComponent, ReviewStepComponent, ConfirmDialogComponent],
  template: `
    <div [class]="currentStep() === 1 ? 'w-full px-0 py-0' : 'max-w-3xl mx-auto px-6 py-10'">
      <!-- Stepper horizontal sobre el título -->
      <div class="mb-8">
        <div class="flex items-center justify-center gap-2">
          @for (step of stepLabels; track $index) {
            <div class="flex items-center" [class.flex-1]="$index < stepLabels.length - 1">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all"
                     [class.bg-notion-text]="currentStep() === $index"
                     [class.text-white]="currentStep() === $index"
                     [class.bg-notion-green]="currentStep() > $index"
                     [class.text-white]="currentStep() > $index"
                     [class.bg-notion-bg-hover]="currentStep() < $index"
                     [class.text-notion-text-secondary]="currentStep() < $index">
                  @if (currentStep() > $index) { ✓ } @else { {{ $index + 1 }} }
                </div>
                <span class="mt-3 text-sm font-medium" 
                      [class.text-notion-text]="currentStep() === $index"
                      [class.text-notion-text-secondary]="currentStep() !== $index">
                  {{ step }}
                </span>
              </div>
              @if ($index < stepLabels.length - 1) {
                <div class="flex-1 h-0.5 mx-4 transition-all"
                     [class.bg-notion-text]="currentStep() > $index"
                     [class.bg-notion-border]="currentStep() <= $index">
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Header -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold text-notion-text text-center">{{ isEditing() ? 'Editar Campaña' : 'Nueva Campaña' }}</h2>
        <p class="text-sm text-notion-text-secondary mt-3 text-center">{{ isEditing() ? 'Modifica tu campaña existente' : 'Crea y guarda tu campaña como borrador' }}</p>
      </div>

      <!-- Contenido -->
        
        <!-- PASO 1: CONFIG -->
        @if (currentStep() === 0) {
          <form [formGroup]="configForm" class="max-w-xl mx-auto pt-8">
            
            <div class="space-y-8">
              <input type="text" formControlName="subject" placeholder="Asunto del email" 
                     class="w-full text-xl border-0 border-b-2 border-notion-border focus:border-notion-text focus:ring-0 px-2 py-3 bg-transparent placeholder:text-notion-text-tertiary text-left"
                     [class.border-red-500]="configForm.get('subject')?.invalid && configForm.get('subject')?.touched"
                     maxlength="150">
            </div>

            <div class="flex items-center justify-left gap-2 text-base text-notion-text-secondary mt-6 mb-12">
              <span>De:</span>
              <input type="text" formControlName="fromDisplayName" placeholder="Tu nombre" 
                     class="w-40 border-0 border-b-2 border-notion-border focus:border-notion-text focus:ring-0 px-2 py-2 bg-transparent placeholder:text-notion-text-tertiary text-notion-text text-center">
              <span class="text-notion-text-tertiary">&#64;mailboom.email</span>
            </div>

            <div class="flex justify-center pt-4">
              <button type="button" (click)="nextStep()" [disabled]="!configForm.valid" 
                      class="px-5 py-2 bg-notion-text text-white rounded-notion hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
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
          <app-review-step
            [design]="campaignDesign() || undefined"
            (onNext)="goToSend()"
            (onBack)="prevStep()">
          </app-review-step>
        }

      </div>

    <!-- Confirm Dialog -->
    <app-confirm-dialog
      [dialogData]="confirmDialogData"
      [isOpen]="isConfirmDialogOpen()"
      (confirm)="onConfirmSend()"
      (cancel)="onCancelSend()"
      (dialogClose)="closeConfirmDialog()"
    />

    <!-- Success Dialog -->
    <app-confirm-dialog
      [dialogData]="successDialogData"
      [isOpen]="isSuccessDialogOpen()"
      (dialogClose)="onSuccessDialogClose()"
    />
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
  
  // Confirm dialog
  isConfirmDialogOpen = signal(false);
  confirmDialogData: ConfirmDialogData = {
    title: 'Confirmar envío',
    message: '¿Estás seguro de continuar?',
    type: 'warning'
  };
  
  // Success dialog
  isSuccessDialogOpen = signal(false);
  successDialogData: ConfirmDialogData = {
    title: 'Éxito',
    message: 'La operación se completó correctamente',
    type: 'info'
  };
  
  private pendingAudience: ContactList | null = null;
  private pendingDesign: EmailDesign | null = null;

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
    // Forzar detección de cambios para actualizar la vista previa
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
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
    
    console.log('Generating preview, design:', design.mode, 'has customHtml:', !!design.customHtml, 'customHtml length:', design.customHtml?.length);
    
    // Si hay HTML personalizado (ya sea de custom-html o del editor), usarlo directamente
    if (design.customHtml && design.customHtml.trim().length > 0) {
      // Verificar si ya tiene estructura HTML completa
      const lowerHtml = design.customHtml.toLowerCase();
      if (lowerHtml.includes('<!doctype') || lowerHtml.includes('<html')) {
        return design.customHtml;
      }
      // Si no tiene estructura, envolverlo en una estructura HTML básica
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: ${design.backgroundColor || '#ffffff'}; }
    img { max-width: 100%; height: auto; }
    a { color: #4f46e5; text-decoration: underline; }
  </style>
</head>
<body>
  ${design.customHtml}
</body>
</html>`;
    }
    
    // Si hay editorContent, intentar generar HTML desde ahí
    if (design.editorContent) {
      console.log('Using editorContent for preview');
      // Aquí se podría implementar la generación de HTML desde el contenido del editor
    }
    
    // Fallback: generar desde content
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
    
    // Usar el HTML personalizado si está disponible, sino generar desde el diseño
    const htmlContent = design.customHtml || this.generateHtmlFromDesign(design);
    
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
    
    // Usar el totalContacts del objeto audience que viene del backend
    const contactCount = audience.totalContacts || 0;
    
    // Guardar datos pendientes para el diálogo
    this.pendingAudience = audience;
    this.pendingDesign = design;
    
    // Mostrar diálogo de confirmación estilizado
    this.confirmDialogData = {
      title: 'Enviar Campaña',
      message: `¿Estás seguro de enviar la campaña "${this.configForm.value.subject}" a ${contactCount} contactos?`,
      confirmText: 'Enviar',
      cancelText: 'Cancelar',
      type: 'warning'
    };
    this.isConfirmDialogOpen.set(true);
  }
  
  onConfirmSend() {
    if (this.pendingAudience && this.pendingDesign) {
      this.executeSendCampaign(this.pendingDesign, this.pendingAudience);
    }
    this.closeConfirmDialog();
  }
  
  onCancelSend() {
    this.closeConfirmDialog();
  }
  
  closeConfirmDialog() {
    this.isConfirmDialogOpen.set(false);
    this.pendingAudience = null;
    this.pendingDesign = null;
  }
  
  showSuccessDialog(message: string) {
    this.successDialogData = {
      title: 'Éxito',
      message: message,
      type: 'info',
      confirmText: 'Aceptar'
    };
    this.isSuccessDialogOpen.set(true);
  }
  
  onSuccessDialogClose() {
    this.isSuccessDialogOpen.set(false);
    this.router.navigate(['/campaigns']);
  }

  executeSendCampaign(design: EmailDesign, audience: ContactList) {
    this.isSubmitting.set(true);
    
    // Usar el HTML generado por el editor directamente
    const htmlContent = design.customHtml || this.generateHtmlFromDesign(design);
    
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
              this.showSuccessDialog('✅ Campaña enviada exitosamente');
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
              this.showSuccessDialog('✅ Campaña enviada exitosamente');
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
