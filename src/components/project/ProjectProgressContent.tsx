
import { ProjectPhase } from "@/types";
import { ProjectTracker } from "@/components/project/ProjectTracker";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trophy, CheckCircle2 } from "lucide-react";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { useReviews } from "@/hooks/use-reviews";
import { useEffect, useState } from "react";

interface ProjectProgressContentProps {
  projectId: string;
  isOwner: boolean;
  canUpdateProgress: boolean;
  phases: ProjectPhase[] | undefined;
  openProgressDialog: (phaseId: string) => void;
  handleCompleteProject: () => void;
  projectStatus: string;
}

export function ProjectProgressContent({
  projectId,
  isOwner,
  canUpdateProgress,
  phases,
  openProgressDialog,
  handleCompleteProject,
  projectStatus
}: ProjectProgressContentProps) {
  const [projectReviews, setProjectReviews] = useState([]);
  const { getProjectReviews } = useReviews();
  const isCompleted = projectStatus === "completed";

  // Load project reviews when the component mounts or when projectId/status changes
  useEffect(() => {
    async function loadReviews() {
      if (projectId && isCompleted) {
        console.log(`Loading reviews for completed project: ${projectId}`);
        const reviews = await getProjectReviews(projectId);
        console.log(`Found ${reviews.length} reviews`);
        setProjectReviews(reviews);
      }
    }
    loadReviews();
  }, [projectId, getProjectReviews, isCompleted]);

  return (
    <>
      <ProjectTracker projectId={projectId} isOwner={isOwner} readOnly={isCompleted} />
      
      {isCompleted && (
        <Card className="mt-6">
          <CardHeader className="flex items-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Project Complete</CardTitle>
            <CardDescription>
              This project has been completed successfully. No further updates can be made to the progress tracker.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      {isCompleted && (
        <div className="mt-6">
          <ReviewsList
            reviews={projectReviews}
            title="Project Reviews"
            description="Reviews and feedback from project partners and organizers"
            emptyMessage="No reviews have been submitted for this project yet"
          />
        </div>
      )}
      
      {canUpdateProgress && phases && phases.length > 0 && !isCompleted && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Quick Progress Updates</CardTitle>
            <CardDescription>Add progress updates to specific phases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {phases.map((phase: ProjectPhase) => (
                <Card key={phase.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">{phase.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{phase.description}</p>
                    <Badge 
                      variant="outline" 
                      className={
                        phase.status === 'completed' ? "bg-green-100 text-green-800" : 
                        phase.status === 'in-progress' ? "bg-blue-100 text-blue-800" : "bg-gray-100"
                      }
                    >
                      {phase.status === 'not-started' ? 'Not Started' : 
                       phase.status === 'in-progress' ? 'In Progress' : 'Completed'}
                    </Badge>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      onClick={() => openProgressDialog(phase.id)} 
                      className="w-full" 
                      size="sm"
                      variant={phase.status === 'not-started' ? "outline" : "default"}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Progress Update
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {isOwner && !isCompleted && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Complete This Project</CardTitle>
            <CardDescription>
              Mark this project as completed, review partners, and wrap up your collaboration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCompleteProject}
              size="lg"
              className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Trophy className="h-6 w-6 mr-2" /> Complete Project
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
