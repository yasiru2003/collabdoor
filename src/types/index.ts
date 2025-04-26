export interface User {
  id: string;
  email: string;
  name?: string;
  profile_image?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  last_active?: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  location?: string;
  size?: string;
  founded_year?: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status: ProjectStatus;
  organizer_id: string;
  organization_id?: string;
  organization_name?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  profiles?: User;
}

export type ProjectStatus = 'draft' | 'published' | 'in-progress' | 'completed' | 'pending_publish';

export type OrganizationStatus = 'active' | 'pending_approval' | 'rejected' | 'inactive';

export interface SystemSettings {
  id: string;
  key: string;
  value: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}
