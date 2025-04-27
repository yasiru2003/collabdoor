
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Organization } from "@/types";

export function useOrganization(organizationId?: string) {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      if (!organizationId && !user) return null;
      
      let query = supabase
        .from("organizations")
        .select("*");
        
      if (organizationId) {
        query = query.eq("id", organizationId);
      } else if (user) {
        query = query.eq("owner_id", user.id);
      }
      
      const { data, error } = await query.single();
      
      if (error) {
        // If no organization is found, return null instead of throwing
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }
      
      return data as Organization;
    },
    enabled: !!(organizationId || user),
  });
  
  return {
    organization: data,
    isLoading,
    error,
  };
}
