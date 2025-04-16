
import { Organization, Project } from "@/types";

export function mapSupabaseProjectToProject(supabaseProject: any): Project {
  return {
    id: supabaseProject.id,
    title: supabaseProject.title,
    description: supabaseProject.description,
    organizerId: supabaseProject.organizer_id,
    organizerName: "", // This will be populated later with the profile name
    organizationId: supabaseProject.organization_id || undefined,
    organizationName: supabaseProject.organization_name || undefined,
    partnershipTypes: supabaseProject.partnership_types || [],
    timeline: {
      start: supabaseProject.start_date,
      end: supabaseProject.end_date,
    },
    status: supabaseProject.status,
    category: supabaseProject.category || "",
    image: supabaseProject.image,
    requiredSkills: supabaseProject.required_skills || [],
    location: supabaseProject.location,
    createdAt: supabaseProject.created_at,
    updatedAt: supabaseProject.updated_at,
    completedAt: supabaseProject.completed_at,
    applicationsEnabled: supabaseProject.applications_enabled !== false,
    proposalFilePath: supabaseProject.proposal_file_path,
  };
}
