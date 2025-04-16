
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { handleSupabaseError } from "./use-supabase-utils";
import { ProjectPhase } from "@/types";

/**
 * Hook to fetch all phases for a specific project
 */
export function useProjectPhases(projectId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["projectPhases", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      console.log("Fetching project phases for:", projectId);
      
      const { data, error } = await supabase
        .from("project_phases")
        .select("*")
        .eq("project_id", projectId)
        .order("order", { ascending: true });

      handleSupabaseError(error, "Error fetching project phases", toast);
      
      return (data || []).map(phase => ({
        id: phase.id,
        project_id: phase.project_id,
        title: phase.title,
        description: phase.description,
        status: phase.status,
        dueDate: phase.due_date,
        completedDate: phase.completed_date,
        order: phase.order,
      })) as ProjectPhase[];
    },
    enabled: !!projectId,
  });
}
