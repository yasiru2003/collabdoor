
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Format the date if available
  const formattedStartDate = project.start_date
    ? new Date(project.start_date).toLocaleDateString()
    : "Not specified";

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold line-clamp-2">
            <Link to={`/projects/${project.id}`} className="hover:text-primary hover:underline">
              {project.title}
            </Link>
          </CardTitle>
          {project.status && (
            <Badge variant="outline" className="capitalize">
              {project.status.replace("-", " ")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          {project.image && (
            <div className="aspect-video w-full overflow-hidden rounded-md mb-4">
              <img
                src={project.image}
                alt={project.title}
                className="h-full w-full object-cover transition-all hover:scale-105"
              />
            </div>
          )}
          <p className="text-muted-foreground line-clamp-3">
            {project.description || "No description provided."}
          </p>
          <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
            {project.location && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-3.5 w-3.5" />
                <span>{project.location}</span>
              </div>
            )}
            {project.start_date && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Starts: {formattedStartDate}</span>
              </div>
            )}
            {project.organization_name && (
              <div className="text-sm font-medium mt-1">
                By: {project.organization_name}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button asChild variant="outline" className="w-full">
          <Link to={`/projects/${project.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
