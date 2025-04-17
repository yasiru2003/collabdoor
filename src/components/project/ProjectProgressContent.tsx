
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectPhase } from "@/types";
import { CalendarIcon, CheckSquare, Clock, Plus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useProjectPhases } from "@/hooks/use-phases-query";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ProjectProgressContentProps {
  projectId: string;
  isOwner: boolean;
  canUpdateProgress: boolean;
  openProgressDialog: (phaseId: string) => void;
  handleCompleteProject: () => void;
  phases?: ProjectPhase[];
  projectStatus: string;
}

export function ProjectProgressContent({
  projectId,
  isOwner,
  canUpdateProgress,
  openProgressDialog,
  handleCompleteProject,
  phases = [],
  projectStatus
}: ProjectProgressContentProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPhase, setNewPhase] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'not-started',
    order: 0,
    project_id: projectId
  });
  const { addPhase, isLoading: isAddingPhase, refetch } = useProjectPhases(projectId);
  const { toast } = useToast();
  
  const isCompleted = projectStatus === 'completed';
  
  // Get the current status percentage
  const getProgressPercentage = () => {
    if (phases.length === 0) return 0;
    
    const completedPhases = phases.filter(
      phase => phase.status === 'completed'
    ).length;
    
    return Math.round((completedPhases / phases.length) * 100);
  };
  
  const getPhaseStatusBadge = (status: string) => {
    switch (status) {
      case 'not-started':
        return <Badge variant="outline" className="bg-gray-50">Not Started</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'delayed':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Delayed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date set';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleAddPhase = async () => {
    if (!newPhase.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for the phase",
        variant: "destructive"
      });
      return;
    }

    await addPhase({
      ...newPhase,
      order: phases.length,
    });

    setNewPhase({
      title: '',
      description: '',
      dueDate: '',
      status: 'not-started',
      order: 0,
      project_id: projectId
    });

    setCreateDialogOpen(false);
    refetch();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Project Progress</h2>
          <p className="text-muted-foreground">
            Track project phases and milestones
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isOwner && !isCompleted && (
            <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Phase
            </Button>
          )}
          
          {isOwner && !isCompleted && phases.length > 0 && getProgressPercentage() === 100 && (
            <Button onClick={handleCompleteProject}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Mark Project as Complete
            </Button>
          )}
        </div>
      </div>
      
      {phases.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No phases yet"
          description={
            isOwner
              ? "Add phases to track progress of your project"
              : "The project owner hasn't added any phases yet"
          }
          action={
            isOwner && !isCompleted ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Phase
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {phases.map((phase) => (
            <Card key={phase.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-1">
                  <CardTitle className="text-xl">{phase.title}</CardTitle>
                  {getPhaseStatusBadge(phase.status)}
                </div>
                <CardDescription className="line-clamp-3">
                  {phase.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>Due: {formatDate(phase.dueDate)}</span>
                </div>
                
                {phase.completedDate && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                    <span>Completed: {formatDate(phase.completedDate)}</span>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-2 border-t flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Phase {phase.order + 1}
                </div>
                
                {canUpdateProgress && !isCompleted && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openProgressDialog(phase.id)}
                    disabled={phase.status === 'completed'}
                  >
                    Update Progress
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for adding new phase */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Phase</DialogTitle>
            <DialogDescription>
              Create a new phase to track your project's progress
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Phase Title</Label>
              <Input
                id="title"
                value={newPhase.title}
                onChange={(e) => setNewPhase({...newPhase, title: e.target.value})}
                placeholder="e.g., Research, Development, Testing"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newPhase.description}
                onChange={(e) => setNewPhase({...newPhase, description: e.target.value})}
                placeholder="Describe what will be accomplished in this phase"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={newPhase.dueDate}
                onChange={(e) => setNewPhase({...newPhase, dueDate: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPhase} disabled={isAddingPhase}>
              {isAddingPhase ? 'Adding...' : 'Add Phase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
