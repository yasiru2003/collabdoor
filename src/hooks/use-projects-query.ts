
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mapSupabaseProjectToProject } from "@/utils/data-mappers";
import { handleSupabaseError } from "./use-supabase-utils";

/**
 * Hook to fetch all projects
 */
export function useProjects() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles(name)")
        .order("created_at", { ascending: false });

      handleSupabaseError(error, "Error fetching projects", toast);

      return (data || []).map(project => {
        const mappedProject = mapSupabaseProjectToProject(project);
        mappedProject.organizerName = project.profiles?.name || "Unknown";
        return mappedProject;
      });
    },
  });
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(id: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles(name)")
        .eq("id", id)
        .single();

      handleSupabaseError(error, "Error fetching project", toast);

      const mappedProject = mapSupabaseProjectToProject(data);
      mappedProject.organizerName = data.profiles?.name || "Unknown";
      return mappedProject;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch projects created by a specific user
 */
export function useUserProjects(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["userProjects", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles(name)")
        .eq("organizer_id", userId)
        .order("created_at", { ascending: false });

      handleSupabaseError(error, "Error fetching user projects", toast);

      return (data || []).map(project => {
        const mappedProject = mapSupabaseProjectToProject(project);
        mappedProject.organizerName = project.profiles?.name || "Unknown";
        return mappedProject;
      });
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch projects saved by a specific user
 */
export function useSavedProjects(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["savedProjects", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("saved_projects")
        .select(`
          *,
          projects(*, profiles(name))
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      handleSupabaseError(error, "Error fetching saved projects", toast);

      return (data || []).map(savedProject => {
        if (!savedProject.projects) return null;
        const mappedProject = mapSupabaseProjectToProject(savedProject.projects);
        mappedProject.organizerName = savedProject.projects.profiles?.name || "Unknown";
        return mappedProject;
      }).filter(Boolean);
    },
    enabled: !!userId,
  });
}
