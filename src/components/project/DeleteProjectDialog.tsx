
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { removeImage } from "@/utils/upload-utils";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  projectImage?: string | null;
  proposalFilePath?: string | null;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  projectImage,
  proposalFilePath
}: DeleteProjectDialogProps) {
  const [confirmTitle, setConfirmTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isDeleteButtonDisabled = confirmTitle !== projectTitle || isDeleting;
  
  const handleDelete = async () => {
    if (confirmTitle !== projectTitle) return;
    
    setIsDeleting(true);
    
    try {
      // Delete associated files first (project image, proposal document)
      if (projectImage) {
        await removeImage(projectImage, 'projects');
      }
      
      if (proposalFilePath) {
        await removeImage(proposalFilePath, 'proposals');
      }
      
      // Delete the project from the database
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      
      if (error) throw error;
      
      toast({
        title: "Project deleted",
        description: "The project has been permanently deleted.",
      });
      
      // Close the dialog
      onOpenChange(false);
      
      // Navigate away from the project page
      navigate("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error deleting project",
        description: "There was a problem deleting this project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Project
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the project 
            and all associated data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium">To confirm, type the project title:</p>
            <p className="text-sm font-semibold mt-1">{projectTitle}</p>
          </div>
          
          <Input 
            value={confirmTitle}
            onChange={(e) => setConfirmTitle(e.target.value)}
            placeholder="Type project title here"
            className="w-full"
          />
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleteButtonDisabled}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
