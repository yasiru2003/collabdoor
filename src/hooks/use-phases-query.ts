import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectPhase } from "@/types";

export function useProjectPhases(projectId?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["project-phases", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("project_phases")
        .select("*")
        .eq("project_id", projectId)
        .order("order", { ascending: true });

      if (error) throw error;
      return data as ProjectPhase[];
    },
    enabled: !!projectId,
  });

  return {
    phases: data || [],
    isLoading,
    error,
    refetch,
  };
}

export function useProjectPhaseActions(projectId?: string) {
  const queryClient = useQueryClient();

  const createPhase = useMutation({
    mutationFn: async (phase: Omit<ProjectPhase, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("project_phases")
        .insert({
          project_id: phase.project_id,
          title: phase.title,
          description: phase.description,
          status: phase.status,
          order: phase.order,
          dueDate: phase.dueDate,
          completedDate: phase.completedDate,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProjectPhase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-phases", projectId] });
    },
  });

  const updatePhase = useMutation({
    mutationFn: async (phase: ProjectPhase) => {
      const { data, error } = await supabase
        .from("project_phases")
        .update({
          title: phase.title,
          description: phase.description,
          status: phase.status,
          order: phase.order,
          dueDate: phase.dueDate,
          completedDate: phase.completedDate,
        })
        .eq("id", phase.id)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectPhase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-phases", projectId] });
    },
  });

  const deletePhase = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("project_phases")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-phases", projectId] });
    },
  });

  return {
    createPhase: createPhase.mutateAsync,
    updatePhase: updatePhase.mutateAsync,
    deletePhase: deletePhase.mutateAsync,
    isCreating: createPhase.isPending,
    isUpdating: updatePhase.isPending,
    isDeleting: deletePhase.isPending,
  };
}
