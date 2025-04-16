
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progressNote: string;
  setProgressNote: (note: string) => void;
  onSave: () => void;
}

export function ProgressDialog({
  open,
  onOpenChange,
  progressNote,
  setProgressNote,
  onSave
}: ProgressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Progress Update</DialogTitle>
          <DialogDescription>
            Add a progress note for this phase of the project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="progress-note">Progress Note</Label>
            <Textarea
              id="progress-note"
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              placeholder="Describe the progress made or any updates on this phase..."
              rows={5}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Progress Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
