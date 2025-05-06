import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { useAuth } from "@/hooks/useAuth";
import { fetchProject, applyToProject } from "@/services/projectService";
import { Project } from "@/types";

export function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, userOrganizations } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  
  // Apply modal state
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [partnershipType, setPartnershipType] = useState("");
  const [message, setMessage] = useState("");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      
      try {
        const projectData = await fetchProject(projectId);
        setProject(projectData);
        
        // Check if current user is the owner
        if (user && projectData.ownerId === user.id) {
          setIsOwner(true);
        }
        
        // Check if user has already applied
        if (user && projectData.applications) {
          const userApplication = projectData.applications.find(
            app => app.userId === user.id
          );
          if (userApplication) {
            setApplicationStatus(userApplication.status);
          }
        }
      } catch (error) {
        console.error("Error loading project:", error);
      }
    };
    
    loadProject();
  }, [projectId, user]);
  
  const handleContact = () => {
    // Implementation for contact functionality
    console.log("Contact clicked");
  };
  
  const handleApply = () => {
    // Open the apply modal
    setApplicationOpen(true);
  };
  
  // Handle apply button click from the modal
  const onApplySubmit = async () => {
    if (!user || !project?.id) return;
    
    setApplicationLoading(true);
    
    try {
      // Only allow applying to projects with valid UUIDs
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(project.id);
      
      if (!isValidUUID) {
        console.error("Cannot apply to project with invalid ID format:", project.id);
        setApplicationLoading(false);
        return;
      }
      
      const result = await applyToProject(
        project.id, 
        user.id, 
        partnershipType, 
        message, 
        selectedOrganizationId
      );
      
      if (result) {
        setApplicationStatus("pending");
        setApplicationOpen(false);
        setMessage("");
        setSelectedOrganizationId(null);
      }
    } catch (error) {
      console.error("Error applying to project:", error);
    } finally {
      setApplicationLoading(false);
    }
  };
  
  const handleEdit = () => {
    if (project?.id) {
      navigate(`/projects/${project.id}/edit`);
    }
  };
  
  if (!project) {
    return <div className="container py-8">Loading project...</div>;
  }
  
  return (
    <div className="container py-8">
      <ProjectHeader
        project={project}
        isOwner={isOwner}
        canUpdateProgress={isOwner}
        applicationStatus={applicationStatus}
        saved={saved}
        setSaved={setSaved}
        handleApply={handleApply}
        handleContact={handleContact}
        applicationLoading={applicationLoading}
        partnershipType={partnershipType}
        setPartnershipType={setPartnershipType}
        message={message}
        setMessage={setMessage}
        applicationOpen={applicationOpen}
        setApplicationOpen={setApplicationOpen}
        userOrganizations={userOrganizations || []}
        selectedOrganizationId={selectedOrganizationId}
        setSelectedOrganizationId={setSelectedOrganizationId}
        onApplySubmit={onApplySubmit}
        onEdit={handleEdit}
      />
      
      {/* Rest of the project page content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Project details section */}
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            {/* Project content here */}
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Sidebar content */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Project Info</h3>
            {/* Project information */}
          </div>
        </div>
      </div>
    </div>
  );
}