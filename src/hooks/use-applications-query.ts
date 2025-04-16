import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { handleSupabaseError } from "./use-supabase-utils";

/**
 * Hook to fetch all applications for a specific project
 */
export function useProjectApplications(projectId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["projectApplications", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      console.log("Fetching project applications for:", projectId);
      
      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          profiles(id, name, email, profile_image)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching project applications:", error);
        toast({
          title: "Error fetching project applications",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("Project applications fetched:", data);
      return data || [];
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch all applications made by a specific user
 */
export function useUserApplications(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["userApplications", userId],
    queryFn: async () => {
      if (!userId) return [];

      console.log("Fetching user applications for:", userId);
      
      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          projects(*, profiles(name))
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user applications:", error);
        toast({
          title: "Error fetching user applications",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("User applications fetched:", data);
      
      // Keep the original project data structure rather than trying to map it
      // This maintains compatibility with the existing code
      return data || [];
    },
    enabled: !!userId,
  });
}
