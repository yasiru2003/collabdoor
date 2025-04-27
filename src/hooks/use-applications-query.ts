
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Types for application data
export interface ApplicationWithProfile {
  id: string;
  user_id: string;
  project_id: string;
  status: "pending" | "approved" | "rejected";
  partnership_type: string;
  organization_name: string;
  created_at: string;
  updated_at: string;
  profiles: {
    name: string;
    id: string;
    email?: string;
    profile_image?: string;
  };
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export function useProjectApplicationsQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: ["projectApplications", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          profiles (*)
        `)
        .eq("project_id", projectId);

      if (error) {
        console.error("Error fetching project applications:", error);
        return [];
      }
      
      return data as unknown as ApplicationWithProfile[];
    },
    enabled: !!projectId
  });
}

export function useProjectApplications(projectId?: string) {
  const result = useProjectApplicationsQuery(projectId);
  
  return {
    applications: result.data || [],
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch
  };
}

export function useUserApplications(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["userApplications", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          projects(*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user applications:", error);
        toast({
          title: "Error fetching applications",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data;
    },
    enabled: !!userId
  });
}
