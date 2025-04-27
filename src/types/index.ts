
export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  location?: string;
  size?: string;
  founded_year?: number;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
  status?: OrganizationStatus;
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
  // Define both camelCase and snake_case versions for compatibility
  organizerId?: string;
  organizerName?: string;
  organizationId?: string;
  organizationName?: string;
  partnership_types?: PartnershipType[];
  partnershipTypes?: PartnershipType[];
  applications_enabled?: boolean;
  applicationsEnabled?: boolean;
  content?: string;
  timeline?: any;
  partners?: any;
  proposalFilePath?: string;
  proposal_file_path?: string;
  requiredSkills?: string[];
  required_skills?: string[];
  partnership_details?: Record<string, string>;
  previous_projects?: Record<string, string>;
  // Add completedAt for camelCase compatibility
  completedAt?: string;
}

// Add missing type definitions
export type OrganizationStatus = 'active' | 'pending_approval' | 'rejected' | 'inactive';
export type ProjectStatus = 'draft' | 'published' | 'in-progress' | 'completed' | 'pending_publish';

export type PartnershipType = 'monetary' | 'knowledge' | 'skilled' | 'volunteering';

export interface PartnershipInterest {
  id: string;
  organization_id: string;
  partnership_type: PartnershipType;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationWithProfile {
  id: string;
  user_id: string;
  project_id: string;
  status: string;
  partnership_type?: string;
  organization_name?: string;
  created_at?: string;
  profile?: {
    name: string;
    id: string;
    email?: string;
    profile_image?: string;
  };
  profiles?: {
    name: string;
    id: string;
    email?: string;
    profile_image?: string;
  };
}

export interface SystemSettings {
  id: string;
  key: string;
  value: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Add ProjectPhase interface
export interface ProjectPhase {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'not-started' | 'in-progress' | 'completed';
  order: number;
  dueDate?: string;
  completedDate?: string;
  created_at?: string;
  updated_at?: string;
}

// Add User interface for mockData
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}
