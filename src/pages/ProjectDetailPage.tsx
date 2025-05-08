
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { Organization } from "@/types";
import { useProject } from "@/hooks/use-projects-query";
import { useProjectApplicationsQuery } from "@/hooks/use-applications-query";
import { useAuth } from "@/hooks/use-auth";
import { useProjectApplications } from "@/hooks/use-project-applications";
import { useProjectPhases } from "@/hooks/use-phases-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

// Import our components
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectOverview } from "@/components/project/ProjectOverview";
import { ProjectProgressContent } from "@/components/project/ProjectProgressContent";
import { ApplicationsTable } from "@/components/project/ApplicationsTable";
import { ProjectDialogManager } from "@/components/project/ProjectDialogManager";
import { ProjectLoadingState, ProjectErrorState } from "@/components/project/ProjectLoadStates";
import { useProjectApplication } from "@/components/project/useProjectApplication";
import { useProjectNavigation } from "@/components/project/useProjectNavigation";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Redirect to create project page if the ID is "create"
  useEffect(() => {
    if (id === "create") {
      navigate("/projects/new");
      return;
    }
  }, [id, navigate]);
  
  // If id is "create", don't try to fetch project data
  const isValidUuid = id && id !== "create" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const { data: project, isLoading, error, refetch: refetchProject } = useProject(isValidUuid ? id : undefined);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const { userOrganizations: rawUserOrganizations } = useProjectApplications();
  
  // Transform the organization data to match the Organization type
  const userOrganizations: Organization[] = rawUserOrganizations ? 
    rawUserOrganizations.map(org => {
      return {
        id: org.organizations?.id || org.id,
        name: org.organizations?.name || "",
        description: undefined,
        industry: undefined,
        location: undefined,
        size: undefined,
        logo: undefined,
        website: undefined,
        foundedYear: undefined,
        createdAt: org.created_at || "",
        updatedAt: org.updated_at || "",
        owner_id: "",
      };
    }) : [];
  
  const { data: projectApplications, refetch: refetchApplications } = useProjectApplicationsQuery(isValidUuid ? id : undefined);
  const { data: phases, refetch: refetchPhases } = useProjectPhases(isValidUuid ? id : undefined);
  
  // Get default tab from URL or set to "overview"
  const defaultTab = searchParams.get("tab") || "overview";

  // Check if current user is the project owner
  const isOwner = user && project && user.id === project.organizerId;
  
  // Use our extracted hooks for better organization
  const {
    applicationOpen,
    setApplicationOpen,
    selectedOrganizationId,
    setSelectedOrganizationId,
    partnershipType,
    handlePartnershipTypeChange,
    message,
    setMessage,
    applicationStatus,
    applicationLoading,
    handleApply,
    openApplicationDialog,
    handleUpdateApplicationStatus,
    initializeApplicationStatus
  } = useProjectApplication(id || "", user?.id, project);

  const {
    handleContact,
    navigateToOrganization,
    navigateToOrganizerProfile,
    handleMessageApplicant
  } = useProjectNavigation();

  // Check if user is an approved partner
  const isApprovedPartner = applicationStatus === "approved";
  
  // Check if user can update progress (either owner or approved partner)
  const canUpdateProgress = isOwner || isApprovedPartner;

  const handleAddProgressNote = () => {
    // This would be connected to a real backend function to save progress notes
    if (project) {
      toast({
        title: "Progress Update Added",
        description: "Your progress update has been saved successfully.",
      });
    }
  };

  // Project dialogs management
  const {
    dialogs,
    openProgressDialog,
    handleCompleteProject,
    handleDeleteProject,
    handleEditProject
  } = ProjectDialogManager({
    project: project!,
    projectId: id || "",
    isOwner: !!isOwner,
    handleAddProgressNote,
    onProjectCompleted: () => {
      toast({
        title: "Project completed",
        description: "Project has been marked as completed successfully.",
      });
      
      // Auto-reject pending applications when project is completed
      if (projectApplications && projectApplications.length > 0) {
        const pendingApplications = projectApplications.filter(app => app.status === "pending");
        
        if (pendingApplications.length > 0) {
          try {
            // Update all pending applications to rejected
            for (const app of pendingApplications) {
              handleUpdateApplicationStatus(app.id, "rejected");
            }
            
            toast({
              title: "Applications updated",
              description: `${pendingApplications.length} pending applications have been automatically rejected.`,
            });
            
            // Refresh the applications list
            refetchApplications();
          } catch (error) {
            console.error("Error auto-rejecting applications:", error);
          }
        }
      }
      
      // Refresh the project data
      setTimeout(() => {
        refetchProject();
      }, 1000);
    },
    onProjectUpdated: refetchProject,
    projectApplications,
    refetchApplications
  });

  useEffect(() => {
    // Skip all fetching logic if id is "create" or not a valid UUID
    if (!isValidUuid) return;
    
    // Simulate checking if project is saved
    setTimeout(() => {
      setSaved(localStorage.getItem(`saved_${id}`) === "true");
    }, 500);

    // Check if the user has already applied
    initializeApplicationStatus();
  }, [id, user, isValidUuid, initializeApplicationStatus]);

  // If we're handling the "create" route, don't render the rest of the component
  if (id === "create") {
    return null; // The useEffect above will handle the redirect
  }

  if (isLoading) {
    return <ProjectLoadingState />;
  }

  if (error || !project) {
    return <ProjectErrorState />;
  }

  return (
    <Layout>
      <div className="max-w-full overflow-x-hidden px-2 md:px-0">
        <ProjectHeader 
          project={project}
          isOwner={!!isOwner}
          canUpdateProgress={canUpdateProgress}
          applicationStatus={applicationStatus}
          saved={saved}
          setSaved={setSaved}
          handleApply={openApplicationDialog}
          handleContact={() => handleContact(project.organizerId, project.organizerName, user?.id)}
          applicationLoading={applicationLoading}
          partnershipType={partnershipType}
          setPartnershipType={handlePartnershipTypeChange}
          message={message}
          setMessage={setMessage}
          applicationOpen={applicationOpen}
          setApplicationOpen={setApplicationOpen}
          userOrganizations={userOrganizations}
          selectedOrganizationId={selectedOrganizationId}
          setSelectedOrganizationId={setSelectedOrganizationId}
          onApplySubmit={handleApply}
          onEdit={handleEditProject}
        />

        <Tabs defaultValue={defaultTab} onValueChange={(value) => setSearchParams({ tab: value })}>
          <div className="w-full overflow-x-auto">
            <TabsList className="mb-6 w-full max-w-md overflow-x-auto flex-nowrap">
              <TabsTrigger value="overview" className={isMobile ? "text-sm py-1.5" : ""}>Overview</TabsTrigger>
              <TabsTrigger value="progress" className={isMobile ? "text-sm py-1.5" : ""}>Progress Tracker</TabsTrigger>
              {isOwner && <TabsTrigger value="applications" className={isMobile ? "text-sm py-1.5" : ""}>Applications</TabsTrigger>}
            </TabsList>
          </div>
          
          <TabsContent value="overview">
            <ProjectOverview 
              project={project} 
              isOwner={!!isOwner} 
              navigateToOrganization={() => navigateToOrganization(project.organizationId)}
              navigateToOrganizerProfile={() => navigateToOrganizerProfile(project.organizerId)}
              handleCompleteProject={handleCompleteProject}
              handleDeleteProject={handleDeleteProject}
              applicationStatus={applicationStatus}
              handleApply={openApplicationDialog}
              applicationLoading={applicationLoading}
            />
          </TabsContent>
          
          <TabsContent value="progress">
            <ProjectProgressContent 
              projectId={id as string}
              isOwner={!!isOwner}
              canUpdateProgress={canUpdateProgress}
              phases={phases}
              openProgressDialog={openProgressDialog}
              handleCompleteProject={handleCompleteProject}
              projectStatus={project.status}
            />
          </TabsContent>
          
          <TabsContent value="applications">
            <ApplicationsTable 
              applications={projectApplications}
              handleUpdateApplicationStatus={handleUpdateApplicationStatus}
              handleMessageApplicant={handleMessageApplicant}
            />
          </TabsContent>
        </Tabs>
        
        {dialogs}
      </div>
    </Layout>
  );
}
