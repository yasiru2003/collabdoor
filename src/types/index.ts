
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
  status?: OrganizationStatus; // Add status to the type
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
  organizer_id: string; // Ensure this matches the type used in other files
  organization_id?: string;
  organization_name?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  profiles?: User;
  organizerName?: string;
  partnership_types?: string[]; // Add missing properties
  applications_enabled?: boolean;
  content?: string;
  timeline?: any; // Add timeline if used
  partners?: any; // Add partners if used
}

// Add missing type definitions
export type OrganizationStatus = 'active' | 'pending_approval' | 'rejected' | 'inactive';

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
  // Add properties based on your application requirements
  id: string;
  user_id: string;
  project_id: string;
  status: string;
  // Add other relevant properties
}
