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

export function mapSupabaseOrgToOrganization(supabaseOrg: any): Organization {
  return {
    id: supabaseOrg.id,
    name: supabaseOrg.name,
    description: supabaseOrg.description,
    industry: supabaseOrg.industry,
    location: supabaseOrg.location,
    size: supabaseOrg.size,
    foundedYear: supabaseOrg.founded_year,
    website: supabaseOrg.website,
    logo: supabaseOrg.logo,
    createdAt: supabaseOrg.created_at,
    updatedAt: supabaseOrg.updated_at,
    owner_id: supabaseOrg.owner_id,
    status: supabaseOrg.status, // Add status field
    // Keep original properties for compatibility
    created_at: supabaseOrg.created_at,
    updated_at: supabaseOrg.updated_at,
    founded_year: supabaseOrg.founded_year
  };
}
