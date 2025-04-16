// Add the applicationsEnabled property to the Project interface
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
  status: "draft" | "published" | "completed";
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
}

export type PartnershipType = "monetary" | "knowledge" | "skilled" | "volunteering";

export interface Profile {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  role?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectPhase {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: "not-started" | "in-progress" | "completed";
  order: number;
}
