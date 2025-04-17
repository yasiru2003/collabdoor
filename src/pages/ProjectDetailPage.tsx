import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Project, PartnershipType, ApplicationWithProfile, Organization } from "@/types";
import { useProject } from "@/hooks/use-projects-query";
import { useProjectApplicationsQuery } from "@/hooks/use-applications-query";
import { useAuth } from "@/hooks/use-auth";
import { ApplicationStatus, useProjectApplications } from "@/hooks/use-project-applications";
import { useProjectPhases } from "@/hooks/use-phases-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import our new components
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectOverview } from "@/components/project/ProjectOverview";
import { ProjectProgressContent } from "@/components/project/ProjectProgressContent";
import { ApplicationsTable } from "@/components/project/ApplicationsTable";
import { ProgressDialog } from "@/components/project/ProgressDialog";
import { CompletionDialog } from "@/components/project/CompletionDialog";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Redirect to create project page if the ID is "create"
  useEffect(() => {
    if (id === "create") {
      navigate("/projects/new");
      return;
    }
  }, [id, navigate]);
  
  // If id is "create", don't try to fetch project data
  const isValidUuid = id && id !== "create" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const { data: project, isLoading, error } = useProject(isValidUuid ? id : undefined);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const { 
    checkApplicationStatus, 
    applyToProject, 
    isLoading: applicationLoading,
    updateApplicationStatus,
    userOrganizations: rawUserOrganizations
  } = useProjectApplications();
  
  // Transform the organization data to match the Organization type
  const userOrganizations: Organization[] = rawUserOrganizations ? 
    rawUserOrganizations.map(org => ({
      id: org.organizations?.id || org.id,
      name: org.organizations?.name || "",
      description: org.organizations?.description,
      industry: org.organizations?.industry,
      location: org.organizations?.location,
      size: org.organizations?.size,
      logo: org.organizations?.logo,
      website: org.organizations?.website,
      foundedYear: org.organizations?.founded_year,
      createdAt: org.created_at || "",
      updatedAt: org.updated_at || "",
      owner_id: org.organizations?.owner_id || "",
    })) : [];
  
  const { data: projectApplications, refetch: refetchApplications } = useProjectApplicationsQuery(isValidUuid ? id : undefined);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [partnershipType, setPartnershipType] = useState<PartnershipType>("skilled");
  const [message, setMessage] = useState("");
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [progressNote, setProgressNote] = useState("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  
  const { data: phases, refetch: refetchPhases } = useProjectPhases(isValidUuid ? id : undefined);
  
  // New state for organization selection
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  
  // Get default tab from URL or set to "overview"
  const defaultTab = searchParams.get("tab") || "overview";

  // Check if current user is the project owner
  const isOwner = user && project && user.id === project.organizerId;
  
  // Check if current user is an approved partner
  const isApprovedPartner = applicationStatus === "approved";
  
  // Check if user can update progress (either owner or approved partner)
  const canUpdateProgress = isOwner || isApprovedPartner;
  
  // State for project completion dialog
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  
  const handleContact = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to contact project organizers.",
        variant: "destructive",
      });
      navigate("/login", { state: { returnTo: `/projects/${id}` } });
      return;
    }

    // Navigate to messages page with the organizer contact info
    navigate("/messages", { 
      state: { 
        participantId: project.organizerId,
        participantName: project.organizerName
      } 
    });
  };

  useEffect(() => {
    // Skip all fetching logic if id is "create" or not a valid UUID
    if (!isValidUuid) return;
    
    // Simulate checking if project is saved
    setTimeout(() => {
      setSaved(localStorage.getItem(`saved_${id}`) === "true");
    }, 500);

    // Check if the user has already applied
    const checkApplication = async () => {
      if (user && id && isValidUuid) {
        try {
          const application = await checkApplicationStatus(id, user.id);
          if (application) {
            setApplicationStatus(application.status);
          }
        } catch (error) {
          console.error("Error checking application status:", error);
        }
      }
    };
    
    if (user) {
      checkApplication();
    }
  }, [id, user, checkApplicationStatus, isValidUuid]);

  // If we're handling the "create" route, don't render the rest of the component
  if (id === "create") {
    return null; // The useEffect above will handle the redirect
  }

  const handleCompleteProject = () => {
    setCompleteDialogOpen(true);
  };
  
  const onProjectCompleted = () => {
    setCompleteDialogOpen(false);
    toast({
      title: "Project completed",
      description: "Project has been marked as completed successfully.",
    });
    // Refresh the project data
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleApply = async () => {
    if (!user || !id) return;
    
    try {
      // Process the selectedOrganizationId - if it's "individual", pass null
      const orgId = selectedOrganizationId === "individual" ? null : selectedOrganizationId;
      
      // Pass the organization ID to the applyToProject function
      const result = await applyToProject(id, user.id, partnershipType, message, orgId);
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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply to projects.",
        variant: "destructive",
      });
      navigate("/login", { state: { returnTo: `/projects/${id}` } });
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
      
      // Refresh the applications list
      refetchApplications();
    } catch (error) {
      console.error(`Error ${status} application:`, error);
      toast({
        title: "Error updating application",
        description: `There was an error ${status === "approved" ? "approving" : "rejecting"} the application.`,
        variant: "destructive",
      });
    }
  };
  
  const openProgressDialog = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setProgressNote("");
    setProgressDialogOpen(true);
  };
  
  const handleAddProgressNote = () => {
    // This would be connected to a real backend function to save progress notes
    if (progressNote.trim() && selectedPhaseId) {
      toast({
        title: "Progress Update Added",
        description: "Your progress update has been saved successfully.",
      });
      setProgressDialogOpen(false);
      setProgressNote("");
    }
  };

  const handleMessageApplicant = (applicantId: string, applicantName: string) => {
    navigate("/messages", { 
      state: { 
        participantId: applicantId,
        participantName: applicantName
      } 
    });
  };

  const navigateToOrganization = () => {
    if (project?.organizationId) {
      navigate(`/organizations/${project.organizationId}`);
    }
  };
  
  const navigateToOrganizerProfile = () => {
    if (project?.organizerId) {
      navigate(`/profile/${project.organizerId}`);
    }
  };

  // Get project partners for completion dialog
  const getProjectPartners = () => {
    if (!projectApplications) return [];
    
    return projectApplications
      .filter(app => app.status === "approved")
      .map(app => {
        // Access either profile or profiles property
        const profileData = app.profile || app.profiles;
        const name = profileData?.name || "Unknown";
        return {
          id: app.user_id,
          name: name
        };
      });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded mb-4"></div>
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-6"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/projects">Browse Projects</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <ProjectHeader 
          project={project}
          isOwner={isOwner}
          canUpdateProgress={canUpdateProgress}
          applicationStatus={applicationStatus}
          saved={saved}
          setSaved={setSaved}
          handleApply={openApplicationDialog}
          handleContact={handleContact}
          applicationLoading={applicationLoading}
          partnershipType={partnershipType}
          setPartnershipType={setPartnershipType}
          message={message}
          setMessage={setMessage}
          applicationOpen={applicationOpen}
          setApplicationOpen={setApplicationOpen}
          userOrganizations={userOrganizations}
          selectedOrganizationId={selectedOrganizationId}
          setSelectedOrganizationId={setSelectedOrganizationId}
          onApplySubmit={handleApply}
        />

        <Tabs defaultValue={defaultTab} onValueChange={(value) => setSearchParams({ tab: value })}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracker</TabsTrigger>
            {isOwner && <TabsTrigger value="applications">Applications</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="overview">
            <ProjectOverview 
              project={project} 
              isOwner={isOwner} 
              navigateToOrganization={navigateToOrganization}
              navigateToOrganizerProfile={navigateToOrganizerProfile}
              handleCompleteProject={handleCompleteProject}
            />
          </TabsContent>
          
          <TabsContent value="progress">
            <ProjectProgressContent 
              projectId={id as string}
              isOwner={isOwner}
              canUpdateProgress={canUpdateProgress}
              phases={phases}
              openProgressDialog={openProgressDialog}
              handleCompleteProject={handleCompleteProject}
              projectStatus={project.status}
            />
          </TabsContent>
          
          <TabsContent value="applications">
            <ApplicationsTable 
              applications={projectApplications as ApplicationWithProfile[]}
              handleUpdateApplicationStatus={handleUpdateApplicationStatus}
              handleMessageApplicant={handleMessageApplicant}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialogs */}
      <ProgressDialog 
        open={progressDialogOpen}
        onOpenChange={setProgressDialogOpen}
        progressNote={progressNote}
        setProgressNote={setProgressNote}
        onSave={handleAddProgressNote}
        projectStatus={project.status}
      />
      
      <CompletionDialog 
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        projectId={id as string}
        projectTitle={project.title}
        partners={getProjectPartners()}
        onComplete={onProjectCompleted}
      />
    </Layout>
  );
}
