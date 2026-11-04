import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AdminService } from '../../../../../core/services/admin.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { CreateTemplateRequest, TemplateComponent, TemplateInfo } from '../../../../../core/models/whatsapp.model';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-whatsapp-template-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './whatsapp-template-create.component.html',
  styleUrl: './whatsapp-template-create.component.scss'
})
export class WhatsappTemplateCreateComponent {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  @Output() templateCreated = new EventEmitter<TemplateInfo>();
  @Output() cancel = new EventEmitter<void>();

  isOpen = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Idiomas disponibles
  availableLanguages = [
    { code: 'es', name: 'Español', region: 'ES' },
    { code: 'en', name: 'Inglés', region: 'US' },
    { code: 'pt', name: 'Portugués', region: 'BR' }
  ];

  // Categorías disponibles
  availableCategories = [
    { value: 'UTILITY', label: 'Utilidad' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'AUTHENTICATION', label: 'Autenticación' }
  ];

  // Formulario de creación de template
  createForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/), Validators.maxLength(50)]],
    category: ['UTILITY', Validators.required],
    language: ['es', Validators.required],
    parameterFormat: ['', Validators.maxLength(100)],
    components: this.fb.array([])
  });

  // Confirm dialog para enviar a revisión
  confirmDialogData: ConfirmDialogData = {
    title: 'Enviar plantilla a revisión',
    message: '¿Estás seguro de enviar esta plantilla a Meta para revisión? Una vez enviada, no podrás modificarla.',
    type: 'warning'
  };

  isConfirmDialogOpen = signal(false);

  constructor() {
    // Inicializar con un componente BODY vacío
    this.addComponent('BODY');
  }

  get components(): FormArray {
    return this.createForm.get('components') as FormArray;
  }

  addComponent(type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTON'): void {
    const component = this.fb.group({
      type: [type, Validators.required],
      text: ['', Validators.required],
      format: [''],
      example: ['']
    });

    this.components.push(component);
  }

  removeComponent(index: number): void {
    // No permitir eliminar el último componente BODY
    const bodyComponents = this.components.controls.filter(c => c.get('type')?.value === 'BODY');
    if (bodyComponents.length <= 1 && this.components.controls[index].get('type')?.value === 'BODY') {
      this.errorMessage.set('Debe existir al menos un componente BODY');
      return;
    }

    this.components.removeAt(index);
    this.errorMessage.set(null);
  }

  getComponentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      HEADER: 'Encabezado',
      BODY: 'Cuerpo',
      FOOTER: 'Pie de página',
      BUTTON: 'Botón'
    };
    return labels[type] || type;
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.errorMessage.set('Por favor, complete todos los campos requeridos');
      return;
    }

    // Validar que haya al menos un componente BODY
    const hasBody = this.components.controls.some(c => c.get('type')?.value === 'BODY');
    if (!hasBody) {
      this.errorMessage.set('Debe existir al menos un componente BODY');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.createForm.value;
    const request: CreateTemplateRequest = {
      name: formValue.name,
      category: formValue.category,
      parameterFormat: formValue.parameterFormat || '',
      components: formValue.components,
      language: formValue.language,
      ownerId: this.authService.currentUser()?.id || 'unknown'
    };

    this.adminService.createTemplate(request).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Plantilla creada exitosamente. Enviada a revisión.');
        
        // Convertir a TemplateInfo para emitir
        const templateInfo: TemplateInfo = {
          name: response.name,
          language: response.language,
          category: response.category,
          status: response.status as 'approved' | 'pending' | 'rejected',
          components: response.components
        };

        this.templateCreated.emit(templateInfo);
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Error al crear la plantilla: ' + (err.error?.message || err.message));
        console.error('Error creating template:', err);
      }
    });
  }

  openConfirmDialog(): void {
    this.isConfirmDialogOpen.set(true);
  }

  onConfirmSend(): void {
    this.isConfirmDialogOpen.set(false);
    this.onSubmit();
  }

  onCancelSend(): void {
    this.isConfirmDialogOpen.set(false);
  }

  closeConfirmDialog(): void {
    this.isConfirmDialogOpen.set(false);
  }

  close(): void {
    this.isOpen.set(false);
    this.cancel.emit();
  }

  getPlaceholderForParam(index: number): string {
    return `{{${index + 1}}}`;
  }
}