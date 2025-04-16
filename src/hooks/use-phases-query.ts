
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
      
      // Check if projectId is a valid UUID
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
      if (!isValidUuid) {
        console.warn(`Invalid UUID format for project ID: ${projectId}`);
        return [];
      }

      console.log("Fetching project phases for:", projectId);
      
      try {
        const { data, error } = await supabase
          .from("project_phases")
          .select("*")
          .eq("project_id", projectId)
          .order("order", { ascending: true });

        handleSupabaseError(error, "Error fetching project phases", toast);
        
        return (data || []).map(phase => ({
          id: phase.id,
          projectId: phase.project_id,
          project_id: phase.project_id, // Keep for compatibility
          title: phase.title,
          description: phase.description,
          status: phase.status,
          dueDate: phase.due_date,
          completedDate: phase.completed_date,
          due_date: phase.due_date, // Keep for compatibility
          completed_date: phase.completed_date, // Keep for compatibility
          order: phase.order,
          createdAt: phase.created_at,
          updatedAt: phase.updated_at,
          created_at: phase.created_at, // Keep for compatibility
          updated_at: phase.updated_at, // Keep for compatibility
        })) as ProjectPhase[];
      } catch (error) {
        console.error("Error fetching project phases:", error);
        return [];
      }
    },
    enabled: !!projectId,
  });
}
