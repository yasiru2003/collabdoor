
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PartnershipType, ApplicationWithProfile } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyNewApplicant } from "@/services/notification-service";

// Define and export ApplicationStatus type
export type ApplicationStatus = "pending" | "approved" | "rejected";

/**
 * Hook to fetch all project applications for a specific project
 */
export function useProjectApplicationsQuery(projectId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery<ApplicationWithProfile[]>({
    queryKey: ["projectApplications", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      // Validate UUID format
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
      if (!isValidUuid) {
        console.error("Error fetching project applications: Invalid UUID format", projectId);
        return [];
      }
      
      console.log("Fetching project applications for:", projectId);
      
      // First, get the applications
      const { data, error } = await supabase
        .from("project_applications")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching project applications:", error);
        toast({
          title: "Error fetching applications",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      // If no applications, return empty array
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get all user IDs from applications
      const userIds = data.map(app => app.user_id);
      
      // Fetch user profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email, profile_image, skills")
        .in("id", userIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          title: "Error fetching profiles",
          description: profilesError.message,
          variant: "destructive",
        });
      }
      
      // Create a map of profiles by user ID for easy lookup
      const profilesMap = (profiles || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {} as Record<string, any>);
      
      // Transform data to match ApplicationWithProfile
      return data.map(app => ({
        ...app,
        profile: profilesMap[app.user_id] || {
          name: "Unknown User",
          email: "unknown@example.com"
        }
      })) as ApplicationWithProfile[];
    },
    enabled: !!projectId
  });
}

/**
 * Hook for project application operations
 */
export function useProjectApplications() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

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
      // Validate UUID format
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
      if (!isValidUuid) {
        console.error("Error checking application status: Invalid UUID format", projectId);
        return null;
      }
      
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
      // Validate UUID format
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
      if (!isValidUuid) {
        toast({
          title: "Application failed",
          description: "Invalid project ID format",
          variant: "destructive",
        });
        return null;
      }
      
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
      
      // Invalidate project applications query to refresh data
      queryClient.invalidateQueries({ queryKey: ["projectApplications", projectId] });

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
  const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      // Get application details before updating
      const { data: application, error: fetchError } = await supabase
        .from("project_applications")
        .select("*, projects(title, organizer_id, id)")
        .eq("id", applicationId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      if (!application) {
        throw new Error("Application not found");
      }

      // Update application status
      const { error } = await supabase
        .from("project_applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) throw error;

      // If application is approved, try to create partnership record
      let partnershipCreated = false;
      if (status === "approved") {
        try {
          // Get current user to verify permissions
          const { data: currentUser } = await supabase.auth.getUser();
          
          // Verify user is authorized to create partnership (check if user is project organizer)
          if (currentUser?.user?.id !== application.projects?.organizer_id) {
            console.warn("User is not the project organizer. Partnership creation may fail due to RLS.");
          }
          
          // Attempt to create partnership record
          const { data: partnership, error: partnershipError } = await supabase
            .from("partnerships")
            .insert({
              project_id: application.project_id,
              partner_id: application.user_id,
              partnership_type: application.partnership_type as PartnershipType,
              organization_id: application.organization_id,
              status: "active"
            })
            .select();

          if (partnershipError) {
            console.error("Error creating partnership:", partnershipError);
            partnershipCreated = false;
          } else {
            partnershipCreated = true;
          }
        } catch (partnershipError) {
          console.error("Exception creating partnership:", partnershipError);
          partnershipCreated = false;
        }
        
        // Show appropriate message based on partnership creation result
        if (!partnershipCreated) {
          toast({
            title: "Application approved with warning",
            description: "The application status was updated but there was an issue creating the partnership record. Please check your database permissions.",
            variant: "default"
          });
        }
      }

      // Try to send notification to applicant
      try {
        const notificationTitle = status === "approved" 
          ? "Application Approved" 
          : "Application Rejected";
          
        const notificationMessage = status === "approved"
          ? `Your application to join the project "${application.projects?.title}" has been approved.`
          : `Your application to join the project "${application.projects?.title}" has been rejected.`;

        // Create notification
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: application.user_id,
            title: notificationTitle,
            message: notificationMessage,
            link: status === "approved" ? `/projects/${application.project_id}` : null,
            read: false
          });

        if (notificationError) {
          console.error("Error creating notification:", notificationError);
          // Continue execution even if notification fails
        }
      } catch (notificationError) {
        console.error("Exception creating notification:", notificationError);
        // Continue execution even if notification fails
      }

      // Invalidate queries to refresh data
      if (application.project_id) {
        queryClient.invalidateQueries({ queryKey: ["projectApplications", application.project_id] });
        queryClient.invalidateQueries({ queryKey: ["partnerships"] });
        queryClient.invalidateQueries({ queryKey: ["project", application.project_id] });
      }

      toast({
        title: "Application updated",
        description: `The application has been ${status}.`,
      });

      return true;
    } catch (error: any) {
      console.error("Error updating application:", error);
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
