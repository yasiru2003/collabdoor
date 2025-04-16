
export type UserRole = 'partner' | 'organizer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  skills?: string[];
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  industry?: string;
  location?: string;
  size?: string;
  foundedYear?: number;
}

export type PartnershipType = 'monetary' | 'knowledge' | 'skilled' | 'volunteering';

export interface Project {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizerName: string;
  partnershipTypes: PartnershipType[];
  timeline: {
    start: string;
    end: string;
  };
  status: 'draft' | 'published' | 'in-progress' | 'completed';
  category: string;
  image?: string;
  requiredSkills?: string[];
  location?: string;
  partners?: {
    id: string;
    name: string;
    role: PartnershipType;
  }[];
  createdAt: string;
  updatedAt: string;
}
