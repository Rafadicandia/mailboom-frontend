export type EditorMode = 'template' | 'custom-html';

export type FontFamily = 'Arial' | 'Georgia' | 'Helvetica' | 'Times New Roman' | 'Verdana' | 'Roboto';
export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';

export interface TextStyle {
  fontFamily: FontFamily;
  fontSize: FontSize;
  color: string;
  align: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface HeaderConfig {
  enabled: boolean;
  useImage: boolean;
  imageUrl: string;
  text: string;
  backgroundColor: string;
  textColor: string;
  height: number;
}

export interface FooterConfig {
  enabled: boolean;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  showUnsubscribe: boolean;
  customText: string;
  backgroundColor: string;
  textColor: string;
}

export type ContentBlockType = 'text' | 'rich-text' | 'image' | 'button' | 'divider' | 'image-with-caption' | 'columns-row' | 'column-one-third' | 'column-two-thirds';

export interface ColumnConfig {
  width: 'one-third' | 'two-thirds' | 'full';
  blocks: ContentBlock[];
}

export interface CaptionConfig {
  text: string;
  style?: TextStyle;
  position: 'below' | 'above' | 'overlay';
}

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string;
  style?: TextStyle;
  url?: string;
  padding: number;
  // Para rich-text
  htmlContent?: string;
  // Para imagen con caption
  caption?: CaptionConfig;
  // Para columnas
  columnConfig?: ColumnConfig;
}

export interface EmailDesign {
  mode: EditorMode;
  backgroundColor: string;
  contentMaxWidth: number;
  header: HeaderConfig;
  content: ContentBlock[];
  footer: FooterConfig;
  customHtml?: string;
}