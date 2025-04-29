
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SystemSettings } from "@/types";
import { useToast } from "./use-toast";

// Hook to fetch all system settings
export function useSystemSettings() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["system-settings"],
    queryFn: async (): Promise<SystemSettings[]> => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*");
        
      if (error) {
        console.error("Error fetching system settings:", error);
        toast({
          title: "Error",
          description: "Could not load system settings",
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    },
  });
}

// Hook to fetch a specific system setting by key
export function useSystemSetting(key: string) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["system-settings", key],
    queryFn: async (): Promise<SystemSettings | null> => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("key", key)
        .single();
        
      if (error) {
        if (error.code !== "PGRST116") { // Not found error code
          console.error(`Error fetching system setting ${key}:`, error);
          toast({
            title: "Error",
            description: `Could not load setting: ${key}`,
            variant: "destructive",
          });
        }
        return null;
      }
      
      return data;
    },
  });
}

// Hook to update a system setting
export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      value 
    }: { 
      id: string; 
      value: boolean;
    }) => {
      const { data, error } = await supabase
        .from("system_settings")
        .update({ value })
        .eq("id", id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch system settings queries
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      queryClient.invalidateQueries({ queryKey: ["system-settings", data.key] });
      
      toast({
        title: "Setting updated",
        description: `${data.key} has been updated`,
      });
    },
    onError: (error: any) => {
      console.error("Error updating system setting:", error);
      toast({
        title: "Error",
        description: "Failed to update system setting",
        variant: "destructive",
      });
    },
  });
}
