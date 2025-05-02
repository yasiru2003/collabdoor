import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types";

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
        .select(`
          *,
          profiles!projects_organizer_id_fkey(id, name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error fetching projects",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Map the raw data to Project objects
      return data?.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        organizerId: project.organizer_id,
        organizerName: project.profiles?.name || "Unknown",
        organizationId: project.organization_id,
        organizationName: project.organization_name,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        image: project.image,
        location: project.location,
        timeline: {
          start: project.start_date,
          end: project.end_date
        },
        requiredSkills: project.required_skills,
        partnershipTypes: project.partnership_types,
        category: project.category,
        applicationsEnabled: project.applications_enabled,
        completedAt: project.completed_at
      })) || [];
    }
  });
}

/**
 * Hook to fetch a specific project by ID
 */
export function useProject(projectId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      
      // Validate UUID format
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
      if (!isValidUuid) {
        console.error("Error fetching project: Invalid UUID format", projectId);
        throw new Error("Invalid project ID format");
      }
      
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles!projects_organizer_id_fkey(id, name, email)
        `)
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error fetching project",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Map the raw data to a Project object
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        organizerId: data.organizer_id,
        organizerName: data.profiles?.name || "Unknown",
        organizationId: data.organization_id,
        organizationName: data.organization_name,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        image: data.image,
        location: data.location,
        timeline: {
          start: data.start_date,
          end: data.end_date
        },
        requiredSkills: data.required_skills,
        partnershipTypes: data.partnership_types,
        category: data.category,
        applicationsEnabled: data.applications_enabled,
        completedAt: data.completed_at,
        proposalFilePath: data.proposal_file_path
      } as Project;
    },
    enabled: !!projectId
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
        .select(`
          *,
          profiles!projects_organizer_id_fkey(id, name, email)
        `)
        .eq("organizer_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user projects:", error);
        toast({
          title: "Error fetching projects",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Map the raw data to Project objects
      return data?.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        organizerId: project.organizer_id,
        organizerName: project.profiles?.name || "Unknown",
        organizationId: project.organization_id,
        organizationName: project.organization_name,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        image: project.image,
        location: project.location,
        timeline: {
          start: project.start_date,
          end: project.end_date
        },
        requiredSkills: project.required_skills,
        partnershipTypes: project.partnership_types,
        category: project.category,
        applicationsEnabled: project.applications_enabled,
        completedAt: project.completed_at
      })) || [];
    },
    enabled: !!userId
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
          project_id,
          projects:project_id(
            *,
            profiles!projects_organizer_id_fkey(id, name, email)
          )
        `)
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching saved projects:", error);
        toast({
          title: "Error fetching saved projects",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Map the raw data to Project objects
      return data?.map(item => {
        const project = item.projects;
        return {
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status,
          organizerId: project.organizer_id,
          organizerName: project.profiles?.name || "Unknown",
          organizationId: project.organization_id,
          organizationName: project.organization_name,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          image: project.image,
          location: project.location,
          timeline: {
            start: project.start_date,
            end: project.end_date
          },
          requiredSkills: project.required_skills,
          partnershipTypes: project.partnership_types,
          category: project.category,
          applicationsEnabled: project.applications_enabled,
          completedAt: project.completed_at
        };
      }) || [];
    },
    enabled: !!userId
  });
}

/**
 * Hook to fetch all active (non-completed) projects
 * This is used for the explore tab to only show active projects
 */
export function useActiveProjects() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["activeProjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles!projects_organizer_id_fkey(id, name, email)
        `)
        .neq("status", "completed")
        .eq("status", "published")  // Only show published projects (not pending_publish or draft)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching active projects:", error);
        toast({
          title: "Error fetching projects",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Map the raw data to Project objects
      return data?.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        organizerId: project.organizer_id,
        organizerName: project.profiles?.name || "Unknown",
        organizationId: project.organization_id,
        organizationName: project.organization_name,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        image: project.image,
        location: project.location,
        timeline: {
          start: project.start_date,
          end: project.end_date
        },
        requiredSkills: project.required_skills,
        partnershipTypes: project.partnership_types,
        category: project.category,
        applicationsEnabled: project.applications_enabled
      })) || [];
    }
  });
}
