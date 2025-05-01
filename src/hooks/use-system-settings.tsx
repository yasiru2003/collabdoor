
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SystemSettings } from "@/types";

export function useSystemSetting(key: string) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['system_settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', key)
        .single();
      
      if (error) {
        // If the setting doesn't exist yet, don't throw an error
        if (error.code === 'PGRST116') {
          return { key, value: false, description: '' };
        }
        
        console.error("Error fetching system setting:", error);
        toast({
          title: "Error fetching setting",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as SystemSettings;
    }
  });
}

export function useUpdateSystemSetting() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      key, 
      value, 
      description 
    }: { 
      key: string; 
      value: boolean; 
      description?: string;
    }) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          key, 
          value,
          description
        }, { 
          onConflict: 'key',
          ignoreDuplicates: false
        });

      if (error) throw error;
      
      return { key, value, description };
    },
    onSuccess: (data) => {
      toast({
        title: "Setting updated",
        description: "The system setting has been updated successfully."
      });
      
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['system_settings', data.key] });
      queryClient.invalidateQueries({ queryKey: ['system_settings'] });
    },
    onError: (error: any) => {
      console.error("Error updating setting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update setting",
        variant: "destructive"
      });
    }
  });
}
