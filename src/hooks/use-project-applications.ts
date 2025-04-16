import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectPhase } from "@/types";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface ProjectApplication {
  id: string;
  project_id: string;
  user_id: string;
  status: ApplicationStatus;
  partnership_type: string;
  message?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    email: string;
    profile_image?: string;
  };
}

export function useProjectApplications() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has applied to a project
  const checkApplicationStatus = async (projectId: string, userId: string) => {
    if (!userId || !projectId) return null;
    
    try {
      // Ensure projectId is a valid UUID before making the request
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
      
      if (!isValidUUID) {
        console.log(`Invalid project ID format: ${projectId}`);
        return null;
      }
      
      const { data, error } = await supabase
        .from("project_applications")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned" error
        console.error("Error checking application status:", error);
        return null;
      }

      return data as ProjectApplication | null;
    } catch (error) {
      console.error("Error checking application status:", error);
      return null;
    }
  };

  // Apply to a project
  const applyToProject = async (
    projectId: string, 
    userId: string, 
    partnershipType: string,
    message: string = ""
  ) => {
    if (!userId || !projectId) {
      toast({
        title: "Error",
        description: "You must be logged in to apply for a project",
        variant: "destructive",
      });
      return null;
    }

    // Ensure projectId is a valid UUID before making the request
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
    
    if (!isValidUUID) {
      toast({
        title: "Invalid Project",
        description: "Cannot apply to this project due to an invalid project ID",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Check if already applied
      const existingApplication = await checkApplicationStatus(projectId, userId);
      if (existingApplication) {
        setIsLoading(false);
        toast({
          title: "Already Applied",
          description: "You have already applied to this project",
        });
        return existingApplication;
      }

      // Create new application
      const { data, error } = await supabase
        .from("project_applications")
        .insert({
          project_id: projectId,
          user_id: userId,
          partnership_type: partnershipType,
          message: message,
        })
        .select()
        .single();

      if (error) {
        console.error("Error applying to project:", error);
        throw error;
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["projectApplications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userApplications"],
      });

      sonnerToast.success("Application submitted", {
        description: "Your application has been successfully submitted",
      });

      return data as ProjectApplication;
    } catch (error: any) {
      toast({
        title: "Error applying to project",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get applications for a project (for organizers)
  const getProjectApplications = async (projectId: string) => {
    if (!projectId) return [];
    
    try {
      // Use a simpler query structure that doesn't rely on explicit foreign key relationships
      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          profiles:profiles!user_id(name, email, profile_image)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching project applications:", error);
        throw error;
      }

      return data || [];
    } catch (error: any) {
      toast({
        title: "Error fetching applications",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return [];
    }
  };

  // Get applications by a user (for partners)
  const getUserApplications = async (userId: string) => {
    if (!userId) return [];
    
    try {
      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          projects:projects!project_id(*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user applications:", error);
        throw error;
      }

      return data || [];
    } catch (error: any) {
      toast({
        title: "Error fetching your applications",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return [];
    }
  };

  const updateApplicationStatus = async (
    applicationId: string, 
    status: ApplicationStatus
  ) => {
    if (!applicationId) return null;
    
    setIsLoading(true);
    try {
      // First, get the application details
      const { data: applicationData, error: fetchError } = await supabase
        .from("project_applications")
        .select("project_id, partnership_type")
        .eq("id", applicationId)
        .single();

      if (fetchError) {
        console.error("Error fetching application details:", fetchError);
        throw fetchError;
      }

      // Update the application status
      const { data, error } = await supabase
        .from("project_applications")
        .update({ status })
        .eq("id", applicationId)
        .select()
        .single();

      if (error) {
        console.error("Error updating application status:", error);
        throw error;
      }

      // If the application is approved, create initial project phases
      if (status === "approved") {
        await createInitialProjectPhases(applicationData.project_id, applicationData.partnership_type);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["projectApplications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userApplications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["projectPhases", applicationData.project_id],
      });

      sonnerToast.success("Application updated", {
        description: `Application status has been changed to ${status}`,
      });

      return data as ProjectApplication;
    } catch (error: any) {
      toast({
        title: "Error updating application",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // New function to create initial project phases based on partnership type
  const createInitialProjectPhases = async (projectId: string, partnershipType: string) => {
    const defaultPhases: Omit<ProjectPhase, 'id'>[] = [];

    switch (partnershipType) {
      case 'skilled':
        defaultPhases.push(
          {
            title: 'Project Kickoff',
            description: 'Initial meeting and project alignment',
            status: 'not-started',
            order: 0,
          },
          {
            title: 'Skills Assessment',
            description: 'Evaluate and match partner skills with project needs',
            status: 'not-started',
            order: 1,
          },
          {
            title: 'Collaboration',
            description: 'Active collaboration and skill deployment',
            status: 'not-started',
            order: 2,
          },
          {
            title: 'Project Completion',
            description: 'Final deliverables and project wrap-up',
            status: 'not-started',
            order: 3,
          }
        );
        break;
      case 'knowledge':
        defaultPhases.push(
          {
            title: 'Knowledge Transfer Initiation',
            description: 'Establish knowledge sharing framework',
            status: 'not-started',
            order: 0,
          },
          {
            title: 'Expert Consultation',
            description: 'Collaborative knowledge exchange sessions',
            status: 'not-started',
            order: 1,
          },
          {
            title: 'Implementation',
            description: 'Apply shared knowledge to project goals',
            status: 'not-started',
            order: 2,
          },
          {
            title: 'Review and Insights',
            description: 'Evaluate knowledge impact and lessons learned',
            status: 'not-started',
            order: 3,
          }
        );
        break;
      // Add more partnership type specific phases as needed
      default:
        defaultPhases.push(
          {
            title: 'Project Initiation',
            description: 'Initial project setup and planning',
            status: 'not-started',
            order: 0,
          },
          {
            title: 'Project Execution',
            description: 'Active project work and collaboration',
            status: 'not-started',
            order: 1,
          },
          {
            title: 'Project Closing',
            description: 'Final project review and closure',
            status: 'not-started',
            order: 2,
          }
        );
    }

    // Insert the default phases for the project
    for (const phase of defaultPhases) {
      await supabase
        .from("project_phases")
        .insert({
          project_id: projectId,
          title: phase.title,
          description: phase.description,
          status: phase.status,
          order: phase.order,
        });
    }
  };

  return {
    isLoading,
    checkApplicationStatus,
    applyToProject,
    getProjectApplications,
    getUserApplications,
    updateApplicationStatus,
  };
}
