import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplateField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'image';
  required: boolean;
  defaultValue?: string;
  position: { x: number; y: number };
}

export interface ITemplate {
  name: string;
  description: string;
  category: 'academic' | 'corporate' | 'event' | 'general';
  thumbnail: string;
  htmlContent: string;
  styles: string;
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
    defaultValue: { type: String },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
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
    thumbnail: { type: String, required: true },
    htmlContent: { type: String, required: true },
    styles: { type: String, default: '' },
    fields: { type: [TemplateFieldSchema], default: [] },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Template = mongoose.model<ITemplateDocument>('Template', TemplateSchema);
