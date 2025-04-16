
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { toast as sonnerToast } from "sonner";
import { ProjectPhase } from "@/types";

export function useProjectPhases() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getProjectPhases = async (projectId: string) => {
    if (!projectId) return [];
    
    try {
      const { data, error } = await supabase
        .from("project_phases")
        .select("*")
        .eq("project_id", projectId)
        .order("order", { ascending: true });

      if (error) {
        console.error("Error fetching project phases:", error);
        throw error;
      }

      return data || [];
    } catch (error: any) {
      toast({
        title: "Error fetching project phases",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return [];
    }
  };

  const addProjectPhase = async (projectId: string, phase: Omit<ProjectPhase, 'id'>) => {
    if (!projectId) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("project_phases")
        .insert({
          project_id: projectId,
          title: phase.title,
          description: phase.description,
          status: phase.status,
          due_date: phase.dueDate,
          order: phase.order,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding project phase:", error);
        throw error;
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["projectPhases", projectId],
      });

      sonnerToast.success("Phase added", {
        description: "New project phase has been added",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error adding project phase",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectPhase = async (phaseId: string, updates: Partial<ProjectPhase>) => {
    if (!phaseId) return null;
    
    setIsLoading(true);
    try {
      // Convert from camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if ('dueDate' in updates) dbUpdates.due_date = updates.dueDate;
      if ('completedDate' in updates) dbUpdates.completed_date = updates.completedDate;
      if (updates.order !== undefined) dbUpdates.order = updates.order;

      const { data, error } = await supabase
        .from("project_phases")
        .update(dbUpdates)
        .eq("id", phaseId)
        .select()
        .single();

      if (error) {
        console.error("Error updating project phase:", error);
        throw error;
      }

      // Get project ID to invalidate queries
      const projectId = data.project_id;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["projectPhases", projectId],
      });

      sonnerToast.success("Phase updated", {
        description: "Project phase has been updated",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error updating project phase",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProjectPhase = async (phaseId: string, projectId: string) => {
    if (!phaseId) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("project_phases")
        .delete()
        .eq("id", phaseId);

      if (error) {
        console.error("Error deleting project phase:", error);
        throw error;
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["projectPhases", projectId],
      });

      sonnerToast.success("Phase deleted", {
        description: "Project phase has been removed",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting project phase",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getProjectPhases,
    addProjectPhase,
    updateProjectPhase,
    deleteProjectPhase,
  };
}
