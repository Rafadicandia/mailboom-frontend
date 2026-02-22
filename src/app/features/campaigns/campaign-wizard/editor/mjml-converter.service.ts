import { Injectable } from '@angular/core';
import { 
  EmailBlockNode, 
  EmailDocument, 
  EmailBlockType,
  ButtonConfig,
  ImageConfig,
  DividerConfig,
  SocialConfig,
  ColumnsConfig,
  HeaderConfig,
  FooterConfig,
  SpacerConfig,
  TextStyleConfig,
  SocialNetwork
} from './email-block.model';

/**
 * Servicio para convertir el JSON del editor TipTap a código MJML
 * MJML es un lenguaje de marcado que simplifica la creación de emails responsive
 */
@Injectable({
  providedIn: 'root'
})
export class MjmlConverterService {

  /**
   * Convierte un documento de email completo a MJML
   */
  convertToMjml(document: EmailDocument): string {
    const lines: string[] = [];
    
    // Abrir documento MJML
    lines.push('<mjml>');
    lines.push('<head>');
    lines.push('<mj-title>Email</mj-title>');
    
    // Agregar fuentes web si se usan
    if (document.globalStyles.fontFamily?.includes('Roboto')) {
      lines.push(`<mj-fonts>
        <mj-font name="Roboto" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" />
      </mj-fonts>`);
    }
    
    // Agregar estilos globales
    lines.push(`<mj-attributes>
      <mj-all font-family="${document.globalStyles.fontFamily || 'Arial, sans-serif'}" />
      <mj-text color="#333333" line-height="1.5" />
      <mj-button background-color="#4F46E5" color="#ffffff" />
    </mj-attributes>`);
    
    // Preheader si existe
    if (document.globalStyles.preheaderText) {
      lines.push(`<mj-preview>${this.escapeHtml(document.globalStyles.preheaderText)}</mj-preview>`);
    }
    
    lines.push('</head>');
    
    // Body con color de fondo
    lines.push(`<mj-body background-color="${document.globalStyles.backgroundColor || '#f5f5f5'}">`);
    
    // Container principal
    lines.push(`<mj-container max-width="${document.globalStyles.maxWidth || 600}px" background-color="#ffffff">`);
    
    // Header si existe
    if (document.header) {
      lines.push(this.convertBlockToMjml(document.header));
    }
    
    // Contenido principal
    for (const block of document.content) {
      lines.push(this.convertBlockToMjml(block));
    }
    
    // Footer si existe
    if (document.footer) {
      lines.push(this.convertBlockToMjml(document.footer));
    }
    
    lines.push('</mj-container>');
    lines.push('</mj-body>');
    lines.push('</mjml>');
    
    return lines.join('\n');
  }

  /**
   * Convierte un bloque individual a MJML
   */
  convertBlockToMjml(block: EmailBlockNode): string {
    switch (block.type) {
      case 'paragraph':
        return this.convertParagraph(block);
      case 'heading1':
        return this.convertHeading(block, 1);
      case 'heading2':
        return this.convertHeading(block, 2);
      case 'heading3':
        return this.convertHeading(block, 3);
      case 'bulletList':
        return this.convertList(block, 'bullet');
      case 'orderedList':
        return this.convertList(block, 'ordered');
      case 'quote':
        return this.convertQuote(block);
      case 'button':
        return this.convertButton(block);
      case 'image':
        return this.convertImage(block);
      case 'divider':
        return this.convertDivider(block);
      case 'social':
        return this.convertSocial(block);
      case 'columns':
        return this.convertColumns(block);
      case 'header':
        return this.convertHeader(block);
      case 'footer':
        return this.convertFooter(block);
      case 'spacer':
        return this.convertSpacer(block);
      default:
        return `<!-- Unknown block type: ${block.type} -->`;
    }
  }

  /**
   * Convierte un párrafo
   */
  private convertParagraph(block: EmailBlockNode): string {
    const style = this.getTextStyle(block.attrs?.textStyle);
    const content = block.textContent || '';
    
    return `<mj-text${style}>${this.processInlineContent(content)}</mj-text>`;
  }

