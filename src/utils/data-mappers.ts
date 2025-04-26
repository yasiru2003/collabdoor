
import { Organization, Project } from "@/types";

export function mapSupabaseProjectToProject(supabaseProject: any): Project {
  return {
    id: supabaseProject.id,
    title: supabaseProject.title,
    description: supabaseProject.description,
    organizer_id: supabaseProject.organizer_id,
    organizerId: supabaseProject.organizer_id, // Add camelCase version
    organizerName: "", // This will be populated later with the profile name
    organization_id: supabaseProject.organization_id || undefined,
    organizationId: supabaseProject.organization_id || undefined, // Add camelCase version
    organization_name: supabaseProject.organization_name || undefined,
    organizationName: supabaseProject.organization_name || undefined, // Add camelCase version
    partnership_types: supabaseProject.partnership_types || [],
    partnershipTypes: supabaseProject.partnership_types || [], // Add camelCase version
    timeline: {
      start: supabaseProject.start_date,
      end: supabaseProject.end_date,
    },
    status: supabaseProject.status,
    category: supabaseProject.category || "",
    image: supabaseProject.image,
    requiredSkills: supabaseProject.required_skills || [],
    location: supabaseProject.location,
    created_at: supabaseProject.created_at,
    createdAt: supabaseProject.created_at,
    updated_at: supabaseProject.updated_at,
    updatedAt: supabaseProject.updated_at,
    completed_at: supabaseProject.completed_at,
    completedAt: supabaseProject.completed_at,
    applications_enabled: supabaseProject.applications_enabled !== false,
    applicationsEnabled: supabaseProject.applications_enabled !== false, // Add camelCase version
    proposalFilePath: supabaseProject.proposal_file_path,
    start_date: supabaseProject.start_date,
    end_date: supabaseProject.end_date,
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
    founded_year: supabaseOrg.founded_year,
    website: supabaseOrg.website,
    logo: supabaseOrg.logo,
    created_at: supabaseOrg.created_at,
    updated_at: supabaseOrg.updated_at,
    owner_id: supabaseOrg.owner_id,
    status: supabaseOrg.status
  };
}
