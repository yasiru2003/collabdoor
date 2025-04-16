
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { handleSupabaseError } from "./use-supabase-utils";
import { ApplicationWithProfile } from "@/types";

/**
 * Hook to fetch all applications for a specific project
 */
export function useProjectApplications(projectId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["projectApplications", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      console.log("Fetching project applications for:", projectId);
      
      // Modified query to avoid using the direct join to profiles
      // Instead, get the user_id from project_applications and then fetch profiles separately
      const { data: applications, error } = await supabase
        .from("project_applications")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching project applications:", error);
        toast({
          title: "Error fetching project applications",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // If we have applications, fetch the profile details for each applicant
      if (applications && applications.length > 0) {
        // Get all user IDs
        const userIds = applications.map(app => app.user_id);
        
        // Fetch profile details for all applicants in one query
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, email, profile_image")
          .in("id", userIds);
          
        if (profilesError) {
          console.error("Error fetching applicant profiles:", profilesError);
          toast({
            title: "Error fetching applicant profiles",
            description: profilesError.message,
            variant: "destructive",
          });
        }
        
        // Map profiles to applications
        if (profilesData) {
          // Create a map for quick lookup of profiles by ID
          const profilesMap = profilesData.reduce((map, profile) => {
            map[profile.id] = profile;
            return map;
          }, {} as Record<string, any>);
          
          // Add profiles data to each application
          const applicationsWithProfiles: ApplicationWithProfile[] = applications.map(application => ({
            ...application,
            profiles: profilesMap[application.user_id] || null
          }));
          
          return applicationsWithProfiles;
        }
      }
      
      // Ensure we always return objects that conform to the ApplicationWithProfile type
      // by adding the profiles property (as null) to each application
      const typedApplications: ApplicationWithProfile[] = applications?.map(app => ({
        ...app,
        profiles: null
      })) || [];
      
      console.log("Project applications fetched:", typedApplications);
      return typedApplications;
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch all applications made by a specific user
 */
export function useUserApplications(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["userApplications", userId],
    queryFn: async () => {
      if (!userId) return [];

      console.log("Fetching user applications for:", userId);
      
      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          projects(*, profiles(name))
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user applications:", error);
        toast({
          title: "Error fetching user applications",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("User applications fetched:", data);
      
      // Keep the original project data structure rather than trying to map it
      // This maintains compatibility with the existing code
      return data || [];
    },
    enabled: !!userId,
  });
}
