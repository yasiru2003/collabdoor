
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Organization } from "@/types";
import { mapSupabaseOrgToOrganization } from "@/utils/data-mappers";
import { useAuth } from "@/hooks/use-auth";

export function useUserOrganizations() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["userOrganizations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Get organizations where user is a member (including as owner)
        const { data, error } = await supabase
          .from("organization_members")
          .select(`
            organization_id,
            role,
            organizations:organization_id(*)
          `)
          .eq("user_id", user.id);

        if (error) throw error;
        
        // Map the data to the expected format
        return data.map(item => mapSupabaseOrgToOrganization(item.organizations));
      } catch (error: any) {
        console.error("Error fetching user organizations:", error);
        toast({
          title: "Error fetching organizations",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!user
  });
}
