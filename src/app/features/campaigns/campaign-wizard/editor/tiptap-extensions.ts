import { Node, mergeAttributes } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';

// URLs de iconos de redes sociales
const SOCIAL_ICON_URLS: Record<string, string> = {
  facebook: 'https://cdn-icons-png.flaticon.com/512/733/733547.png',
  twitter: 'https://cdn-icons-png.flaticon.com/512/733/733579.png',
  instagram: 'https://cdn-icons-png.flaticon.com/512/733/733558.png',
  linkedin: 'https://cdn-icons-png.flaticon.com/512/733/733561.png',
  youtube: 'https://cdn-icons-png.flaticon.com/512/733/733590.png',
  tiktok: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
  pinterest: 'https://cdn-icons-png.flaticon.com/512/733/733547.png'
};

/**
 * Extensión TipTap para botones CTA
 */
export const ButtonNode = Node.create({
  name: 'buttonNode',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      text: { default: 'Click aquí' },
      url: { default: '#' },
      backgroundColor: { default: '#4F46E5' },
      textColor: { default: '#ffffff' },
      borderRadius: { default: 8 },
      width: { default: 'auto' },
      align: { default: 'center' }
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="button-node"]' }];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as Record<string, any>;
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'button-node',
        class: 'email-button-wrapper',
        style: `text-align: ${attrs['align']}; padding: 16px 0;`
      }),
      [
        'a',
        {
          href: attrs['url'] || '#',
          style: `display: inline-block; padding: 16px 32px; background-color: ${attrs['backgroundColor']}; color: ${attrs['textColor']}; text-decoration: none; border-radius: ${attrs['borderRadius']}px; font-weight: bold; font-size: 16px; ${attrs['width'] === 'full' ? 'width: 100%; box-sizing: border-box;' : ''}`
        },
        attrs['text'] || 'Click aquí'
      ]
    ];
  }
});

/**
 * Extensión TipTap para imágenes de email
 */
export const ImageNode = Node.create({
  name: 'imageNode',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
      link: { default: '' },
      width: { default: '100%' },
      height: { default: 'auto' },
      align: { default: 'center' }
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="image-node"]' }];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as Record<string, any>;
    const imgAttrs = {
      src: attrs['src'] || '',
      alt: attrs['alt'] || '',
      style: `max-width: 100%; height: auto; width: ${attrs['width']};`
    };
    
    if (attrs['link']) {
      return [
        'div',
        mergeAttributes(HTMLAttributes, {
          'data-type': 'image-node',
          style: `text-align: ${attrs['align']}; padding: 16px 0;`
        }),
        ['a', { href: attrs['link'] }, ['img', imgAttrs]]
      ];
    }
    
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'image-node',
        style: `text-align: ${attrs['align']}; padding: 16px 0;`
      }),
      ['img', imgAttrs]
    ];
  }
});

/**
 * Extensión TipTap para divisores
 */
export const DividerNode = Node.create({
  name: 'dividerNode',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      color: { default: '#e5e7eb' },
      width: { default: '100%' },
      style: { default: 'solid' },
      padding: { default: '20px 0' }
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="divider-node"]' }];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as Record<string, any>;
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'divider-node',
        style: `padding: ${attrs['padding']};`
      }),
      [
        'hr',
        {
          style: `border: none; border-top: 2px ${attrs['style']} ${attrs['color']}; width: ${attrs['width']}; margin: 0;`
        }
      ]
    ];
  }
});

/**
 * Extensión TipTap para iconos de redes sociales
 */
export const SocialNode = Node.create({
  name: 'socialNode',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      icons: { default: '[]' },
      align: { default: 'center' },
      iconSize: { default: 32 },
      iconSpacing: { default: '16px' }
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="social-node"]' }];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as Record<string, any>;
    let icons: any[] = [];
    try {
      icons = JSON.parse(attrs['icons'] || '[]');
    } catch {
      icons = [];
    }
    
    const iconElements = icons.map((icon: any) => {
      const iconUrl = SOCIAL_ICON_URLS[icon.network] || SOCIAL_ICON_URLS['facebook'];
      return [
        'a',
        {
          href: icon.url || '#',
          style: `display: inline-block; margin: 0 ${attrs['iconSpacing']}; text-decoration: none;`
        },
        [
          'img',
          {
            src: iconUrl,
            alt: icon.network,
            style: `width: ${attrs['iconSize']}px; height: ${attrs['iconSize']}px;`
          }
        ]
      ];
    });
    
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'social-node',
        style: `text-align: ${attrs['align']}; padding: 16px 0;`
      }),
      ...iconElements
    ];
  }
});

