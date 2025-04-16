
import { Project, Organization, PartnershipType } from "@/types";

// Map Supabase project data to our frontend Project type
export function mapSupabaseProjectToProject(supabaseProject: any): Project {
  return {
    id: supabaseProject.id,
    title: supabaseProject.title,
    description: supabaseProject.description,
    organizerId: supabaseProject.organizer_id,
    organizerName: "", // This will be filled in separately when needed
    partnershipTypes: supabaseProject.partnership_types as PartnershipType[],
    timeline: {
      start: supabaseProject.start_date || new Date().toISOString(),
      end: supabaseProject.end_date || new Date().toISOString()
    },
    status: supabaseProject.status,
    category: supabaseProject.category || "",
    image: supabaseProject.image,
    requiredSkills: supabaseProject.required_skills || [],
    location: supabaseProject.location,
    partners: [], // Will be filled separately when needed
    createdAt: supabaseProject.created_at,
    updatedAt: supabaseProject.updated_at
  };
}

// Map Supabase organization data to frontend Organization type
export function mapSupabaseOrgToOrganization(supabaseOrg: any): Organization {
  return {
    id: supabaseOrg.id,
    name: supabaseOrg.name,
    description: supabaseOrg.description || "",
    logo: supabaseOrg.logo,
    website: supabaseOrg.website,
    industry: supabaseOrg.industry,
    location: supabaseOrg.location,
    size: supabaseOrg.size,
    foundedYear: supabaseOrg.founded_year
  };
}
