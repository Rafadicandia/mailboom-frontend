import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateInfo, TemplateParameter } from '../../../core/models/whatsapp.model';

@Component({
  selector: 'app-whatsapp-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp-preview.component.html',
  styleUrl: './whatsapp-preview.component.scss'
})
export class WhatsappPreviewComponent implements OnInit {
  @Input() template: TemplateInfo | null = null;
  @Input() parameters: TemplateParameter[] = [];
  @Input() phoneNumber: string = '';
  @Input() languageCode: string = 'es';

  @Output() send = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  previewMode = signal<'mobile' | 'desktop'>('mobile');
  showRawData = signal(false);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {}

  ngOnInit(): void {}

  get renderedContent(): string {
    if (!this.template) {
      return 'Seleccione una plantilla para ver la vista previa';
    }

    const bodyComponent = this.template.components.find(c => c.type === 'BODY');
    if (!bodyComponent) {
      return 'No hay contenido disponible';
    }

    let content = bodyComponent.text;

    // Reemplazar placeholders con valores de parámetros
    this.parameters.forEach((param, index) => {
      const placeholder = `{{${index + 1}}}`;
      let replacement = '';

      switch (param.type) {
        case 'text':
          replacement = param.text || '';
          break;
        case 'currency':
          if (param.currency) {
            const amount = param.currency.amount_1000 / 1000;
            replacement = `${param.currency.code} ${amount.toFixed(2)}`;
          }
          break;
        case 'date_time':
          if (param.date_time) {
            replacement = param.date_time.fallback_value || 'Fecha no especificada';
          }
          break;
        case 'image':
          replacement = param.image?.link ? '[Imagen]' : '';
          break;
        case 'document':
          replacement = param.document?.link ? '[Documento]' : '';
          break;
        case 'video':
          replacement = param.video?.link ? '[Video]' : '';
          break;
        case 'location':
          if (param.location) {
            replacement = param.location.name || 'Ubicación';
          }
          break;
      }

      content = content.replace(new RegExp(placeholder, 'g'), replacement || placeholder);
    });

    return content;
  }

  get headerContent(): string {
    if (!this.template) return '';
    const header = this.template.components.find(c => c.type === 'HEADER');
    return header ? header.text : '';
  }

  get footerContent(): string {
    if (!this.template) return '';
    const footer = this.template.components.find(c => c.type === 'FOOTER');
    return footer ? footer.text : '';
  }

  get hasMedia(): boolean {
    return this.parameters.some(p => 
      p.type === 'image' || p.type === 'document' || p.type === 'video' || p.type === 'location'
    );
  }

  get mediaItems() {
    return this.parameters.filter(p => 
      p.type === 'image' || p.type === 'document' || p.type === 'video' || p.type === 'location'
    );
  }

  get templateName(): string {
    return this.template ? this.template.name : 'Sin plantilla';
  }

  get statusBadgeClass(): string {
    if (!this.template) return 'bg-gray-100 text-gray-800';
    
    switch (this.template.status) {
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

  get parameterCount(): number {
    return this.parameters.length;
  }

  get isReadyToSend(): boolean {
    return !!(this.template && this.phoneNumber && this.parameters.every(p => {
      switch (p.type) {
        case 'text':
          return !!p.text;
        case 'currency':
          return !!(p.currency && p.currency.code && p.currency.amount_1000 !== undefined);
        case 'date_time':
          return !!(p.date_time && p.date_time.fallback_value);
        case 'image':
        case 'document':
        case 'video':
          const media = p[p.type];
          return !!(media && media.link);
        case 'location':
          return !!(p.location && p.location.latitude !== undefined && p.location.longitude !== undefined);
        default:
          return false;
      }
    }));
  }

  togglePreviewMode(): void {
    this.previewMode.set(this.previewMode() === 'mobile' ? 'desktop' : 'mobile');
  }

  toggleRawData(): void {
    this.showRawData.set(!this.showRawData());
  }

  onSend(): void {
    if (this.isReadyToSend) {
      this.send.emit();
    }
  }

  onEdit(): void {
    this.edit.emit();
  }

  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    // Formato internacional básico
    return phone.replace(/(\d{1,3})(\d{1,3})(\d{1,4})(\d{1,4})/, '+$1 $2 $3 $4').trim();
  }

  getRawData(): string {
    return JSON.stringify({
      template: this.template,
      parameters: this.parameters,
      phoneNumber: this.phoneNumber,
      languageCode: this.languageCode
    }, null, 2);
  }

  trackByFn(index: number): number {
    return index;
  }
}