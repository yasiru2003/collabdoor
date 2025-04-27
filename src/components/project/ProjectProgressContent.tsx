import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectPhase } from "@/types";
import { CalendarIcon, CheckSquare, Clock, Plus, AlertCircle, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useProjectPhases } from "@/hooks/use-phases-query";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Partial<ProjectPhase> | null>(null);
  const [newPhase, setNewPhase] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'not-started',
    order: 0,
    project_id: projectId
  });
  const {
    addPhase,
    updatePhaseStatus,
    isLoading: isAddingPhase,
    refetch
  } = useProjectPhases(projectId);
  const {
    toast
  } = useToast();
  const isCompleted = projectStatus === 'completed';

  // Get the current status percentage
  const getProgressPercentage = () => {
    if (phases.length === 0) return 0;
    const completedPhasesCount = phases.filter(phase => phase.status === 'completed').length;
    return Math.round(completedPhasesCount / phases.length * 100);
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

    // Convert to the correct expected format
    await addPhase({
      title: newPhase.title,
      description: newPhase.description,
      dueDate: newPhase.dueDate,
      status: newPhase.status,
      order: phases.length,
      projectId: projectId
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
  const handleEditPhase = (phase: ProjectPhase) => {
    setCurrentPhase(phase);
    setEditDialogOpen(true);
  };
  const handleDeletePhase = (phase: ProjectPhase) => {
    setCurrentPhase(phase);
    setDeleteDialogOpen(true);
  };
  const handleUpdatePhase = async () => {
    if (!currentPhase || !currentPhase.id) return;
    await updatePhaseStatus(currentPhase.id, currentPhase.status || 'not-started');
    setEditDialogOpen(false);
    toast({
      title: "Phase updated",
      description: "The project phase has been updated successfully."
    });
    refetch();
  };
  const handleStatusChange = async (phaseId: string, status: string) => {
    if (isCompleted) return;
    await updatePhaseStatus(phaseId, status);
    toast({
      title: "Status updated",
      description: `Phase status updated to ${status.replace('-', ' ')}.`
    });
    refetch();
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
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Project Progress</h2>
          <p className="text-muted-foreground">
            Track project phases and milestones
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isOwner && !isCompleted && <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Phase
            </Button>}
          
          {isOwner && !isCompleted && phases.length > 0 && getProgressPercentage() === 100 && <Button onClick={handleCompleteProject}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Mark Project as Complete
            </Button>}
        </div>
      </div>
      
      {/* Progress overview */}
      {phases.length > 0 && <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              {phases.filter(phase => phase.status === 'completed').length}/{phases.length} phases completed ({getProgressPercentage()}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={getProgressPercentage()} className="h-2" />
          </CardContent>
        </Card>}
      
      {phases.length === 0 ? <EmptyState icon={AlertCircle} title="No phases yet" description={isOwner ? "Add phases to track progress of your project" : "The project owner hasn't added any phases yet"} action={isOwner && !isCompleted ? <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Phase
              </Button> : undefined} /> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {phases.map(phase => <Card key={phase.id} className="flex flex-col">
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
                
                {phase.completedDate && <div className="flex items-center text-sm text-muted-foreground">
                    <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                    <span>Completed: {formatDate(phase.completedDate)}</span>
                  </div>}
              </CardContent>
              
              <CardFooter className="pt-2 border-t flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Phase {phase.order + 1}
                </div>
                
                {!isCompleted && <div className="flex gap-2">
                    {canUpdateProgress && <Select value={phase.status} onValueChange={value => handleStatusChange(phase.id, value)} disabled={isCompleted}>
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                        </SelectContent>
                      </Select>}
                    
                    {isOwner && <>
                        <Button variant="ghost" size="icon" onClick={() => handleEditPhase(phase)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePhase(phase)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>}
                  </div>}
              </CardFooter>
            </Card>)}
        </div>}

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
              <Input id="title" value={newPhase.title} onChange={e => setNewPhase({
              ...newPhase,
              title: e.target.value
            })} placeholder="e.g., Research, Development, Testing" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={newPhase.description} onChange={e => setNewPhase({
              ...newPhase,
              description: e.target.value
            })} placeholder="Describe what will be accomplished in this phase" rows={3} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date 

            </Label>
              <Input id="dueDate" type="date" value={newPhase.dueDate} onChange={e => setNewPhase({
              ...newPhase,
              dueDate: e.target.value
            })} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select value={newPhase.status} onValueChange={value => setNewPhase({
              ...newPhase,
              status: value
            })}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
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
      
      {/* Dialog for editing phase */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Phase</DialogTitle>
            <DialogDescription>
              Update the details of this project phase
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Phase Title</Label>
              <Input id="edit-title" value={currentPhase?.title || ''} onChange={e => setCurrentPhase({
              ...currentPhase,
              title: e.target.value
            })} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" value={currentPhase?.description || ''} onChange={e => setCurrentPhase({
              ...currentPhase,
              description: e.target.value
            })} rows={3} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={currentPhase?.status || 'not-started'} onValueChange={value => setCurrentPhase({
              ...currentPhase,
              status: value
            })}>
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePhase}>Update Phase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Phase</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this phase? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
            // Here would be the delete logic
            setDeleteDialogOpen(false);
            toast({
              title: "Phase deleted",
              description: "The project phase has been deleted."
            });
          }}>Delete Phase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}