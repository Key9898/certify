import { Template, ITemplateDocument } from '../models/Template';
import mongoose from 'mongoose';

export const getPublicTemplates = async (): Promise<ITemplateDocument[]> => {
  return Template.find({ isPublic: true }).sort({ createdAt: -1 });
};

export const getTemplateById = async (id: string): Promise<ITemplateDocument | null> => {
  return Template.findById(id);
};

export const seedDefaultTemplates = async (adminUserId: string): Promise<void> => {
  const count = await Template.countDocuments();
  if (count > 0) return;

  const defaultTemplates = [
    {
      name: 'Modern Professional',
      description: 'Clean and modern certificate design for professional use',
      category: 'corporate',
      thumbnail: 'https://via.placeholder.com/400x280/3B82F6/ffffff?text=Modern',
      htmlContent: 'certificate-modern',
      styles: '',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(adminUserId),
    },
    {
      name: 'Classic Academic',
      description: 'Traditional academic certificate with elegant styling',
      category: 'academic',
      thumbnail: 'https://via.placeholder.com/400x280/1E40AF/ffffff?text=Classic',
      htmlContent: 'certificate-classic',
      styles: '',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(adminUserId),
    },
    {
      name: 'Event Achievement',
      description: 'Vibrant certificate for event participation and achievements',
      category: 'event',
      thumbnail: 'https://via.placeholder.com/400x280/7C3AED/ffffff?text=Event',
      htmlContent: 'certificate-base',
      styles: '',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(adminUserId),
    },
  ];

  await Template.insertMany(defaultTemplates);
  console.log('✅ Default templates seeded');
};