  /**
   * Convierte un heading
   */
  private convertHeading(block: EmailBlockNode, level: 1 | 2 | 3): string {
    const sizes = { 1: '32px', 2: '24px', 3: '20px' };
    const weights: Record<1 | 2 | 3, 'bold' | '600'> = { 1: 'bold', 2: 'bold', 3: '600' };
    
    const textStyle = block.attrs?.textStyle || {};
    const style = this.getTextStyle({
      ...textStyle,
      fontSize: textStyle.fontSize || sizes[level],
      fontWeight: weights[level]
    });
    
    const content = block.textContent || '';
    const tag = `h${level}`;
    
    return `<mj-text${style}><${tag}>${this.processInlineContent(content)}</${tag}></mj-text>`;
  }

  /**
   * Convierte una lista
   */
  private convertList(block: EmailBlockNode, type: 'bullet' | 'ordered'): string {
    const style = this.getTextStyle(block.attrs?.textStyle);
    const items = block.content || [];
    
    const listItems = items.map(item => 
      `<li>${this.processInlineContent(item.textContent || '')}</li>`
    ).join('');
    
    const tag = type === 'ordered' ? 'ol' : 'ul';
    
    return `<mj-text${style}><${tag}>${listItems}</${tag}></mj-text>`;
  }

  /**
   * Convierte una cita
   */
  private convertQuote(block: EmailBlockNode): string {
    const style = this.getTextStyle({
      ...block.attrs?.textStyle,
      fontStyle: 'italic',
      color: block.attrs?.textStyle?.color || '#666666'
    });
    
    const content = block.textContent || '';
    
    return `<mj-text${style}><blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 16px 0;">${this.processInlineContent(content)}</blockquote></mj-text>`;
  }

  /**
   * Convierte un botón CTA
   */
  private convertButton(block: EmailBlockNode): string {
    const config: ButtonConfig = block.attrs?.button || {
      text: 'Click aquí',
      url: '#',
      backgroundColor: '#4F46E5',
      textColor: '#ffffff',
      borderRadius: 8,
      width: 'auto',
      align: 'center'
    };
    
    const attrs: string[] = [
      `href="${config.url || '#'}"`,
      `background-color="${config.backgroundColor || '#4F46E5'}"`,
      `color="${config.textColor || '#ffffff'}"`,
      `border-radius="${config.borderRadius || 8}px"`,
      `align="${config.align || 'center'}"`,
      `padding="${config.padding || '16px 32px'}"`
    ];
    
    if (config.width === 'full') {
      attrs.push('width="100%"');
    }
    
    return `<mj-button ${attrs.join(' ')}>${config.text}</mj-button>`;
  }

  /**
   * Convierte una imagen
   */
  private convertImage(block: EmailBlockNode): string {
    const config: ImageConfig = block.attrs?.image || {
      src: '',
      alt: '',
      align: 'center'
    };
    
    if (!config.src) {
      return '<!-- Image block without src -->';
    }
    
    const attrs: string[] = [
      `src="${config.src}"`,
      `alt="${config.alt || ''}"`,
      `align="${config.align || 'center'}"`
    ];
    
    if (config.width) attrs.push(`width="${config.width}"`);
    if (config.height) attrs.push(`height="${config.height}"`);
    if (config.padding) attrs.push(`padding="${config.padding}"`);
    
    // Si tiene link, envolver en mj-image con href
    if (config.link) {
      attrs.push(`href="${config.link}"`);
    }
    
    return `<mj-image ${attrs.join(' ')} />`;
  }

  /**
   * Convierte un divisor
   */
  private convertDivider(block: EmailBlockNode): string {
    const config: DividerConfig = block.attrs?.divider || {
      color: '#e5e7eb',
      width: '100%',
      style: 'solid'
    };
    
    const attrs: string[] = [
      `border-color="${config.color || '#e5e7eb'}"`,
      `border-width="1px"`,
      `border-style="${config.style || 'solid'}"`
    ];
    
    if (config.padding) {
      attrs.push(`padding="${config.padding}"`);
    }
    
    return `<mj-divider ${attrs.join(' ')} />`;
  }

