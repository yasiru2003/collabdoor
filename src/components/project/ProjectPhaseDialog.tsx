
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectPhaseActions } from "@/hooks/use-phases-query";
import { Loader2 } from "lucide-react";

interface ProjectPhaseDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhaseAdded: () => void;
}

export function ProjectPhaseDialog({ projectId, open, onOpenChange, onPhaseAdded }: ProjectPhaseDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Fix: Use the correct status type
  const [status, setStatus] = useState<"not-started" | "in-progress" | "completed">("not-started");
  const [dueDate, setDueDate] = useState("");
  
  const { createPhase, isCreating } = useProjectPhaseActions(projectId);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createPhase({
        project_id: projectId,
        title,
        description,
        status,
        order: 0, // This will be automatically set based on existing phases
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      
      onPhaseAdded();
      resetForm();
    } catch (error) {
      console.error("Error creating phase:", error);
    }
  };
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("not-started");
    setDueDate("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Project Phase</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Phase Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter phase title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what will be accomplished in this phase"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value: "not-started" | "in-progress" | "completed") => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !title.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Phase'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
