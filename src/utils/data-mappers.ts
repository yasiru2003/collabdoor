
import { Project, Organization, PartnershipType } from "@/types";

// Map Supabase project data to our frontend Project type
export function mapSupabaseProjectToProject(supabaseProject: any): Project {
  return {
    id: supabaseProject.id,
    title: supabaseProject.title,
    description: supabaseProject.description,
    organizerId: supabaseProject.organizer_id,
    organizerName: supabaseProject.profiles?.name || "", // This will be filled from the join
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
    updatedAt: supabaseProject.updated_at,
    // Add these fields for compatibility with raw supabase data
    // They're not in our Project type but help with error prevention
    organization_id: supabaseProject.organization_id,
    start_date: supabaseProject.start_date,
    end_date: supabaseProject.end_date,
    required_skills: supabaseProject.required_skills,
    partnership_types: supabaseProject.partnership_types,
    created_at: supabaseProject.created_at,
    organizer_id: supabaseProject.organizer_id
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
    foundedYear: supabaseOrg.founded_year,
    // Generate skills from industry for partner cards
    skills: supabaseOrg.skills || generateSkillsFromIndustry(supabaseOrg.industry)
  };
}

// Helper function to generate skills based on industry
function generateSkillsFromIndustry(industry: string | null | undefined): string[] {
  if (!industry) return [];
  
  const industrySkillMap: Record<string, string[]> = {
    "Technology": ["Software Development", "AI", "Cloud Computing"],
    "Healthcare": ["Medical Research", "Patient Care", "Health Administration"],
    "Education": ["Teaching", "Curriculum Development", "Educational Technology"],
    "Finance": ["Financial Analysis", "Investment", "Accounting"],
    "Manufacturing": ["Production", "Quality Control", "Supply Chain"],
    "Retail": ["Sales", "Customer Service", "Merchandising"],
    "Nonprofit": ["Fundraising", "Community Outreach", "Grant Writing"]
  };
  
  return industrySkillMap[industry] || [industry];
}