  /**
   * Convierte iconos de redes sociales
   */
  private convertSocial(block: EmailBlockNode): string {
    const config: SocialConfig = block.attrs?.social || {
      icons: [],
      align: 'center'
    };
    
    if (config.icons.length === 0) {
      return '<!-- Social block without icons -->';
    }
    
    const socialElements = config.icons.map(icon => {
      const networkMap: Record<SocialNetwork, string> = {
        facebook: 'facebook',
        twitter: 'twitter',
        instagram: 'instagram',
        linkedin: 'linkedin',
        youtube: 'youtube',
        tiktok: 'tiktok',
        pinterest: 'pinterest'
      };
      
      const attrs: string[] = [
        `name="${networkMap[icon.network] || icon.network}"`,
        `href="${icon.url || '#'}"`
      ];
      
      if (icon.iconSize) attrs.push(`icon-size="${icon.iconSize}px"`);
      if (icon.iconColor) attrs.push(`icon-color="${icon.iconColor}"`);
      
      return `<mj-social-element ${attrs.join(' ')} />`;
    }).join('\n    ');
    
    return `<mj-social align="${config.align || 'center'}" padding="${config.padding || '16px 0'}">
    ${socialElements}
  </mj-social>`;
  }

  /**
   * Convierte un layout de columnas
   */
  private convertColumns(block: EmailBlockNode): string {
    const config: ColumnsConfig = block.attrs?.columns || {
      columns: []
    };
    
    if (config.columns.length === 0) {
      return '<!-- Columns block without columns -->';
    }
    
    const sectionAttrs: string[] = [];
    if (config.backgroundColor) sectionAttrs.push(`background-color="${config.backgroundColor}"`);
    if (config.padding) sectionAttrs.push(`padding="${config.padding}"`);
    
    const columnsMjml = config.columns.map(column => {
      const colAttrs: string[] = [`width="${column.width}"`];
      if (column.backgroundColor) colAttrs.push(`background-color="${column.backgroundColor}"`);
      if (column.padding) colAttrs.push(`padding="${column.padding}"`);
      
      const columnContent = column.content.map(childBlock => 
        this.convertBlockToMjml(childBlock)
      ).join('\n      ');
      
      return `<mj-column ${colAttrs.join(' ')}>
      ${columnContent}
    </mj-column>`;
    }).join('\n    ');
    
    return `<mj-section ${sectionAttrs.join(' ')}>
    ${columnsMjml}
  </mj-section>`;
  }

  /**
   * Convierte el header del email
   */
  private convertHeader(block: EmailBlockNode): string {
    const config: HeaderConfig = block.attrs?.header || {
      backgroundColor: '#ffffff',
      align: 'center',
      padding: '20px'
    };
    
    const sectionAttrs: string[] = [
      `background-color="${config.backgroundColor || '#ffffff'}"`,
      `padding="${config.padding || '20px'}"`
    ];
    
    let content = '';
    
    if (config.useImage && config.logoUrl) {
      content = `<mj-image src="${config.logoUrl}" align="${config.align || 'center'}" width="${config.logoWidth || '200px'}" />`;
    } else if (config.text) {
      content = `<mj-text align="${config.align || 'center'}" font-size="24px" font-weight="bold" color="${config.textColor || '#333333'}">${config.text}</mj-text>`;
    }
    
    return `<mj-section ${sectionAttrs.join(' ')}>
    <mj-column>
      ${content}
    </mj-column>
  </mj-section>`;
  }

