
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useLocations() {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching locations:", error);
        toast({
          title: "Error fetching locations",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  return { locations: data, isLoading, error };
}
