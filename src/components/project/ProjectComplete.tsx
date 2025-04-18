
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectReviewForm } from "./ProjectReviewForm";

interface ProjectCompleteProps {
  projectId: string;
  projectTitle: string;
  partners: Array<{
    id: string;
    name: string;
  }>;
  onComplete: () => void;
  onCancel?: () => void;
}

export function ProjectComplete({ projectId, projectTitle, partners = [], onComplete, onCancel }: ProjectCompleteProps) {
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

      // Auto-reject pending applications
      const { data: pendingApplications, error: fetchError } = await supabase
        .from('project_applications')
        .select('id')
        .eq('project_id', projectId)
        .eq('status', 'pending');
        
      if (fetchError) {
        console.error("Error fetching pending applications:", fetchError);
      } else if (pendingApplications && pendingApplications.length > 0) {
        // Create an array of objects for each application to update
        const applicationsToUpdate = pendingApplications.map(app => ({
          id: app.id,
          status: 'rejected'
        }));
        
        // Update all pending applications to rejected
        for (const app of pendingApplications) {
          const { error: updateError } = await supabase
            .from('project_applications')
            .update({ status: 'rejected' })
            .eq('id', app.id);
            
          if (updateError) {
            console.error(`Error rejecting application ${app.id}:`, updateError);
          }
        }
        
        console.log(`Auto-rejected ${pendingApplications.length} pending applications`);
      }

      // We need to ensure notifications reach all partners, so we'll take extra care here
      try {
        console.log("Sending notifications to partners for project completion");
        
        // Get all partners for this project with approved status
        const { data: partnersData, error: partnersError } = await supabase
          .from("project_applications")
          .select("user_id")
          .eq("project_id", projectId)
          .eq("status", "approved");
          
        if (partnersError) {
          console.error("Error fetching partners for notification:", partnersError);
          throw partnersError;
        }
        
        if (partnersData && partnersData.length > 0) {
          // Create notifications for all partners
          const notifications = partnersData.map(partner => ({
            user_id: partner.user_id,
            title: "Project Completed",
            message: `The project "${projectTitle}" has been marked as completed.`,
            link: `/projects/${projectId}`,
            read: false
          }));
          
          // Insert notifications directly
          const { error: notifyError } = await supabase
            .from("notifications")
            .insert(notifications);
            
          if (notifyError) {
            console.error("Error creating notifications:", notifyError);
          } else {
            console.log(`Successfully created ${notifications.length} notifications`);
          }
        } else {
          console.log("No partners found to notify for project:", projectId);
        }
      } catch (notificationError) {
        console.error("Error in notification system:", notificationError);
        // Continue execution even if notifications fail
      }

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
      <Card className="w-full max-w-lg mx-auto">
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
            <li>Automatically reject all pending applications</li>
            <li>Allow partners to leave reviews for the project</li>
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleComplete} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Processing..." : "Complete Project"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
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
