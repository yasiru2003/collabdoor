
import { Organization, Project, PartnershipType } from "@/types";

export function mapSupabaseProjectToProject(supabaseProject: any): Project {
  // For partnership types, ensure they match the correct type
  const partnershipTypes: PartnershipType[] = [];
  if (supabaseProject.partnership_types) {
    supabaseProject.partnership_types.forEach((type: string) => {
      if (type === 'monetary' || type === 'knowledge' || type === 'skilled' || type === 'volunteering') {
        partnershipTypes.push(type as PartnershipType);
      }
    });
  }

  return {
    id: supabaseProject.id,
    title: supabaseProject.title,
    description: supabaseProject.description,
    organizer_id: supabaseProject.organizer_id,
    organizerId: supabaseProject.organizer_id, // Add camelCase version
    organizerName: supabaseProject.organizer_name || "", // This will be populated later with the profile name
    organization_id: supabaseProject.organization_id || undefined,
    organizationId: supabaseProject.organization_id || undefined, // Add camelCase version
    organization_name: supabaseProject.organization_name || undefined,
    organizationName: supabaseProject.organization_name || undefined, // Add camelCase version
    partnership_types: partnershipTypes,
    partnershipTypes: partnershipTypes, // Add camelCase version
    timeline: {
      start: supabaseProject.start_date,
      end: supabaseProject.end_date,
    },
    status: supabaseProject.status,
    category: supabaseProject.category || "",
    image: supabaseProject.image,
    required_skills: supabaseProject.required_skills || [],
    requiredSkills: supabaseProject.required_skills || [],
    location: supabaseProject.location,
    created_at: supabaseProject.created_at,
    updated_at: supabaseProject.updated_at,
    completed_at: supabaseProject.completed_at,
    completedAt: supabaseProject.completed_at, // Add camelCase version
    applications_enabled: supabaseProject.applications_enabled !== false,
    applicationsEnabled: supabaseProject.applications_enabled !== false, // Add camelCase version
    proposal_file_path: supabaseProject.proposal_file_path,
    proposalFilePath: supabaseProject.proposal_file_path,
    start_date: supabaseProject.start_date,
    end_date: supabaseProject.end_date,
    partnership_details: supabaseProject.partnership_details,
    previous_projects: supabaseProject.previous_projects,
    content: supabaseProject.content,
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
