
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useProjectApplications } from "@/hooks/use-project-applications";
import { PartnershipType, Project } from "@/types";

export function useProjectApplication(projectId: string, userId: string | undefined, project: Project | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [partnershipType, setPartnershipType] = useState<PartnershipType>("skilled");
  const [message, setMessage] = useState("");
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  
  const { 
    applyToProject, 
    isLoading: applicationLoading,
    checkApplicationStatus,
    updateApplicationStatus,
    userOrganizations
  } = useProjectApplications();

  // Fix for type error - Create a handler function that converts string to PartnershipType
  const handlePartnershipTypeChange = (type: string) => {
    setPartnershipType(type as PartnershipType);
  };

  // Initialize default partnership type based on project's available types
  useEffect(() => {
    if (project?.partnershipTypes && project.partnershipTypes.length > 0) {
      setPartnershipType(project.partnershipTypes[0] as PartnershipType);
    }
  }, [project]);

  const handleApply = async () => {
    if (!userId || !projectId) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply to projects.",
        variant: "destructive",
      });
      navigate("/login", { state: { returnTo: `/projects/${projectId}` } });
      return;
    }
    
    // Check if project is completed
    if (project?.status === 'completed') {
      toast({
        title: "Project is completed",
        description: "You cannot apply to a completed project.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Process the selectedOrganizationId - if it's "individual", pass null
      const orgId = selectedOrganizationId === "individual" ? null : selectedOrganizationId;
      
      // Pass the organization ID to the applyToProject function
      const result = await applyToProject(projectId, userId, partnershipType, message, orgId);
      if (result) {
        setApplicationStatus("pending");
        setApplicationOpen(false);
        setMessage("");
        setSelectedOrganizationId(null);
        
        toast({
          title: "Application submitted",
          description: "Your application has been sent to the project organizer.",
        });
      }
    } catch (error) {
      console.error("Error applying to project:", error);
      toast({
        title: "Application failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openApplicationDialog = () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply to projects.",
        variant: "destructive",
      });
      navigate("/login", { state: { returnTo: `/projects/${projectId}` } });
      return;
    }
    
    // Check if project is completed
    if (project?.status === 'completed') {
      toast({
        title: "Project is completed",
        description: "You cannot apply to a completed project.",
        variant: "destructive",
      });
      return;
    }
    
    setApplicationOpen(true);
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: "approved" | "rejected") => {
    try {
      await updateApplicationStatus(applicationId, status);
      
      toast({
        title: status === "approved" ? "Application approved" : "Application rejected",
        description: status === "approved" 
          ? "The partner has been added to your project." 
          : "The application has been rejected.",
      });
      
      return true;
    } catch (error) {
      console.error(`Error ${status} application:`, error);
      toast({
        title: "Error updating application",
        description: `There was an error ${status === "approved" ? "approving" : "rejecting"} the application.`,
        variant: "destructive",
      });
      return false;
    }
  };

  // Initialize application status
  const initializeApplicationStatus = async () => {
    if (userId && projectId) {
      try {
        const application = await checkApplicationStatus(projectId, userId);
        if (application) {
          setApplicationStatus(application.status);
        }
      } catch (error) {
        console.error("Error checking application status:", error);
      }
    }
  };

  // Check application status on component mount
  useEffect(() => {
    initializeApplicationStatus();
  }, [userId, projectId]);

  return {
    applicationOpen,
    setApplicationOpen,
    selectedOrganizationId,
    setSelectedOrganizationId,
    partnershipType,
    handlePartnershipTypeChange,
    message,
    setMessage,
    applicationStatus,
    setApplicationStatus,
    applicationLoading,
    handleApply,
    openApplicationDialog,
    handleUpdateApplicationStatus,
    initializeApplicationStatus
  };
}
