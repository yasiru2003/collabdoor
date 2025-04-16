
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
            <ProjectReviewForm 
              projectId={projectId}
              projectTitle={projectTitle}
              partners={partners}
              onComplete={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