  /**
   * Convierte el footer del email
   */
  private convertFooter(block: EmailBlockNode): string {
    const config: FooterConfig = block.attrs?.footer || {
      backgroundColor: '#f3f4f6',
      textColor: '#6b7280',
      align: 'center',
      padding: '30px'
    };
    
    const sectionAttrs: string[] = [
      `background-color="${config.backgroundColor || '#f3f4f6'}"`,
      `padding="${config.padding || '30px'}"`
    ];
    
    const content: string[] = [];
    
    if (config.companyName) {
      content.push(`<mj-text align="${config.align || 'center'}" font-weight="bold" color="${config.textColor || '#6b7280'}">${config.companyName}</mj-text>`);
    }
    
    if (config.address) {
      content.push(`<mj-text align="${config.align || 'center'}" font-size="12px" color="${config.textColor || '#6b7280'}">${config.address}</mj-text>`);
    }
    
    if (config.phone || config.email) {
      const contact = [config.phone, config.email].filter(Boolean).join(' | ');
      content.push(`<mj-text align="${config.align || 'center'}" font-size="12px" color="${config.textColor || '#6b7280'}">${contact}</mj-text>`);
    }
    
    if (config.website) {
      content.push(`<mj-text align="${config.align || 'center'}" font-size="12px"><a href="${config.website}" style="color: ${config.textColor || '#6b7280'};">${config.website}</a></mj-text>`);
    }
    
    // Redes sociales en el footer
    if (config.socialLinks && Object.keys(config.socialLinks).length > 0) {
      const socialIcons = Object.entries(config.socialLinks)
        .filter(([_, url]) => url)
        .map(([network, url]) => 
          `<mj-social-element name="${network}" href="${url}" />`
        ).join('\n        ');
      
      content.push(`<mj-social align="${config.align || 'center'}">
        ${socialIcons}
      </mj-social>`);
    }
    
    // Enlace de baja
    if (config.showUnsubscribe) {
      content.push(`<mj-text align="${config.align || 'center'}" font-size="12px" padding-top="20px">
        <a href="{{unsubscribe_link}}" style="color: ${config.textColor || '#6b7280'};">${config.unsubscribeText || 'Darse de baja'}</a>
      </mj-text>`);
    }
    
    // Powered by
    content.push(`<mj-text align="${config.align || 'center'}" font-size="11px" color="${config.textColor || '#6b7280'}" padding-top="10px">
      Enviado con <strong>MailBoom</strong>
    </mj-text>`);
    
    return `<mj-section ${sectionAttrs.join(' ')}>
    <mj-column>
      ${content.join('\n      ')}
    </mj-column>
  </mj-section>`;
  }

  /**
   * Convierte un espaciador
   */
  private convertSpacer(block: EmailBlockNode): string {
    const config: SpacerConfig = block.attrs?.spacer || {
      height: '20px'
    };
    
    const attrs: string[] = [`height="${config.height}"`];
    if (config.backgroundColor) attrs.push(`background-color="${config.backgroundColor}"`);
    
    return `<mj-spacer ${attrs.join(' ')} />`;
  }

  /**
   * Genera atributos de estilo para mj-text
   */
  private getTextStyle(style?: TextStyleConfig): string {
    if (!style) return '';
    
    const attrs: string[] = [];
    
    if (style.fontFamily) attrs.push(`font-family="${style.fontFamily}"`);
    if (style.fontSize) attrs.push(`font-size="${style.fontSize}"`);
    if (style.color) attrs.push(`color="${style.color}"`);
    if (style.backgroundColor) attrs.push(`background-color="${style.backgroundColor}"`);
    if (style.textAlign) attrs.push(`align="${style.textAlign}"`);
    if (style.lineHeight) attrs.push(`line-height="${style.lineHeight}"`);
    if (style.letterSpacing) attrs.push(`letter-spacing="${style.letterSpacing}"`);
    
    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
  }

  /**
   * Procesa contenido inline (negritas, cursivas, enlaces)
   */
  private processInlineContent(content: string): string {
    if (!content) return '';
    
    // El contenido ya debería venir con el HTML inline desde TipTap
    // Solo necesitamos escapar caracteres especiales si es necesario
    return content;
  }

  /**
   * Escapa caracteres HTML especiales
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Convierte el JSON de TipTap a EmailDocument
   */
  convertTipTapJsonToEmailDocument(tiptapJson: any, globalStyles?: Partial<EmailDocument['globalStyles']>): EmailDocument {
    const document: EmailDocument = {
      version: '1.0',
      globalStyles: {
        backgroundColor: globalStyles?.backgroundColor || '#f5f5f5',
        fontFamily: globalStyles?.fontFamily || 'Arial, sans-serif',
        maxWidth: globalStyles?.maxWidth || 600,
        preheaderText: globalStyles?.preheaderText
      },
      content: []
    };
    
    if (!tiptapJson?.content) return document;
    
    for (const node of tiptapJson.content) {
      const block = this.convertTipTapNodeToBlock(node);
      if (block) {
        // Clasificar header y footer
        if (block.type === 'header') {
          document.header = block;
        } else if (block.type === 'footer') {
          document.footer = block;
        } else {
          document.content.push(block);
        }
      }
    }
    
    return document;
  }

