
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Organization } from "@/types";
import { mapSupabaseOrgToOrganization } from "@/utils/data-mappers";

export function useOrganization() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["organization", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching organization:", error);
        toast({
          title: "Error fetching organization",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      if (!data) return null;

      return mapSupabaseOrgToOrganization(data);
    },
    enabled: !!user?.id,
  });

  return { 
    organization: data as Organization | null, 
    isLoading, 
    error,
    refetch
  };
}
