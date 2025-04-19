
export interface Project {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizerName: string;
  organizationId?: string;
  organizationName?: string;
  category?: string;
  image?: string;
  location?: string;
  status: "draft" | "published" | "in-progress" | "completed" | "pending_publish";
  timeline: {
    start?: string;
    end?: string;
  };
  partners?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  partnershipTypes: PartnershipType[];
  requiredSkills?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  applicationsEnabled?: boolean;
  proposalFilePath?: string;
}

export type PartnershipType = "monetary" | "knowledge" | "skilled" | "volunteering";

export interface Organization {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  location?: string;
  size?: string;
  foundedYear?: number;
  website?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  owner_id: string;
  // Adding these for compatibility with raw DB objects
  created_at?: string;
  updated_at?: string;
  founded_year?: number;
  // Extended properties
  partnershipInterests?: PartnershipType[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "partner" | "organizer";
  profile_image?: string;
  bio?: string;
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  project_id?: string; // For compatibility with DB format
  title: string;
  description?: string;
  status: string;
  order: number;
  dueDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
  // Adding these for compatibility with raw DB objects
  created_at?: string;
  updated_at?: string;
  due_date?: string;
  completed_date?: string;
}

export interface ApplicationWithProfile {
  id: string;
  project_id: string;
  user_id: string;
  partnership_type: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  organization_id?: string;
  organization_name?: string;
  profile?: {
    name: string;
    email: string;
    profile_image?: string;
    skills?: string[];
  };
  // For backward compatibility with existing code
  profiles?: {
    name: string;
    email: string;
    profile_image?: string;
    skills?: string[];
  };
}

// New interface for system settings
export interface SystemSettings {
  id: string;
  key: string;
  value: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

// New interface for partnership interests
export interface PartnershipInterest {
  id: string;
  organization_id: string;
  partnership_type: PartnershipType;
  description: string;
  created_at: string;
  updated_at: string;
}

// New interface for partnership applications
export interface PartnershipApplication {
  id: string;
  organization_id: string;
  user_id: string;
  interest_id: string;
  partnership_type: PartnershipType;
  project_id?: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}
