
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
