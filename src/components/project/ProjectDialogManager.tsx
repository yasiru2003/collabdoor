
import { useState } from "react";
import { Project } from "@/types";
import { ProgressDialog } from "./ProgressDialog";
import { CompletionDialog } from "./CompletionDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";

interface ProjectDialogManagerProps {
  project: Project;
  projectId: string;
  isOwner: boolean;
  handleAddProgressNote: () => void;
  onProjectCompleted: () => void;
  onProjectUpdated: () => void;
  projectApplications: any[];
  refetchApplications: () => void;
}

export function ProjectDialogManager({
  project,
  projectId,
  isOwner,
  handleAddProgressNote,
  onProjectCompleted,
  onProjectUpdated,
  projectApplications
}: ProjectDialogManagerProps) {
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [progressNote, setProgressNote] = useState("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const openProgressDialog = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setProgressNote("");
    setProgressDialogOpen(true);
  };

  const handleCompleteProject = () => {
    setCompleteDialogOpen(true);
  };

  const handleDeleteProject = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleEditProject = () => {
    setEditDialogOpen(true);
  };

  return {
    dialogs: (
      <>
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
          projectId={projectId}
          projectTitle={project.title}
          partners={getProjectPartners()}
          onComplete={onProjectCompleted}
        />
        
        {project && (
          <EditProjectDialog
            project={project}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onProjectUpdated={onProjectUpdated}
          />
        )}
        
        <DeleteProjectDialog 
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          projectId={projectId}
          projectTitle={project.title}
          projectImage={project.image}
          proposalFilePath={project.proposalFilePath}
        />
      </>
    ),
    openProgressDialog,
    handleCompleteProject,
    handleDeleteProject,
    handleEditProject
  };
}
