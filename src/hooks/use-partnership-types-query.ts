
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePartnershipTypes() {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["partnership-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_types")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching partnership types:", error);
        toast({
          title: "Error fetching partnership types",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  return { partnershipTypes: data, isLoading, error };
}
