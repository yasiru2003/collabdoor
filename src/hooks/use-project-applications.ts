
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PartnershipType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { notifyNewApplicant } from "@/services/notification-service";

export function useProjectApplications() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Get user's organization memberships
  const { data: userOrganizations } = useQuery({
    queryKey: ["user-organizations"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];
      
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          *,
          organizations (
            id,
            name
          )
        `)
        .eq("user_id", userData.user.id);
        
      if (error) {
        console.error("Error fetching user organizations:", error);
        return [];
      }
      
      return data || [];
    }
  });

  // Check if user has already applied to a project
  const checkApplicationStatus = async (projectId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from("project_applications")
        .select("id, status")
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

  // Apply to project 
  const applyToProject = async (
    projectId: string, 
    userId: string, 
    partnershipType: PartnershipType, 
    message: string,
    organizationId?: string | null
  ) => {
    setIsLoading(true);
    
    try {
      let organizationName = null;
      
      // If applying with an organization, get its name
      if (organizationId) {
        const organizationMembership = userOrganizations?.find(
          (org) => org.organizations?.id === organizationId
        );
        organizationName = organizationMembership?.organizations?.name || null;
      }
      
      // Create application
      const { data, error } = await supabase
        .from("project_applications")
        .insert({
          project_id: projectId,
          user_id: userId,
          partnership_type: partnershipType,
          message,
          organization_id: organizationId || null,
          organization_name: organizationName
        })
        .select()
        .single();

      if (error) throw error;

      // Get project organizer to send notification
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("organizer_id, title")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      // Send notification to project organizer
      await notifyNewApplicant(project.organizer_id, userId, project.title, organizationName);

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update application status
  const updateApplicationStatus = async (applicationId: string, status: "approved" | "rejected") => {
    try {
      // Get application details before updating
      const { data: application, error: fetchError } = await supabase
        .from("project_applications")
        .select("*, projects(title, organizer_id)")
        .eq("id", applicationId)
        .single();

      if (fetchError) throw fetchError;

      // Update application status
      const { error } = await supabase
        .from("project_applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) throw error;

      if (status === "approved") {
        // Create partnership record
        const { error: partnershipError } = await supabase
          .from("partnerships")
          .insert({
            project_id: application.project_id,
            partner_id: application.user_id,
            partnership_type: application.partnership_type,
            organization_id: application.organization_id,
            status: "active"
          });

        if (partnershipError) throw partnershipError;
      }

      // Send notification to applicant
      const notificationTitle = status === "approved" 
        ? "Application Approved" 
        : "Application Rejected";
        
      const notificationMessage = status === "approved"
        ? `Your application to join the project "${application.projects.title}" has been approved.`
        : `Your application to join the project "${application.projects.title}" has been rejected.`;

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: application.user_id,
          title: notificationTitle,
          message: notificationMessage,
          link: status === "approved" ? `/projects/${application.project_id}` : null,
          read: false
        });

      if (notificationError) throw notificationError;

      toast({
        title: "Application updated",
        description: `The application has been ${status}.`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error updating application",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    checkApplicationStatus,
    applyToProject,
    updateApplicationStatus,
    isLoading,
    userOrganizations
  };
}
