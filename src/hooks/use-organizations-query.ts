
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mapSupabaseOrgToOrganization } from "@/utils/data-mappers";
import { handleSupabaseError } from "./use-supabase-utils";

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
 * Hook to fetch partnerships for a specific user
 */
export function usePartnerships(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["partnerships", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("partnerships")
        .select(`
          *,
          project:projects(*),
          organization:organizations(*)
        `)
        .eq("partner_id", userId)
        .order("created_at", { ascending: false });

      handleSupabaseError(error, "Error fetching partnerships", toast);

      return data || [];
    },
    enabled: !!userId,
  });
}
