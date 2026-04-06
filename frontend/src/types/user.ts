export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface WhiteLabelSettings {
  brandName?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  supportEmail?: string;
  customDomain?: string;
  hidePoweredBy: boolean;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  owner: string;
  whiteLabel: WhiteLabelSettings;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  auth0Id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  organizationId?: string;
  organizationRole?: OrganizationRole;
  organization?: Organization | null;
  settings: {
    defaultLogo?: string;
    defaultColors: {
      primary: string;
      secondary: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}
