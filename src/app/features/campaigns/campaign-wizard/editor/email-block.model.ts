/**
 * Modelos de datos para el editor de bloques estilo Notion
 * Estos modelos representan los diferentes tipos de bloques disponibles
 * para diseñar campañas de mailing, compatibles con MJML
 */

// Tipos de bloques disponibles
export type EmailBlockType = 
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'quote'
  | 'button'
  | 'image'
  | 'divider'
  | 'social'
  | 'columns'
  | 'header'
  | 'footer'
  | 'spacer';

// Configuración de estilos de texto
export interface TextStyleConfig {
  fontFamily?: 'Arial' | 'Helvetica' | 'Georgia' | 'Times New Roman' | 'Verdana' | 'Roboto';
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: string;
  letterSpacing?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic';
}

// Configuración de botón CTA
export interface ButtonConfig {
  text: string;
  url: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  padding?: string;
  width?: 'auto' | 'full';
  align?: 'left' | 'center' | 'right';
}

// Configuración de imagen
export interface ImageConfig {
  src: string;
  alt?: string;
  link?: string;
  width?: string;
  height?: string;
  align?: 'left' | 'center' | 'right';
  padding?: string;
}

// Configuración de divisor
export interface DividerConfig {
  color?: string;
  width?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  padding?: string;
}

// Redes sociales disponibles
export type SocialNetwork = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'pinterest';

// Configuración de iconos de redes sociales
export interface SocialIconConfig {
  network: SocialNetwork;
  url: string;
  iconSize?: number;
  iconColor?: string;
}

// Configuración de bloque social
export interface SocialConfig {
  icons: SocialIconConfig[];
  align?: 'left' | 'center' | 'right';
  padding?: string;
  iconSpacing?: string;
}

// Configuración de columna individual
export interface ColumnConfig {
  width: string; // porcentaje o valor CSS
  content: EmailBlockNode[];
  backgroundColor?: string;
  padding?: string;
}

// Configuración de layout de columnas
export interface ColumnsConfig {
  columns: ColumnConfig[];
  gap?: string;
  backgroundColor?: string;
  padding?: string;
}

// Configuración de header
export interface HeaderConfig {
  useImage?: boolean;
  logoUrl?: string;
  logoWidth?: string;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  align?: 'left' | 'center' | 'right';
  padding?: string;
  height?: string;
}

// Configuración de footer
export interface FooterConfig {
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  showUnsubscribe?: boolean;
  unsubscribeText?: string;
  backgroundColor?: string;
  textColor?: string;
  align?: 'left' | 'center' | 'right';
  padding?: string;
  socialLinks?: Partial<Record<SocialNetwork, string>>;
}

// Configuración de espaciador
export interface SpacerConfig {
  height: string;
  backgroundColor?: string;
}

// Nodo de bloque de email (representa un bloque en el editor)
export interface EmailBlockNode {
  id: string;
  type: EmailBlockType;
  attrs?: {
    // Estilos de texto
    textStyle?: TextStyleConfig;
    
    // Configuraciones específicas por tipo
    button?: ButtonConfig;
    image?: ImageConfig;
    divider?: DividerConfig;
    social?: SocialConfig;
    columns?: ColumnsConfig;
    header?: HeaderConfig;
    footer?: FooterConfig;
    spacer?: SpacerConfig;
    
    // Atributos comunes
    padding?: string;
    backgroundColor?: string;
  };
  content?: EmailBlockNode[];
  textContent?: string;
}

// Estado completo del documento del editor
export interface EmailDocument {
  version: string;
  globalStyles: {
    backgroundColor: string;
    fontFamily: string;
    maxWidth: number;
    preheaderText?: string;
  };
  header?: EmailBlockNode;
  content: EmailBlockNode[];
  footer?: EmailBlockNode;
}

// Opciones del menú slash command
export interface SlashCommandOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: 'text' | 'media' | 'layout' | 'interactive';
  blockType: EmailBlockType;
  keywords?: string[];
}

