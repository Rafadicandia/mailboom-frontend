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

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider';
  content: string;
  style?: TextStyle;
  url?: string;
  padding: number;
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