/**
 * Extensión TipTap para layout de columnas
 */
export const ColumnsNode = Node.create({
  name: 'columnsNode',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      columns: { default: '[]' },
      gap: { default: '20px' },
      backgroundColor: { default: 'transparent' }
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="columns-node"]' }];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as Record<string, any>;
    let columns: any[] = [];
    try {
      columns = JSON.parse(attrs['columns'] || '[]');
    } catch {
      columns = [];
    }
    
    const columnElements = columns.map((column: any) => {
      return [
        'div',
        {
          style: `display: table-cell; width: ${column.width}; vertical-align: top; padding: 0 ${attrs['gap']}; background-color: ${column.backgroundColor || 'transparent'};`
        },
        column.content || ''
      ];
    });
    
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'columns-node',
        style: `display: table; width: 100%; background-color: ${attrs['backgroundColor']};`
      }),
      ...columnElements
    ];
  }
});

/**
 * Extensión TipTap para header de email
 */
export const HeaderNode = Node.create({
  name: 'headerNode',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      useImage: { default: false },
      logoUrl: { default: '' },
      logoWidth: { default: '200px' },
      text: { default: '' },
      backgroundColor: { default: '#ffffff' },
      textColor: { default: '#333333' },
      align: { default: 'center' },
      padding: { default: '20px' }
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="header-node"]' }];
  },
  
  addNodeView() {
    return ({ node, HTMLAttributes }: any) => {
      const attrs = node.attrs as Record<string, any>;
      const dom = document.createElement('div');
      dom.setAttribute('data-type', 'header-node');
      dom.style.cssText = `text-align: ${attrs['align']}; padding: ${attrs['padding']}; background-color: ${attrs['backgroundColor']}; min-height: 60px; display: flex; align-items: center; justify-content: center; cursor: pointer;`;
      
      // Aplicar atributos de TipTap
      Object.entries(mergeAttributes(HTMLAttributes, {})).forEach(([key, value]) => {
        if (key !== 'style' && key !== 'data-type' && typeof value === 'string') {
          dom.setAttribute(key, value);
        }
      });
      
      let content = '';
      if (attrs['useImage'] && attrs['logoUrl']) {
        content = `<img src="${attrs['logoUrl']}" style="max-width: ${attrs['logoWidth']}; height: auto;" alt="Logo" />`;
      } else if (attrs['text']) {
        content = `<span style="font-size: 24px; font-weight: bold; color: ${attrs['textColor']};">${attrs['text']}</span>`;
      } else {
        content = `<span style="font-size: 16px; color: #9ca3af; font-style: italic;">✚ Haz clic para configurar el header</span>`;
      }
      
      dom.innerHTML = content;
      
      return { dom };
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as Record<string, any>;
    let content = '';
    
    if (attrs['useImage'] && attrs['logoUrl']) {
      content = `<img src="${attrs['logoUrl']}" style="max-width: ${attrs['logoWidth']}; height: auto;" alt="Logo" />`;
    } else if (attrs['text']) {
      content = `<span style="font-size: 24px; font-weight: bold; color: ${attrs['textColor']};">${attrs['text']}</span>`;
    } else {
      content = `<span style="font-size: 16px; color: #9ca3af; font-style: italic;">✚ Haz clic para configurar el header</span>`;
    }
    
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'header-node',
        style: `text-align: ${attrs['align']}; padding: ${attrs['padding']}; background-color: ${attrs['backgroundColor']}; min-height: 60px; display: flex; align-items: center; justify-content: center;`
      }),
      content
    ];
  }
});

/**
 * Extensión TipTap para footer de email
 */
