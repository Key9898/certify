import { Template, ITemplateDocument } from '../models/Template';
import mongoose from 'mongoose';

const SYSTEM_USER_ID = '000000000000000000000001';

const buildTemplateThumbnail = (
  name: string,
  primaryColor: string,
  secondaryColor: string
): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="${secondaryColor}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="36" fill="url(#bg)" />
      <rect x="64" y="64" width="1072" height="772" rx="24" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" />
      <text x="600" y="350" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="42" font-weight="700">
        ${name}
      </text>
      <text x="600" y="420" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="24">
        Certify Template
      </text>
      <text x="600" y="730" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="18" letter-spacing="6">
        PREVIEW
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getPublicTemplates = async (): Promise<ITemplateDocument[]> => {
  return Template.find({ isPublic: true }).sort({ createdAt: -1 });
};

export const getTemplateById = async (
  id: string
): Promise<ITemplateDocument | null> => {
  return Template.findById(id);
};

export const seedDefaultTemplates = async (
  adminUserId?: string
): Promise<void> => {
  const count = await Template.countDocuments();
  if (count > 0) return;

  const creatorId = adminUserId || SYSTEM_USER_ID;

  const defaultTemplates = [
    {
      name: 'Academic Diploma',
      description:
        'Elegant diploma certificate for academic achievements with classic styling',
      category: 'academic',
      mode: 'preset',
      thumbnail: buildTemplateThumbnail(
        'Academic Diploma',
        '#1E3A5F',
        '#2C5282'
      ),
      htmlContent: 'academic-diploma',
      styles: '--primary-color: #1E3A5F; --secondary-color: #2C5282;',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    },
    {
      name: 'Academic Achievement',
      description: 'Modern certificate of achievement for academic excellence',
      category: 'academic',
      mode: 'preset',
      thumbnail: buildTemplateThumbnail(
        'Academic Achievement',
        '#2D3748',
        '#4A5568'
      ),
      htmlContent: 'academic-achievement',
      styles: '--primary-color: #2D3748; --secondary-color: #4A5568;',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    },
    {
      name: 'Graduation Certificate',
      description:
        'Traditional graduation certificate with ornate border design',
      category: 'academic',
      mode: 'preset',
      thumbnail: buildTemplateThumbnail(
        'Graduation Certificate',
        '#553C9A',
        '#6B46C1'
      ),
      htmlContent: 'academic-graduation',
      styles: '--primary-color: #553C9A; --secondary-color: #6B46C1;',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    },
    {
      name: 'Employee Recognition',
      description:
        'Professional employee recognition certificate with modern design',
      category: 'corporate',
      mode: 'preset',
      thumbnail: buildTemplateThumbnail(
        'Employee Recognition',
        '#1A365D',
        '#2B6CB0'
      ),
      htmlContent: 'corporate-employee',
      styles: '--primary-color: #1A365D; --secondary-color: #2B6CB0;',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    },
    {
      name: 'Training Completion',
      description: 'Certificate for corporate training program completion',
      category: 'corporate',
      mode: 'preset',
      thumbnail: buildTemplateThumbnail(
        'Training Completion',
        '#234E52',
        '#285E61'
      ),
      htmlContent: 'corporate-training',
      styles: '--primary-color: #234E52; --secondary-color: #285E61;',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    },
    {
      name: 'Excellence Award',
      description:
        'Elegant excellence award certificate for outstanding achievements',
      category: 'corporate',
      mode: 'preset',
      thumbnail: buildTemplateThumbnail(
        'Excellence Award',
        '#744210',
        '#975A16'
      ),
      htmlContent: 'corporate-excellence',
      styles: '--primary-color: #744210; --secondary-color: #975A16;',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    },
    {
      name: 'Workshop Certificate',
      description:
        'Clean workshop completion certificate with side accent design',
      category: 'event',
      mode: 'preset',
      thumbnail: buildTemplateThumbnail(
        'Workshop Certificate',
        '#702459',
        '#97266D'
      ),
      htmlContent: 'event-workshop',
      styles: '--primary-color: #702459; --secondary-color: #97266D;',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    },
    {
      name: 'Conference Attendance',
      description: 'Professional conference attendance certificate',
      category: 'event',
      mode: 'preset',
      thumbnail: buildTemplateThumbnail(
        'Conference Attendance',
        '#285E61',
        '#2C7A7B'
      ),
      htmlContent: 'event-conference',
      styles: '--primary-color: #285E61; --secondary-color: #2C7A7B;',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    },
    {
      name: 'Certificate of Appreciation',
      description: 'Heartfelt appreciation certificate with elegant styling',
      category: 'general',
      mode: 'preset',
      thumbnail: buildTemplateThumbnail(
        'Certificate of Appreciation',
        '#7B341E',
        '#9C4221'
      ),
      htmlContent: 'general-appreciation',
      styles: '--primary-color: #7B341E; --secondary-color: #9C4221;',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    },
    {
      name: 'Certificate of Participation',
      description: 'Simple and clean participation certificate for any event',
      category: 'general',
      mode: 'preset',
      thumbnail: buildTemplateThumbnail(
        'Certificate of Participation',
        '#2D3748',
        '#4A5568'
      ),
      htmlContent: 'general-participation',
      styles: '--primary-color: #2D3748; --secondary-color: #4A5568;',
      fields: [],
      isPublic: true,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    },
  ];

  await Template.insertMany(defaultTemplates);
  console.log('✅ Default templates seeded');
};
