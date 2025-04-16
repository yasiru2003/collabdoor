
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { notifyProjectPartners } from "@/services/notification-service";
import { ProjectReviewForm } from "./ProjectReviewForm";

interface ProjectCompleteProps {
  projectId: string;
  projectTitle: string;
  partners: Array<{
    id: string;
    name: string;
  }>;
  onComplete: () => void;
  onCancel?: () => void; // Add the optional onCancel prop
}

export function ProjectComplete({ projectId, projectTitle, partners, onComplete, onCancel }: ProjectCompleteProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<{id: string, name: string} | null>(null);
  const [reviewedPartners, setReviewedPartners] = useState<string[]>([]);

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // Update project status to completed and set completed_at timestamp
      const { error } = await supabase
        .from('projects')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error("Error completing project:", error);
        throw error;
      }

      // Notify all partners about project completion
      await notifyProjectPartners(
        projectId,
        "Project Completed",
        `The project "${projectTitle}" has been marked as completed.`,
        `/projects/${projectId}`
      );

      toast({
        title: "Project completed",
        description: "The project has been marked as completed successfully."
      });

      // Open dialog to start reviewing partners if there are any
      if (partners.length > 0) {
        setCurrentPartner(partners[0]);
        setIsOpen(true);
      } else {
        onComplete();
      }
    } catch (error: any) {
      console.error("Error completing project:", error);
      toast({
        title: "Error",
        description: "An error occurred while completing the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    if (currentPartner) {
      // Add current partner to reviewed list
      setReviewedPartners([...reviewedPartners, currentPartner.id]);
      
      // Find next unreviewed partner
      const nextPartner = partners.find(p => !reviewedPartners.includes(p.id) && p.id !== currentPartner.id);
      
      if (nextPartner) {
        // If there's another partner to review, set them as current
        setCurrentPartner(nextPartner);
      } else {
        // All partners reviewed, close dialog and complete
        setIsOpen(false);
        onComplete();
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Complete Project</CardTitle>
          <CardDescription>Mark this project as completed and notify all partners</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Completing this project will:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Change the project status to "Completed"</li>
            <li>Allow you to review your project partners</li>
            <li>Send notifications to all partners</li>
            <li>Allow partners to leave reviews for the project</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleComplete} 
            disabled={loading}
          >
            {loading ? "Processing..." : "Complete Project"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Partner: {currentPartner?.name}</DialogTitle>
            <DialogDescription>
              Share your experience working with this partner on the project.
            </DialogDescription>
          </DialogHeader>
          
          {currentPartner && (
            <ProjectReviewForm 
              projectId={projectId}
              revieweeId={currentPartner.id}
              revieweeName={currentPartner.name}
              isOrganizerReview={true}
              onSubmitSuccess={handleReviewSubmitted}
              onSkip={handleReviewSubmitted}
            />
          )}
          
          <DialogFooter className="sm:justify-start">
            <div className="text-xs text-muted-foreground">
              {reviewedPartners.length} of {partners.length} partners reviewed
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
