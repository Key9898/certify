export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'image';
  required: boolean;
  defaultValue?: string;
  position: { x: number; y: number };
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  category: 'academic' | 'corporate' | 'event' | 'general';
  thumbnail: string;
  htmlContent: string;
  styles: string;
  fields: TemplateField[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
