
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationWithProfile } from "@/types";

export const useProjectApplicationsQuery = (projectId?: string) => {
  return useQuery({
    queryKey: ["project-applications", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      // Use the correct table name for project applications
      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          id,
          user_id,
          project_id,
          status,
          partnership_type,
          created_at,
          organizations(name),
          profiles!project_applications_user_id_fkey (
            id,
            name,
            email,
            profile_image
          )
        `)
        .eq("project_id", projectId);

      if (error) {
        throw new Error(error.message);
      }

      // Map the data to the ApplicationWithProfile type properly
      const applicationsWithProfile: ApplicationWithProfile[] = data.map((application) => ({
        id: application.id,
        user_id: application.user_id,
        project_id: application.project_id,
        status: application.status,
        partnership_type: application.partnership_type,
        organization_name: application.organizations?.name,
        created_at: application.created_at,
        profile: application.profiles,
        profiles: application.profiles
      }));

      return applicationsWithProfile;
    },
    enabled: !!projectId,
  });
};

export type ApplicationStatus = "pending" | "approved" | "rejected";

export const useProjectApplications = () => {
  const checkApplicationStatus = async (projectId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from("project_applications")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .single();

      if (error) {
        // If no application is found, the Supabase client returns an error
        // In this case, we want to return null to indicate that the user has not applied
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error("Error checking application status:", error);
      throw error;
    }
  };

  const applyToProject = async (
    projectId: string,
    userId: string,
    partnershipType: string,
    message: string,
    organizationId: string | null
  ) => {
    try {
      const { data, error } = await supabase
        .from("project_applications")
        .insert([
          {
            project_id: projectId,
            user_id: userId,
            partnership_type: partnershipType,
            message: message,
            organization_id: organizationId,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error("Error applying to project:", error);
      throw error;
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    try {
      const { data, error } = await supabase
        .from("project_applications")
        .update({ status })
        .eq("id", applicationId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error("Error updating application status:", error);
      throw error;
    }
  };

  const userOrganizations = useQuery({
    queryKey: ["user-organizations"],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const userId = session?.data?.session?.user?.id;
      
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("organization_members")
        .select(`*, organizations(*)`)
        .eq("user_id", userId);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  return {
    checkApplicationStatus,
    applyToProject,
    updateApplicationStatus,
    userOrganizations: userOrganizations.data,
    isLoading: userOrganizations.isLoading,
    error: userOrganizations.error,
  };
};
