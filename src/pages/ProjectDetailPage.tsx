import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectDetails } from "@/components/project/ProjectDetails";
import { ProjectTeam } from "@/components/project/ProjectTeam";
import { ProjectDiscussion } from "@/components/project/ProjectDiscussion";
import { ProjectTimeline } from "@/components/project/ProjectTimeline";
import { ProjectFiles } from "@/components/project/ProjectFiles";
import { ProjectApplications } from "@/components/project/ProjectApplications";
import { useProject } from "@/hooks/use-projects-query";
import { useProjectPhases } from "@/hooks/use-phases-query";
import { useAuth } from "@/hooks/use-auth";
import { ProjectPhaseDialog } from "@/components/project/ProjectPhaseDialog";
import { EditProjectDialog } from "@/components/project/EditProjectDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { project, isLoading, error, refetch } = useProject(id);
  const { phases, isLoading: phasesLoading, error: phasesError, refetch: refetchPhases } = useProjectPhases(id);
  
  const [activeTab, setActiveTab] = useState("details");
  const [phaseDialogOpen, setPhaseDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id === "create") {
      navigate("/projects/new");
      return;
    }
  }, [id, navigate]);

  if (id === "create") {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading project details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <p className="text-xl mb-4">Project not found</p>
          <Button asChild>
            <Link to="/projects">Back to Projects</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const isOwner = user && project.owner_id === user.id;
  const isAdmin = user && user.email === "yasirubandaraprivate@gmail.com";
  const canEdit = isOwner || isAdmin;

  const handleDeleteProject = async () => {
    if (!id || !canEdit) return;
    
    try {
      setIsDeleting(true);
      
      // Delete project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted",
      });
      
      navigate("/projects");
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error deleting project",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Layout>
      <ProjectHeader 
        project={project} 
        isOwner={canEdit}
        onEdit={() => setEditDialogOpen(true)}
        onDelete={() => setDeleteDialogOpen(true)}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          {isOwner && (
            <TabsTrigger value="applications">Applications</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="details">
          <ProjectDetails project={project} />
        </TabsContent>
        
        <TabsContent value="timeline">
          <ProjectTimeline 
            project={project} 
            phases={phases} 
            isOwner={canEdit}
            onAddPhase={() => setPhaseDialogOpen(true)}
            isLoading={phasesLoading}
          />
        </TabsContent>
        
        <TabsContent value="team">
          <ProjectTeam project={project} />
        </TabsContent>
        
        <TabsContent value="discussion">
          <ProjectDiscussion project={project} />
        </TabsContent>
        
        <TabsContent value="files">
          <ProjectFiles project={project} />
        </TabsContent>
        
        {isOwner && (
          <TabsContent value="applications">
            <ProjectApplications projectId={project.id} />
          </TabsContent>
        )}
      </Tabs>
      
      {canEdit && (
        <ProjectPhaseDialog 
          projectId={project.id}
          open={phaseDialogOpen}
          onOpenChange={setPhaseDialogOpen}
          onPhaseAdded={() => {
            refetchPhases();
            setPhaseDialogOpen(false);
          }}
        />
      )}
      
      {canEdit && (
        <EditProjectDialog
          project={project}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onProjectUpdated={() => {
            refetch();
            setEditDialogOpen(false);
          }}
        />
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
