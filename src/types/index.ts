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
  phases?: ProjectPhase[];
}

export interface ProjectPhase {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
  dueDate?: string;
  completedDate?: string;
  order: number;
}

export interface ProfileData {
  id?: string;
  name?: string;
  email?: string;
  profile_image?: string;
}

export interface ApplicationWithProfile {
  id: string;
  project_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  partnership_type: string;
  message?: string;
  created_at: string;
  updated_at: string;
  profiles?: ProfileData | null;
}
