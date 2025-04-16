
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectComplete } from "@/components/project/ProjectComplete";

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  partners: Array<{ id: string; name: string }>;
  onComplete: () => void;
}

export function CompletionDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  partners,
  onComplete
}: CompletionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Complete Project</DialogTitle>
          <DialogDescription>
            Review your project and mark it as completed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ProjectComplete 
            projectId={projectId}
            projectTitle={projectTitle}
            partners={partners}
            onComplete={onComplete}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
