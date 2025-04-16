
import React, { useState } from "react";
import { useProjectPhases } from "@/hooks/use-supabase-query";
import { useProjectPhases as useProjectPhasesMutations } from "@/hooks/use-project-phases";
import { ProjectPhase } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, Clock, ListChecks, PlusCircle, Loader2, Edit, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface ProjectTrackerProps {
  projectId: string;
  isOwner: boolean;
}

export function ProjectTracker({ projectId, isOwner }: ProjectTrackerProps) {
  const { data: phases, isLoading: phasesLoading, refetch } = useProjectPhases(projectId);
  const { addProjectPhase, updateProjectPhase, deleteProjectPhase, isLoading: mutationLoading } = useProjectPhasesMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Partial<ProjectPhase> | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Calculate progress percentage
  const totalPhases = phases?.length || 0;
  const completedPhases = phases?.filter(phase => phase.status === 'completed').length || 0;
  const progressPercentage = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

  const handleAddPhase = () => {
    setEditMode(false);
    setCurrentPhase({
      title: '',
      description: '',
      status: 'not-started',
      order: phases?.length || 0,
    });
    setDialogOpen(true);
  };

  const handleEditPhase = (phase: ProjectPhase) => {
    setEditMode(true);
    setCurrentPhase(phase);
    setDialogOpen(true);
  };

  const handleDeletePhase = (phase: ProjectPhase) => {
    setCurrentPhase(phase);
    setDeleteDialogOpen(true);
  };

  const handleSavePhase = async () => {
    if (!currentPhase || !currentPhase.title) return;

    if (editMode && currentPhase.id) {
      await updateProjectPhase(currentPhase.id, currentPhase);
    } else {
      await addProjectPhase(projectId, currentPhase as Omit<ProjectPhase, 'id'>);
    }

    setDialogOpen(false);
    setCurrentPhase(null);
    refetch();
  };

  const confirmDeletePhase = async () => {
    if (currentPhase?.id) {
      await deleteProjectPhase(currentPhase.id, projectId);
      setDeleteDialogOpen(false);
      setCurrentPhase(null);
      refetch();
    }
  };

  const handleStatusChange = async (phaseId: string, status: 'not-started' | 'in-progress' | 'completed') => {
    const updates: Partial<ProjectPhase> = { status };
    
    // If marked as completed, set the completed date
    if (status === 'completed') {
      updates.completedDate = new Date().toISOString();
    } else {
      updates.completedDate = undefined;
    }
    
    await updateProjectPhase(phaseId, updates);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'not-started':
        return <Badge variant="outline" className="bg-gray-100">Not Started</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (phasesLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Project Tracker</CardTitle>
          <CardDescription>Loading project phases...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <ListChecks className="h-5 w-5" /> Project Tracker
          </CardTitle>
          <CardDescription>Track and manage project progress</CardDescription>
        </div>
        {isOwner && (
          <Button onClick={handleAddPhase} size="sm" className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" /> Add Phase
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress ({progressPercentage}%)</span>
              <span className="text-sm text-muted-foreground">{completedPhases}/{totalPhases} phases completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <Separator className="my-4" />
          
          {phases && phases.length > 0 ? (
            <div className="space-y-4">
              {phases.map((phase) => (
                <div key={phase.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{phase.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(phase.status)}
                      {isOwner && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleEditPhase(phase)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePhase(phase)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {phase.dueDate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
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
                  
                  {isOwner && (
                    <div className="flex gap-2 mt-3">
                      <Select
                        value={phase.status}
                        onValueChange={(value) => handleStatusChange(phase.id, value as 'not-started' | 'in-progress' | 'completed')}
                      >
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium mb-1">No Phases Yet</h3>
              <p className="text-sm max-w-md mx-auto">
                {isOwner 
                  ? "Get started by adding phases to track your project's progress."
                  : "The project organizer has not added any phases yet."}
              </p>
              {isOwner && (
                <Button onClick={handleAddPhase} className="mt-4">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add First Phase
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Dialog for adding/editing phases */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Phase" : "Add New Phase"}</DialogTitle>
            <DialogDescription>
              {editMode ? "Update the details of this project phase." : "Add a new phase to track project progress."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Phase Title</Label>
              <Input
                id="title"
                value={currentPhase?.title || ''}
                onChange={(e) => setCurrentPhase({...currentPhase, title: e.target.value})}
                placeholder="e.g., Planning, Development, Testing"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentPhase?.description || ''}
                onChange={(e) => setCurrentPhase({...currentPhase, description: e.target.value})}
                placeholder="Describe the activities in this phase..."
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={currentPhase?.status || 'not-started'}
                onValueChange={(value) => setCurrentPhase({...currentPhase, status: value as 'not-started' | 'in-progress' | 'completed'})}
              >
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
            
            <div className="grid gap-2">
              <Label>Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !currentPhase?.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentPhase?.dueDate ? format(new Date(currentPhase.dueDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentPhase?.dueDate ? new Date(currentPhase.dueDate) : undefined}
                    onSelect={(date) => setCurrentPhase({
                      ...currentPhase, 
                      dueDate: date ? date.toISOString() : undefined
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePhase} disabled={!currentPhase?.title || mutationLoading}>
              {mutationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editMode ? "Update Phase" : "Add Phase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation dialog for deleting phases */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Phase</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this phase? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeletePhase} disabled={mutationLoading}>
              {mutationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