export const FooterNode = Node.create({
  name: 'footerNode',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      companyName: { default: '' },
      address: { default: '' },
      phone: { default: '' },
      email: { default: '' },
      website: { default: '' },
      showUnsubscribe: { default: true },
      backgroundColor: { default: '#f3f4f6' },
      textColor: { default: '#6b7280' },
      align: { default: 'center' },
      padding: { default: '30px' }
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="footer-node"]' }];
  },
  
  addNodeView() {
    return ({ node, HTMLAttributes }: any) => {
      const attrs = node.attrs as Record<string, any>;
      const dom = document.createElement('div');
      dom.setAttribute('data-type', 'footer-node');
      dom.style.cssText = `text-align: ${attrs['align']}; padding: ${attrs['padding']}; background-color: ${attrs['backgroundColor']}; color: ${attrs['textColor']}; border-top: 1px solid #e5e7eb; cursor: pointer;`;
      
      const content: string[] = [];
      
      if (attrs['companyName']) {
        content.push(`<p style="font-weight: bold; margin: 0 0 8px 0;">${attrs['companyName']}</p>`);
      }
      
      if (attrs['address']) {
        content.push(`<p style="font-size: 12px; margin: 0 0 4px 0;">${attrs['address']}</p>`);
      }
      
      // Only show email if it contains '@' to avoid showing invalid values like 'email'
      const hasValidEmail = attrs['email'] && attrs['email'].includes('@');
      if (attrs['phone'] || hasValidEmail) {
        const phone = attrs['phone'] || '';
        const email = hasValidEmail ? attrs['email'] : '';
        const contact = [phone, email].filter(Boolean).join(' | ');
        content.push(`<p style="font-size: 12px; margin: 0 0 4px 0;">${contact}</p>`);
      }
      
      if (attrs['website']) {
        content.push(`<p style="font-size: 12px; margin: 0 0 8px 0;"><a href="${attrs['website']}" style="color: ${attrs['textColor']};">${attrs['website']}</a></p>`);
      }
      
      if (attrs['showUnsubscribe']) {
        content.push(`<p style="font-size: 12px; margin: 16px 0 0 0;"><a href="{{unsubscribe_link}}" style="color: ${attrs['textColor']};">Darse de baja</a></p>`);
      }
      
      content.push(`<p style="font-size: 11px; margin: 16px 0 0 0; opacity: 0.7;">Enviado con <strong>MailBoom</strong></p>`);
      
      if (content.length === 1) {
        // Solo tiene el "Enviado con MailBoom", mostrar placeholder
        content.unshift(`<p style="font-size: 14px; color: #9ca3af; font-style: italic; margin: 0 0 8px 0;">✚ Haz clic para configurar el footer</p>`);
      }
      
      dom.innerHTML = content.join('');
      
      return { dom };
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as Record<string, any>;
    const content: string[] = [];
    
    if (attrs['companyName']) {
      content.push(`<p style="font-weight: bold; margin: 0 0 8px 0;">${attrs['companyName']}</p>`);
    }
    
    if (attrs['address']) {
      content.push(`<p style="font-size: 12px; margin: 0 0 4px 0;">${attrs['address']}</p>`);
    }
    
    if (attrs['phone'] || attrs['email']) {
      const contact = [attrs['phone'], attrs['email']].filter(Boolean).join(' | ');
      content.push(`<p style="font-size: 12px; margin: 0 0 4px 0;">${contact}</p>`);
    }
    
    if (attrs['website']) {
      content.push(`<p style="font-size: 12px; margin: 0 0 8px 0;"><a href="${attrs['website']}" style="color: ${attrs['textColor']};">${attrs['website']}</a></p>`);
    }
    
    if (attrs['showUnsubscribe']) {
      content.push(`<p style="font-size: 12px; margin: 16px 0 0 0;"><a href="{{unsubscribe_link}}" style="color: ${attrs['textColor']};">Darse de baja</a></p>`);
    }
    
    content.push(`<p style="font-size: 11px; margin: 16px 0 0 0; opacity: 0.7;">Enviado con <strong>MailBoom</strong></p>`);
    
    if (content.length === 1) {
      content.unshift(`<p style="font-size: 14px; color: #9ca3af; font-style: italic; margin: 0 0 8px 0;">✚ Haz clic para configurar el footer</p>`);
    }
    
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'footer-node',
        style: `text-align: ${attrs['align']}; padding: ${attrs['padding']}; background-color: ${attrs['backgroundColor']}; color: ${attrs['textColor']}; border-top: 1px solid #e5e7eb;`
      }),
      content.join('')
    ];
  }
});

/**
 * Extensión TipTap para espaciador
 */
export const SpacerNode = Node.create({
  name: 'spacerNode',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      height: { default: '20px' },
      backgroundColor: { default: 'transparent' }
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="spacer-node"]' }];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as Record<string, any>;
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'spacer-node',
        style: `height: ${attrs['height']}; background-color: ${attrs['backgroundColor']};`
      })
    ];
  }
});

/**
 * Exporta todas las extensiones de email como un array
 */
export const emailExtensions = [
  ButtonNode,
  ImageNode,
  DividerNode,
  SocialNode,
  ColumnsNode,
  HeaderNode,
  FooterNode,
  SpacerNode
];
