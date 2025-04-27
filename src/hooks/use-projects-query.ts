import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project, ApplicationWithProfile } from "@/types";
import { mapSupabaseProjectToProject } from "@/utils/data-mappers";

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*");
      if (error) {
        throw new Error(error.message);
      }
      return data.map(mapSupabaseProjectToProject);
    },
  });
};

export const usePublicProjects = () => {
  return useQuery({
    queryKey: ["public-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "published");
      if (error) {
        throw new Error(error.message);
      }
      return data.map(mapSupabaseProjectToProject);
    },
  });
};

export const useUserProjects = (userId: string) => {
  return useQuery({
    queryKey: ["user-projects", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("organizer_id", userId);
      if (error) {
        throw new Error(error.message);
      }
      return data.map(mapSupabaseProjectToProject);
    },
    enabled: !!userId,
  });
};

// Adding this for compatibility with existing code
export const useActiveProjects = useUserProjects;

export const useProject = (id?: string) => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("projects")
        .select(`*, profiles(name)`)
        .eq("id", id)
        .single();

      if (error) {
        console.log("Error fetching project", error);
        throw new Error(error.message);
      }

      // Map the Supabase response to your Project type
      const project = mapSupabaseProjectToProject({
        ...data,
        organizer_name: data.profiles?.name, // Populate organizerName from the profiles table
      });

      return project;
    },
    enabled: !!id,
  });
};

export type ApplicationStatus = "pending" | "approved" | "rejected";

export const useProjectApplications = () => {
  // Move implementation to use-applications-query.ts
  // This is just a stub to maintain compatibility with existing code
  return {
    checkApplicationStatus: async () => null,
    applyToProject: async () => null,
    updateApplicationStatus: async () => null,
    userOrganizations: null,
    isLoading: false,
    error: null,
  };
};

// Removed the useProjectApplicationsQuery as it's moved to use-applications-query.ts

// Add useProjectApplicationsQuery as an alias for backward compatibility
export { useProjectApplicationsQuery } from './use-applications-query';

export const useSavedProjects = (userId: string) => {
  return useQuery({
    queryKey: ["saved-projects", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_projects")
        .select("project_id, projects(*)")
        .eq("user_id", userId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.map((item) => mapSupabaseProjectToProject(item.projects));
    },
    enabled: !!userId,
  });
};
