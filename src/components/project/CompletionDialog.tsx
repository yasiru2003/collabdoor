
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectComplete } from "@/components/project/ProjectComplete";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectReviewForm } from "@/components/project/ProjectReviewForm";
import { useState } from "react";

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
  const [activeTab, setActiveTab] = useState("complete");
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);
  const [reviewedPartners, setReviewedPartners] = useState<string[]>([]);

  const handleReviewSubmitted = () => {
    // Mark the current partner as reviewed
    if (partners[currentPartnerIndex]) {
      setReviewedPartners(prev => [...prev, partners[currentPartnerIndex].id]);
    }
    
    // Move to the next partner or complete if all partners are reviewed
    if (currentPartnerIndex < partners.length - 1) {
      setCurrentPartnerIndex(prev => prev + 1);
    } else {
      onComplete();
      onOpenChange(false);
    }
  };

  const handleSkipReview = () => {
    // Move to the next partner without adding to reviewed list
    if (currentPartnerIndex < partners.length - 1) {
      setCurrentPartnerIndex(prev => prev + 1);
    } else {
      onComplete();
      onOpenChange(false);
    }
  };

  const currentPartner = partners[currentPartnerIndex] || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Complete Project</DialogTitle>
          <DialogDescription>
            Review your project, provide feedback, and mark it as completed.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="complete">Complete Project</TabsTrigger>
            <TabsTrigger value="review">Add Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="complete" className="py-4">
            <ProjectComplete 
              projectId={projectId}
              projectTitle={projectTitle}
              partners={partners}
              onComplete={() => {
                onComplete();
                // Automatically switch to the review tab after completion
                setActiveTab("review");
              }}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>
          
          <TabsContent value="review" className="py-4">
            {currentPartner && (
              <div>
                <div className="mb-4 text-sm text-muted-foreground">
                  Reviewing partner {currentPartnerIndex + 1} of {partners.length}: <span className="font-medium text-foreground">{currentPartner.name}</span>
                </div>
                <ProjectReviewForm 
                  projectId={projectId}
                  revieweeId={currentPartner.id}
                  revieweeName={currentPartner.name}
                  isOrganizerReview={true}
                  onSubmitSuccess={handleReviewSubmitted}
                  onSkip={handleSkipReview}
                  // projectTitle is passed but not used in ProjectReviewForm
                  // keeping it here since it's now in the interface
                  projectTitle={projectTitle}
                />
                <div className="mt-4 text-xs text-muted-foreground text-right">
                  {reviewedPartners.length} of {partners.length} partners reviewed
                </div>
              </div>
            )}
            {partners.length === 0 && (
              <div className="text-center py-8">
                <p>No partners to review.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
