
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mapSupabaseOrgToOrganization } from "@/utils/data-mappers";
import { handleSupabaseError } from "./use-supabase-utils";
import { PartnershipType } from "@/types";

/**
 * Hook to fetch all partners/organizations
 */
export function usePartners() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("name", { ascending: true });

      handleSupabaseError(error, "Error fetching partners", toast);

      return (data || []).map(org => mapSupabaseOrgToOrganization(org));
    },
  });
}

/**
 * Hook to fetch partnerships for a specific user with related data
 */
export function usePartnerships(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["partnerships", userId],
    queryFn: async () => {
      if (!userId) return [];

      // First get all partnerships from partnerships table
      const { data: partnershipData, error: partnershipError } = await supabase
        .from("partnerships")
        .select(`
          *,
          projects:project_id(id, title, status, organization_name, completed_at),
          organizations:organization_id(id, name, logo, industry, location)
        `)
        .eq("partner_id", userId)
        .order("created_at", { ascending: false });

      handleSupabaseError(partnershipError, "Error fetching partnerships", toast);

      // Now get approved applications that might not be in partnerships table yet
      const { data: applicationData, error: applicationError } = await supabase
        .from("project_applications")
        .select(`
          *,
          projects:project_id(id, title, status, organization_name, completed_at),
          organizations:organization_id(id, name, logo, industry, location)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      handleSupabaseError(applicationError, "Error fetching applications", toast);

      // Transform applications to partnership format
      const applicationsAsPartnerships = applicationData?.map(app => ({
        id: app.id,
        partner_id: app.user_id,
        project_id: app.project_id,
        organization_id: app.organization_id,
        // Cast partnership_type to the correct enum type
        partnership_type: app.partnership_type as PartnershipType,
        status: app.status === 'pending' ? 'pending' : (app.status === 'approved' ? 'active' : app.status),
        created_at: app.created_at,
        updated_at: app.updated_at,
        projects: app.projects,
        organizations: app.organizations
      })) || [];

      // Combine and deduplicate (preferring items from partnerships table)
      const allPartnerships = [...(partnershipData || [])];
      
      // Add applications that don't already exist in partnerships (based on project_id)
      applicationsAsPartnerships.forEach(app => {
        if (!allPartnerships.some(p => p.project_id === app.project_id)) {
          allPartnerships.push(app);
        }
      });

      // Mark partnerships as completed if their project is completed
      const finalPartnerships = allPartnerships.map(partnership => {
        if (partnership.projects?.status === 'completed') {
          return {
            ...partnership,
            status: 'completed'
          };
        }
        return partnership;
      });

      return finalPartnerships;
    },
    enabled: !!userId,
  });
}
