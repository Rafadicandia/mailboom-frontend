import { Component, Input, Output, EventEmitter, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { TemplateInfo, TemplateLanguage } from '../../../core/models/whatsapp.model';

@Component({
  selector: 'app-whatsapp-template-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './whatsapp-template-selector.component.html',
  styleUrl: './whatsapp-template-selector.component.scss'
})
export class WhatsappTemplateSelectorComponent implements OnInit {
  private adminService = inject(AdminService);

  @Input() selectedTemplate: string = '';
  @Input() selectedLanguage: string = 'es';
  @Output() templateChange = new EventEmitter<{ templateName: string; languageCode: string }>();
  @Output() languageChange = new EventEmitter<string>();

  availableTemplates = signal<TemplateInfo[]>([]);
  availableLanguages = signal<TemplateLanguage[]>([
    { code: 'es', name: 'Español', region: 'ES' },
    { code: 'en', name: 'Inglés', region: 'US' },
    { code: 'pt', name: 'Portugués', region: 'BR' }
  ]);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Plantillas mock para fallback en caso de error
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
    },
    {
      name: 'promocion_especial',
      language: 'es',
      category: 'MARKETING',
      status: 'approved',
      components: [
        {
          type: 'HEADER',
          text: '¡Oferta Especial!',
          format: '',
          example: null
        },
        {
          type: 'BODY',
          text: 'Hola {{1}}, aprovecha nuestra promoción exclusiva con {{2}}% de descuento. Válido hasta {{3}}.',
          format: '',
          example: null
        }
      ]
    }
  ];

  filteredTemplates = computed(() => {
    const templates = this.availableTemplates();
    const lang = this.selectedLanguage;
    return templates.filter(t => t.language === lang && t.status === 'approved');
  });

  constructor() {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.adminService.getTemplates().subscribe({
      next: (templates) => {
        this.availableTemplates.set(templates);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar las plantillas:', err);
        this.errorMessage.set('Error al cargar las plantillas. Usando plantillas locales.');
        this.loading.set(false);
        this.availableTemplates.set(this.mockTemplates);
      }
    });
  }

  onTemplateSelect(templateName: string): void {
    this.selectedTemplate = templateName;
    this.templateChange.emit({
      templateName,
      languageCode: this.selectedLanguage
    });
  }

  onLanguageSelect(languageCode: string): void {
    this.selectedLanguage = languageCode;
    this.languageChange.emit(languageCode);
    
    if (this.selectedTemplate) {
      this.templateChange.emit({
        templateName: this.selectedTemplate,
        languageCode
      });
    }
  }

  getTemplateCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'UTILITY':
        return 'bg-blue-100 text-blue-800';
      case 'MARKETING':
        return 'bg-green-100 text-green-800';
      case 'AUTHENTICATION':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}