
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
  status: "draft" | "published" | "in-progress" | "completed";
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
  title: string;
  description?: string;
  status: string;
  order: number;
  dueDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
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
  profile?: {
    name: string;
    email: string;
    profile_image?: string;
    skills?: string[];
  };
}
