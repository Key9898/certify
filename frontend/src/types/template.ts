export type TemplateMode = 'preset' | 'background';
export type TemplateFieldType = 'text' | 'date' | 'image';
export type TemplateFieldTextAlign = 'left' | 'center' | 'right';

export interface TemplateFieldStyle {
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: TemplateFieldTextAlign;
  lineHeight?: number;
  letterSpacing?: number;
  fontStyle?: 'normal' | 'italic';
  textTransform?: 'none' | 'uppercase';
}

export interface TemplateField {
  name: string;
  label: string;
  type: TemplateFieldType;
  required: boolean;
  visible?: boolean;
  defaultValue?: string;
  position: { x: number; y: number };
  size?: { width: number; height?: number };
  style?: TemplateFieldStyle;
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  category: 'academic' | 'corporate' | 'event' | 'general';
  mode?: TemplateMode;
  thumbnail: string;
  htmlContent: string;
  styles: string;
  backgroundImageUrl?: string;
  fields: TemplateField[];
  isPublic: boolean;
  createdBy: string;
  creatorId?: string;
  createdAt: string;
  updatedAt: string;
}
