
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePartnershipTypes() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["partnership-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_types")
        .select("*")
        .order("name", { ascending: true });
        
      if (error) throw error;
      return data;
    },
  });
  
  return {
    partnershipTypes: data || [],
    isLoading,
    error,
  };
}
