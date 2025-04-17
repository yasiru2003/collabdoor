import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProjectPhase } from "@/types";
import { useState } from "react";

/**
 * Hook to fetch project phases
 */
export function useProjectPhases(projectId?: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const fetchProjectPhases = async () => {
    if (!projectId) return [];
    console.log("Fetching project phases for:", projectId);
    
    const { data, error } = await supabase
      .from("project_phases")
      .select("*")
      .eq("project_id", projectId)
      .order("order", { ascending: true });
    
    if (error) {
      console.error("Error fetching project phases:", error);
      throw error;
    }
    
    // Convert database snake_case to camelCase for frontend
    return data.map((phase: any) => ({
      id: phase.id,
      projectId: phase.project_id,
      title: phase.title,
      description: phase.description,
      status: phase.status,
      order: phase.order,
      dueDate: phase.due_date,
      completedDate: phase.completed_date,
      createdAt: phase.created_at,
      updatedAt: phase.updated_at
    })) as ProjectPhase[];
  };

  // Hook to add a new phase for a project
  const addPhase = async (phase: Omit<ProjectPhase, "id" | "createdAt" | "updatedAt">) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("project_phases")
        .insert({
          project_id: phase.projectId,
          title: phase.title,
          description: phase.description,
          due_date: phase.dueDate,
          status: phase.status || 'not-started',
          order: phase.order,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Invalidate project phases query to refetch data
      queryClient.invalidateQueries({ queryKey: ["project-phases", phase.projectId] });
      
      toast({
        title: "Phase added",
        description: "Project phase has been added successfully.",
      });
      
      return data;
    } catch (error: any) {
      console.error("Error adding project phase:", error);
      toast({
        title: "Error adding phase",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Hook to update a phase's status
  const updatePhaseStatus = async (phaseId: string, status: string, completedDate?: string | null) => {
    setIsLoading(true);
    try {
      const updateData: any = { status };
      if (status === 'completed' && !completedDate) {
        updateData.completed_date = new Date().toISOString();
      } else if (completedDate) {
        updateData.completed_date = completedDate;
      }
      
      const { data, error } = await supabase
        .from("project_phases")
        .update(updateData)
        .eq("id", phaseId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Invalidate project phases query to refetch data
      const projectId = data.project_id;
      queryClient.invalidateQueries({ queryKey: ["project-phases", projectId] });
      
      toast({
        title: "Phase updated",
        description: `Phase status updated to ${status}.`,
      });
      
      return data;
    } catch (error: any) {
      console.error("Error updating phase status:", error);
      toast({
        title: "Error updating phase",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const query = useQuery<ProjectPhase[]>({
    queryKey: ["project-phases", projectId],
    queryFn: fetchProjectPhases,
    enabled: !!projectId,
  });

  return {
    data: query.data,
    addPhase,
    updatePhaseStatus,
    isLoading,
    refetch: query.refetch,  // Add the refetch method here
  };
}

// Hook for creating project phases
export function usePhaseCreation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mutation for adding a new phase
  const { mutate: addPhaseMutation } = useMutation({
    mutationFn: async (phase: Omit<ProjectPhase, "id" | "created_at" | "updated_at">) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("project_phases")
        .insert({
          project_id: phase.projectId,
          title: phase.title,
          description: phase.description,
          due_date: phase.dueDate,
          status: phase.status || 'not-started',
          order: phase.order,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-phases", data.project_id] });
      
      toast({
        title: "Phase added",
        description: "Project phase has been added successfully.",
      });
      
      setIsLoading(false);
    },
    onError: (error: any) => {
      console.error("Error adding project phase:", error);
      
      toast({
        title: "Error adding phase",
        description: error.message,
        variant: "destructive",
      });
      
      setIsLoading(false);
    }
  });
  
  const addPhase = (phase: Omit<ProjectPhase, "id" | "created_at" | "updated_at">) => {
    addPhaseMutation(phase);
  };
  
  return {
    addPhase,
    isLoading
  };
}
