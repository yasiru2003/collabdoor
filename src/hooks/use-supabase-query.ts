import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// This file now serves as a central export point for all query hooks
// to maintain backward compatibility with existing code

export {
  useProjects,
  useProject,
  useUserProjects,
  useSavedProjects,
} from "./use-projects-query";

export {
  usePartners,
  usePartnerships,
} from "./use-organizations-query";

export {
  useMessages,
  useConversation,
} from "./use-messages-query";

export {
  useProjectApplicationsQuery as useProjectApplications,
  useProjectApplications as useProjectApplicationsActions,
} from "./use-applications-query";

export {
  useProjectPhases,
} from "./use-phases-query";

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

// Add useUserApplications to the exports
export { useUserApplications };