  /**
   * Convierte un nodo de TipTap a EmailBlockNode
   */
  private convertTipTapNodeToBlock(node: any): EmailBlockNode | null {
    if (!node) return null;
    
    const typeMap: Record<string, EmailBlockType> = {
      'paragraph': 'paragraph',
      'heading': 'heading1', // Se ajustará según el nivel
      'bulletList': 'bulletList',
      'orderedList': 'orderedList',
      'blockquote': 'quote',
      'image': 'image',
      'horizontalRule': 'divider',
      'buttonNode': 'button',
      'socialNode': 'social',
      'columnsNode': 'columns',
      'headerNode': 'header',
      'footerNode': 'footer',
      'spacerNode': 'spacer'
    };
    
    let type: EmailBlockType = typeMap[node.type] || 'paragraph';
    
    // Ajustar tipo de heading según nivel
    if (node.type === 'heading') {
      const level = node.attrs?.level || 1;
      type = `heading${level}` as EmailBlockType;
    }
    
    const block: EmailBlockNode = {
      id: node.attrs?.id || this.generateId(),
      type,
      attrs: node.attrs || {},
      textContent: this.extractTextContent(node)
    };
    
    // Procesar contenido hijo
    if (node.content && Array.isArray(node.content)) {
      block.content = node.content
        .map((child: any) => this.convertTipTapNodeToBlock(child))
        .filter((b: EmailBlockNode | null): b is EmailBlockNode => b !== null);
    }
    
    return block;
  }

  /**
   * Extrae el contenido de texto de un nodo
   */
  private extractTextContent(node: any): string {
    if (!node) return '';
    
    if (node.type === 'text') {
      return node.text || '';
    }
    
    if (node.content && Array.isArray(node.content)) {
      return node.content.map((child: any) => this.extractTextContent(child)).join('');
    }
    
    return '';
  }

