
import { Organization, Project } from "@/types";

/**
 * Maps snake_case database fields to camelCase for Organization type
 */
export function mapOrganizationData(dbOrg: any): Organization {
  return {
    id: dbOrg.id,
    name: dbOrg.name,
    description: dbOrg.description,
    logo: dbOrg.logo,
    website: dbOrg.website,
    industry: dbOrg.industry,
    location: dbOrg.location,
    size: dbOrg.size,
    ownerId: dbOrg.owner_id,
    foundedYear: dbOrg.founded_year,
    createdAt: dbOrg.created_at,
    updatedAt: dbOrg.updated_at,
    email: dbOrg.email,
    phone: dbOrg.phone,
  };
}

/**
 * Maps an array of database organizations to app Organization model
 */
export function mapOrganizationsData(dbOrgs: any[]): Organization[] {
  return dbOrgs.map(mapOrganizationData);
}

/**
 * Maps snake_case database fields to camelCase for Project type
 */
export function mapProjectData(dbProject: any): Project {
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    category: dbProject.category,
    location: dbProject.location,
    status: dbProject.status,
    image: dbProject.image,
    proposalFilePath: dbProject.proposal_file_path,
    timeline: {
      start: dbProject.start_date,
      end: dbProject.end_date
    },
    partnershipTypes: dbProject.partnership_types || [],
    organizerId: dbProject.organizer_id,
    organizerName: dbProject.organizer_name,
    organizationId: dbProject.organization_id,
    organizationName: dbProject.organization_name,
    applicationsEnabled: dbProject.applications_enabled,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at,
    completedAt: dbProject.completed_at
  };
}

/**
 * Maps an array of database projects to app Project model
 */
export function mapProjectsData(dbProjects: any[]): Project[] {
  return dbProjects.map(mapProjectData);
}

/**
 * Maps a Supabase project object to the Project type
 */
export function mapSupabaseProjectToProject(dbProject: any): Project {
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    category: dbProject.category,
    location: dbProject.location,
    status: dbProject.status,
    image: dbProject.image,
    proposalFilePath: dbProject.proposal_file_path,
    timeline: {
      start: dbProject.start_date,
      end: dbProject.end_date
    },
    partnershipTypes: dbProject.partnership_types || [],
    organizerId: dbProject.organizer_id,
    organizerName: dbProject.profiles?.name,
    organizationId: dbProject.organization_id,
    organizationName: dbProject.organization_name,
    applicationsEnabled: dbProject.applications_enabled === true,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at,
    completedAt: dbProject.completed_at
  };
}

/**
 * Maps a Supabase organization object to the Organization type
 */
export function mapSupabaseOrgToOrganization(dbOrg: any): Organization {
  return {
    id: dbOrg.id,
    name: dbOrg.name,
    description: dbOrg.description,
    logo: dbOrg.logo,
    website: dbOrg.website,
    industry: dbOrg.industry,
    location: dbOrg.location,
    size: dbOrg.size,
    ownerId: dbOrg.owner_id,
    foundedYear: dbOrg.founded_year,
    createdAt: dbOrg.created_at,
    updatedAt: dbOrg.updated_at,
    email: dbOrg.email,
    phone: dbOrg.phone,
  };
}
