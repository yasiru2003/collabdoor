
import { supabase } from "@/integrations/supabase/client";
import { ApplicationWithProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useProjectApplications as useProjectApplicationsHook } from "@/hooks/use-applications-query";

export function useProjectApplications() {
  const { toast } = useToast();
  const projectApplicationsResult = useProjectApplicationsHook();
  
  // Add the missing methods that are used in project-card.tsx
  const checkApplicationStatus = async (projectId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from("project_applications")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error checking application status:", error);
      return null;
    }
  };

  const applyToProject = async (
    projectId: string,
    userId: string,
    partnershipType: string,
    message: string,
    organizationId?: string | null
  ) => {
    try {
      let organizationName = null;
      
      // If organization ID is provided, get the organization name
      if (organizationId) {
        const { data: orgData } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", organizationId)
          .single();
          
        if (orgData) {
          organizationName = orgData.name;
        }
      }
      
      // Create the application
      const { data, error } = await supabase
        .from("project_applications")
        .insert({
          project_id: projectId,
          user_id: userId,
          partnership_type: partnershipType,
          message: message,
          organization_id: organizationId || null,
          organization_name: organizationName,
          status: "pending"
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully.",
      });
      
      return data[0];
    } catch (error: any) {
      console.error("Error applying to project:", error);
      
      toast({
        title: "Error submitting application",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      return null;
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("project_applications")
        .update({ status })
        .eq("id", applicationId);
      
      if (error) throw error;
      
      // Refetch applications after update
      projectApplicationsResult.refetch();
      
      return true;
    } catch (error: any) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error updating application",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
      return false;
    }
  };

  // Combine the original result with our new methods
  return {
    ...projectApplicationsResult,
    checkApplicationStatus,
    applyToProject,
    updateApplicationStatus
  };
}

