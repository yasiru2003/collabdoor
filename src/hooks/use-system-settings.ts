
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SystemSettings } from "@/types";

/**
 * Hook to fetch system settings
 */
export function useSystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const query = useQuery<SystemSettings[]>({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*");

      if (error) {
        console.error("Error fetching system settings:", error);
        toast({
          title: "Error fetching system settings",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as SystemSettings[];
    }
  });

  const updateSetting = useMutation<
    { key: string; value: boolean }, 
    Error, 
    { key: string; value: boolean }
  >({
    mutationFn: async ({ key, value }) => {
      // Check if setting exists
      const { data: existingSetting } = await supabase
        .from("system_settings")
        .select("*")
        .eq("key", key)
        .maybeSingle();
      
      if (existingSetting) {
        // Update existing setting
        const { error } = await supabase
          .from("system_settings")
          .update({ value })
          .eq("key", key);
        
        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from("system_settings")
          .insert({ key, value });
        
        if (error) throw error;
      }
      
      return { key, value };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast({
        title: "Setting updated",
        description: "The system setting has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating setting",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    settings: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    updateSetting,
  };
}