  /**
   * Genera un ID único para un bloque
   */
  private generateId(): string {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convierte MJML a HTML (conversión simplificada para el frontend)
   * Esta es una conversión básica que funciona para los elementos más comunes
   * Para una conversión completa, se recomienda usar el backend con el paquete mjml de Node.js
   */
  convertMjmlToHtml(mjml: string): string {
    if (!mjml || mjml.trim().length === 0) {
      return '';
    }

    let html = mjml;

    // Convertir estructura MJML a HTML
    html = html.replace(/<mjml>/g, '<!DOCTYPE html><html>');
    html = html.replace(/<\/mjml>/g, '</html>');
    
    // Head
    html = html.replace(/<head>/g, '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">');
    
    // Body
    html = html.replace(/<mj-body([^>]*)>/g, '<body$1>');
    html = html.replace(/<\/mj-body>/g, '</body>');
    
    // Container
    html = html.replace(/<mj-container([^>]*)>/g, '<div class="email-container"$1>');
    html = html.replace(/<\/mj-container>/g, '</div>');
    
    // Section
    html = html.replace(/<mj-section([^>]*)>/g, '<div class="email-section"$1>');
    html = html.replace(/<\/mj-section>/g, '</div>');
    
    // Column
    html = html.replace(/<mj-column([^>]*)>/g, '<div class="email-column"$1>');
    html = html.replace(/<\/mj-column>/g, '</div>');
    
    // Text
    html = html.replace(/<mj-text([^>]*)>/g, '<p$1>');
    html = html.replace(/<\/mj-text>/g, '</p>');
    
    // Button
    html = html.replace(/<mj-button\s+([^>]*)>([^<]*)<\/mj-button>/g, (match, attrs, text) => {
      const href = attrs.match(/href="([^"]*)"/)?.[1] || '#';
      const bgColor = attrs.match(/background-color="([^"]*)"/)?.[1] || '#4F46E5';
      const color = attrs.match(/color="([^"]*)"/)?.[1] || '#ffffff';
      const borderRadius = attrs.match(/border-radius="([^"]*)"/)?.[1] || '8px';
      const padding = attrs.match(/padding="([^"]*)"/)?.[1] || '16px 32px';
      const align = attrs.match(/align="([^"]*)"/)?.[1] || 'center';
      
      return `<div style="text-align: ${align}; margin: 16px 0;"><a href="${href}" style="display: inline-block; padding: ${padding}; background-color: ${bgColor}; color: ${color}; border-radius: ${borderRadius}; text-decoration: none; font-weight: 600;">${text}</a></div>`;
    });
    
    // Image
    html = html.replace(/<mj-image\s+([^>]*)\s*\/>/g, (match, attrs) => {
      const src = attrs.match(/src="([^"]*)"/)?.[1] || '';
      const alt = attrs.match(/alt="([^"]*)"/)?.[1] || '';
      const width = attrs.match(/width="([^"]*)"/)?.[1] || '100%';
      const align = attrs.match(/align="([^"]*)"/)?.[1] || 'center';
      const href = attrs.match(/href="([^"]*)"/)?.[1];
      
      const img = `<img src="${src}" alt="${alt}" style="max-width: 100%; width: ${width}; height: auto;" />`;
      
      if (href) {
        return `<div style="text-align: ${align};"><a href="${href}">${img}</a></div>`;
      }
      return `<div style="text-align: ${align};">${img}</div>`;
    });
    
    // Divider
    html = html.replace(/<mj-divider\s+([^>]*)\s*\/>/g, (match, attrs) => {
      const color = attrs.match(/border-color="([^"]*)"/)?.[1] || '#e5e7eb';
      const width = attrs.match(/border-width="([^"]*)"/)?.[1] || '1px';
      const style = attrs.match(/border-style="([^"]*)"/)?.[1] || 'solid';
      const padding = attrs.match(/padding="([^"]*)"/)?.[1] || '20px 0';
      
      return `<div style="padding: ${padding};"><hr style="border: none; border-top: ${width} ${style} ${color}; margin: 0;" /></div>`;
    });
    
    // Spacer
    html = html.replace(/<mj-spacer\s+([^>]*)\s*\/>/g, (match, attrs) => {
      const height = attrs.match(/height="([^"]*)"/)?.[1] || '20px';
      const bgColor = attrs.match(/background-color="([^"]*)"/)?.[1] || 'transparent';
      
      return `<div style="height: ${height}; background-color: ${bgColor};"></div>`;
    });
    
    // Social
    html = html.replace(/<mj-social\s+([^>]*)>([\s\S]*?)<\/mj-social>/g, (match, attrs, content) => {
      const align = attrs.match(/align="([^"]*)"/)?.[1] || 'center';
      const padding = attrs.match(/padding="([^"]*)"/)?.[1] || '16px 0';
      
      // Convert social elements
      const socialLinks = content.replace(/<mj-social-element\s+([^>]*)\s*\/>/g, (m, a) => {
        const name = a.match(/name="([^"]*)"/)?.[1] || '';
        const href = a.match(/href="([^"]*)"/)?.[1] || '#';
        const iconSize = a.match(/icon-size="([^"]*)"/)?.[1] || '32px';
        
        // Map social networks to icons (simplified)
        const icons: Record<string, string> = {
          facebook: '📘',
          twitter: '🐦',
          instagram: '📷',
          linkedin: '💼',
          youtube: '📺',
          tiktok: '🎵',
          pinterest: '📌'
        };
        
        return `<a href="${href}" style="display: inline-block; margin: 0 8px; font-size: ${iconSize}; text-decoration: none;">${icons[name] || '🔗'}</a>`;
      });
      
      return `<div style="text-align: ${align}; padding: ${padding};">${socialLinks}</div>`;
    });
    
    // Attributes (remove)
    html = html.replace(/<mj-attributes>[\s\S]*?<\/mj-attributes>/g, '');
    
    // Preview (remove)
    html = html.replace(/<mj-preview>[\s\S]*?<\/mj-preview>/g, '');
    
    // Fonts (remove)
    html = html.replace(/<mj-fonts>[\s\S]*?<\/mj-fonts>/g, '');
    
    // Title (remove)
    html = html.replace(/<mj-title>[\s\S]*?<\/mj-title>/g, '');
    
    // Add basic styles
    const styleBlock = `
    <style>
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      .email-container { max-width: 600px; margin: 0 auto; }
      .email-section { padding: 20px; }
      .email-column { display: inline-block; vertical-align: top; }
      img { max-width: 100%; height: auto; }
      a { color: #4f46e5; }
    </style>`;
    
    html = html.replace('</head>', styleBlock + '</head>');
    
    return html;
  }
}
