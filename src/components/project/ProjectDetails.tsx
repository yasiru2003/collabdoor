
import React from "react";
import { Project } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ProjectDetailsProps {
  project: Project;
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-2">Project Description</h2>
          <p className="text-muted-foreground">{project.description}</p>
          
          {/* Remove the check for 'goals' property since it doesn't exist in the Project type */}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Project Information</h2>
          
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {project.category && (
              <>
                <dt className="font-medium">Category:</dt>
                <dd className="text-muted-foreground">{project.category}</dd>
              </>
            )}

            {project.location && (
              <>
                <dt className="font-medium">Location:</dt>
                <dd className="text-muted-foreground">{project.location}</dd>
              </>
            )}

            {project.created_at && (
              <>
                <dt className="font-medium">Created:</dt>
                <dd className="text-muted-foreground">
                  {format(new Date(project.created_at), "PPP")}
                </dd>
              </>
            )}

            {project.start_date && (
              <>
                <dt className="font-medium">Start Date:</dt>
                <dd className="text-muted-foreground">
                  {format(new Date(project.start_date), "PPP")}
                </dd>
              </>
            )}

            {project.end_date && (
              <>
                <dt className="font-medium">End Date:</dt>
                <dd className="text-muted-foreground">
                  {format(new Date(project.end_date), "PPP")}
                </dd>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      {project.partnershipTypes && project.partnershipTypes.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Partnership Types</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.partnershipTypes.map((type) => (
                <Badge key={type} variant="outline" className="capitalize">
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
