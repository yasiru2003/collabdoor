
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Check, ArrowRightCircle } from "lucide-react";
import { format } from "date-fns";
import { ProjectPhase } from "@/types";

interface PhaseCardProps {
  phase: ProjectPhase;
  canUpdateProgress: boolean;
  openProgressDialog: (phaseId: string) => void;
  projectStatus: string;
}

export function PhaseCard({
  phase,
  canUpdateProgress,
  openProgressDialog,
  projectStatus,
}: PhaseCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "not-started":
        return <Badge variant="outline" className="bg-gray-100">Not Started</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-medium">{phase.title}</h4>
          {getStatusBadge(phase.status)}
        </div>
        
        <p className="text-sm text-muted-foreground">{phase.description}</p>
        
        <div className="space-y-1 text-xs text-muted-foreground">
          {phase.dueDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Due: {format(new Date(phase.dueDate), "MMM d, yyyy")}</span>
            </div>
          )}
          
          {phase.completedDate && (
            <div className="flex items-center gap-1 text-green-600">
              <Check className="h-3 w-3" />
              <span>Completed: {format(new Date(phase.completedDate), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
        
        {canUpdateProgress && projectStatus !== "completed" && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openProgressDialog(phase.id)}
            className="w-full text-primary mt-2"
          >
            <ArrowRightCircle className="h-4 w-4 mr-1" />
            Update Progress
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
