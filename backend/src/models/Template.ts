import mongoose, { Document, Schema } from 'mongoose';

export type TemplateMode = 'preset' | 'background';
export type TemplateFieldType = 'text' | 'date' | 'image';
export type TemplateFieldTextAlign = 'left' | 'center' | 'right';

export interface ITemplateFieldStyle {
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

export interface ITemplateField {
  name: string;
  label: string;
  type: TemplateFieldType;
  required: boolean;
  visible: boolean;
  defaultValue?: string;
  position: { x: number; y: number };
  size?: { width: number; height?: number };
  style?: ITemplateFieldStyle;
}

export interface ITemplate {
  name: string;
  description: string;
  category: 'academic' | 'corporate' | 'event' | 'general';
  mode: TemplateMode;
  thumbnail: string;
  htmlContent: string;
  styles: string;
  backgroundImageUrl?: string;
  fields: ITemplateField[];
  isPublic: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITemplateDocument extends ITemplate, Document {}

const TemplateFieldSchema = new Schema<ITemplateField>(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'date', 'image'], required: true },
    required: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    defaultValue: { type: String },
    position: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
    },
    size: {
      width: { type: Number, default: 32 },
      height: { type: Number },
    },
    style: {
      fontSize: { type: Number, default: 24 },
      fontWeight: { type: Number, default: 600 },
      fontFamily: { type: String, default: 'Arial, sans-serif' },
      color: { type: String, default: '#111827' },
      textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
      lineHeight: { type: Number, default: 1.2 },
      letterSpacing: { type: Number, default: 0 },
      fontStyle: { type: String, enum: ['normal', 'italic'], default: 'normal' },
      textTransform: { type: String, enum: ['none', 'uppercase'], default: 'none' },
    },
  },
  { _id: false }
);

const TemplateSchema = new Schema<ITemplateDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['academic', 'corporate', 'event', 'general'],
      required: true,
    },
    mode: {
      type: String,
      enum: ['preset', 'background'],
      default: 'preset',
    },
    thumbnail: { type: String, required: true },
    htmlContent: { type: String, required: true },
    styles: { type: String, default: '' },
    backgroundImageUrl: { type: String },
    fields: { type: [TemplateFieldSchema], default: [] },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Template = mongoose.model<ITemplateDocument>('Template', TemplateSchema);
