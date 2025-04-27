
import React from "react";
import { Project } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProjectTeamProps {
  project: Project;
}

export function ProjectTeam({ project }: ProjectTeamProps) {
  // For now, we'll display a placeholder since we don't have team members data structured yet
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Project Owner</h2>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>
                {(project.organizer_name || "").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{project.organizer_name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">Project Owner</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 pb-6">
          <h2 className="text-xl font-semibold mb-4">Team Members</h2>
          <p className="text-muted-foreground">
            No team members have been added to this project yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
