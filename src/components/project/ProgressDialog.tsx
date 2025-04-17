
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock } from "lucide-react";

interface ProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progressNote: string;
  setProgressNote: (note: string) => void;
  onSave: () => void;
  projectStatus?: string;
  phaseId?: string;
  phaseStatus?: string;
  onStatusChange?: (status: string) => void;
}

export function ProgressDialog({
  open,
  onOpenChange,
  progressNote,
  setProgressNote,
  onSave,
  projectStatus = "in-progress",
  phaseId,
  phaseStatus = "not-started",
  onStatusChange
}: ProgressDialogProps) {
  const isCompleted = projectStatus === "completed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          {isCompleted ? (
            <>
              <DialogTitle className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" /> Project Completed
              </DialogTitle>
              <DialogDescription>
                This project has been marked as completed. No further progress updates can be added.
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>Add Progress Update</DialogTitle>
              <DialogDescription>
                Add a progress note for this phase of the project.
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        
        {!isCompleted ? (
          <>
            <div className="grid gap-4 py-4">
              {onStatusChange && (
                <div className="grid gap-2">
                  <Label htmlFor="phase-status">Phase Status</Label>
                  <Select 
                    value={phaseStatus} 
                    onValueChange={(value) => onStatusChange(value)}
                  >
                    <SelectTrigger id="phase-status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
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
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                Updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
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
          </>
        ) : (
          <DialogFooter className="mt-4">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
