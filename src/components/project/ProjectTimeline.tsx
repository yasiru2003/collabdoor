
import React from "react";
import { Project, ProjectPhase } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ProjectTimelineProps {
  project: Project;
  phases: ProjectPhase[];
  isOwner: boolean;
  onAddPhase: () => void;
  isLoading: boolean;
}

export function ProjectTimeline({ project, phases, isOwner, onAddPhase, isLoading }: ProjectTimelineProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Timeline</h2>
        {isOwner && (
          <Button onClick={onAddPhase} variant="outline" size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Phase
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">Loading timeline...</p>
          </CardContent>
        </Card>
      ) : phases.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">No phases have been added to this project yet.</p>
            {isOwner && (
              <div className="flex justify-center mt-4">
                <Button onClick={onAddPhase}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add First Phase
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {phases.map((phase) => (
            <Card key={phase.id} className="relative">
              <CardContent className="py-4 pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l" />
                <h3 className="font-semibold">{phase.title}</h3>
                <p className="text-sm text-muted-foreground">{phase.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    {phase.status === "completed" ? "Completed" : 
                     phase.status === "in-progress" ? "In Progress" : "Planned"}
                  </span>
                  {phase.dueDate && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Due: {new Date(phase.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