// Definición de las opciones del menú slash
export const SLASH_COMMAND_OPTIONS: SlashCommandOption[] = [
  // Texto
  {
    id: 'paragraph',
    label: 'Párrafo',
    description: 'Texto normal',
    icon: 'type',
    category: 'text',
    blockType: 'paragraph',
    keywords: ['texto', 'parrafo', 'text', 'p']
  },
  {
    id: 'heading1',
    label: 'Título 1',
    description: 'Título grande',
    icon: 'heading-1',
    category: 'text',
    blockType: 'heading1',
    keywords: ['titulo', 'h1', 'heading', 'title']
  },
  {
    id: 'heading2',
    label: 'Título 2',
    description: 'Título mediano',
    icon: 'heading-2',
    category: 'text',
    blockType: 'heading2',
    keywords: ['subtitulo', 'h2', 'heading', 'subtitle']
  },
  {
    id: 'heading3',
    label: 'Título 3',
    description: 'Título pequeño',
    icon: 'heading-3',
    category: 'text',
    blockType: 'heading3',
    keywords: ['subtitulo', 'h3', 'heading']
  },
  {
    id: 'quote',
    label: 'Cita',
    description: 'Bloque de cita destacada',
    icon: 'quote',
    category: 'text',
    blockType: 'quote',
    keywords: ['cita', 'quote', 'blockquote']
  },
  {
    id: 'bulletList',
    label: 'Lista con viñetas',
    description: 'Lista no ordenada',
    icon: 'list',
    category: 'text',
    blockType: 'bulletList',
    keywords: ['lista', 'bullets', 'unordered']
  },
  {
    id: 'orderedList',
    label: 'Lista numerada',
    description: 'Lista ordenada',
    icon: 'list-ordered',
    category: 'text',
    blockType: 'orderedList',
    keywords: ['lista', 'numeros', 'ordered']
  },
  
  // Media
  {
    id: 'image',
    label: 'Imagen',
    description: 'Insertar una imagen',
    icon: 'image',
    category: 'media',
    blockType: 'image',
    keywords: ['imagen', 'foto', 'image', 'img']
  },
  {
    id: 'divider',
    label: 'Divisor',
    description: 'Línea horizontal',
    icon: 'minus',
    category: 'media',
    blockType: 'divider',
    keywords: ['linea', 'divisor', 'hr', 'separator']
  },
  {
    id: 'spacer',
    label: 'Espaciador',
    description: 'Espacio vertical',
    icon: 'space',
    category: 'media',
    blockType: 'spacer',
    keywords: ['espacio', 'spacer', 'gap', 'padding']
  },
  
  // Interactive
  {
    id: 'button',
    label: 'Botón CTA',
    description: 'Botón de llamada a la acción',
    icon: 'mouse-pointer-click',
    category: 'interactive',
    blockType: 'button',
    keywords: ['boton', 'cta', 'button', 'link']
  },
  {
    id: 'social',
    label: 'Redes Sociales',
    description: 'Iconos de redes sociales',
    icon: 'share-2',
    category: 'interactive',
    blockType: 'social',
    keywords: ['social', 'redes', 'facebook', 'twitter', 'instagram']
  },
  
  // Layout
  {
    id: 'columns',
    label: '2 Columnas',
    description: 'Layout de dos columnas',
    icon: 'columns',
    category: 'layout',
    blockType: 'columns',
    keywords: ['columnas', 'columns', 'layout', 'grid']
  },
  {
    id: 'header',
    label: 'Header',
    description: 'Encabezado del email',
    icon: 'layout-template',
    category: 'layout',
    blockType: 'header',
    keywords: ['header', 'encabezado', 'logo']
  },
  {
    id: 'footer',
    label: 'Footer',
    description: 'Pie del email',
    icon: 'layout-template',
    category: 'layout',
    blockType: 'footer',
    keywords: ['footer', 'pie', 'contacto']
  },
];

// Colores predefinidos para el editor
export const PRESET_COLORS = {
  text: [
    '#000000', '#374151', '#6B7280', '#9CA3AF',
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899'
  ],
  background: [
    '#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB',
    '#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE',
    '#E0E7FF', '#FCE7F3', '#1F2937', '#111827'
  ],
  button: [
    '#4F46E5', '#3B82F6', '#0EA5E9', '#14B8A6',
    '#22C55E', '#EAB308', '#F97316', '#EF4444',
    '#EC4899', '#8B5CF6', '#6366F1', '#000000'
  ]
};

// Fuentes disponibles para emails
export const EMAIL_FONTS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Roboto, Arial, sans-serif', label: 'Roboto' },
  { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
  { value: '"Courier New", monospace', label: 'Courier New' }
];

// Tamaños de fuente predefinidos
export const FONT_SIZES = [
  { value: '12px', label: '12px - Pequeño' },
  { value: '14px', label: '14px - Normal pequeño' },
  { value: '16px', label: '16px - Normal' },
  { value: '18px', label: '18px - Mediano' },
  { value: '20px', label: '20px - Grande' },
  { value: '24px', label: '24px - Título 2' },
  { value: '28px', label: '28px - Título 1' },
  { value: '32px', label: '32px - Título grande' },
  { value: '40px', label: '40px - Hero' }
];
