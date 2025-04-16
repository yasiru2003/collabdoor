
import { ProjectPhase } from "@/types";
import { ProjectTracker } from "@/components/project/ProjectTracker";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trophy } from "lucide-react";

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
  return (
    <>
      <ProjectTracker projectId={projectId} isOwner={isOwner} />
      
      {canUpdateProgress && phases && phases.length > 0 && (
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
                      variant={phase.status === 'not-started' ? "outline" : "progress"}
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
      
      {/* Add Complete Project button at the bottom of the progress tab */}
      {isOwner && projectStatus !== "completed" && (
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
