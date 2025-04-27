import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectPhase } from "@/types";
import { Plus } from "lucide-react";
import { AddPhaseDialog } from "@/components/project/AddPhaseDialog";
import { PhaseCard } from "@/components/project/PhaseCard";

interface ProjectProgressContentProps {
  projectId: string;
  isOwner: boolean;
  canUpdateProgress: boolean;
  phases: ProjectPhase[] | undefined;
  openProgressDialog: (phaseId: string) => void;
  handleCompleteProject: () => void;
  projectStatus: string;
}

export function ProjectProgressContent({
  projectId,
  isOwner,
  canUpdateProgress,
  phases,
  openProgressDialog,
  handleCompleteProject,
  projectStatus,
}: ProjectProgressContentProps) {
  const [addPhaseDialogOpen, setAddPhaseDialogOpen] = useState(false);

  useEffect(() => {
    // Sort phases by order when the component mounts or when phases change
    if (phases) {
      setSortedPhases([...phases].sort((a, b) => a.order - b.order));
    }
  }, [phases]);

  const [sortedPhases, setSortedPhases] = useState<ProjectPhase[]>([]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Phases</h2>
        {isOwner && (
          <Button size="sm" onClick={() => setAddPhaseDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Phase
          </Button>
        )}
      </div>

      {sortedPhases && sortedPhases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPhases.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              canUpdateProgress={canUpdateProgress}
              openProgressDialog={openProgressDialog}
              projectStatus={projectStatus}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No phases added yet.</p>
      )}

      {isOwner && (
        <AddPhaseDialog
          open={addPhaseDialogOpen}
          onOpenChange={setAddPhaseDialogOpen}
          projectId={projectId}
        />
      )}

      {projectStatus !== "completed" && isOwner && sortedPhases && sortedPhases.length > 0 && (
        <Button onClick={handleCompleteProject} className="w-full">
          Mark Project as Complete
        </Button>
      )}
    </div>
  );
}
