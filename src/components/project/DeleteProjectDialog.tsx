import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { removeImage } from "@/utils/upload-utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  proposalFilePath,
}: DeleteProjectDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      // Delete project image if it exists
      if (projectImage) {
        await removeImage(projectImage, 'projects');
      }

      // Delete proposal file if it exists
      if (proposalFilePath) {
        // Extract file name from the file path
        const fileName = proposalFilePath.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('proposals')
            .remove([proposalFilePath]);

          if (storageError) {
            console.error("Error deleting proposal file:", storageError);
            toast({
              title: "Error deleting proposal file",
              description: "Failed to delete the proposal file from storage.",
              variant: "destructive",
            });
          } else {
            console.log("Proposal file deleted successfully.");
          }
        }
      }

      // Delete the project from the database
      const { error: dbError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (dbError) {
        console.error("Error deleting project from database:", dbError);
        toast({
          title: "Error deleting project",
          description: "Failed to delete the project from the database.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Project deleted",
        description: `${projectTitle} has been deleted successfully.`,
      });
      navigate("/projects");
    } catch (error) {
      console.error("Error during deletion process:", error);
      toast({
        title: "Error deleting project",
        description: "An unexpected error occurred during the deletion process.",
        variant: "destructive",
      });
    } finally {
      onOpenChange(false); // Close the dialog
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {/* You might not need a trigger here if the dialog is opened programmatically */}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            {projectTitle} and all related data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
