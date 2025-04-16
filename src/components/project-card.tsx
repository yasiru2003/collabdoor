
import { Project } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, MapPin, Users, Check, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useProjectApplications } from "@/hooks/use-project-applications";

interface ProjectCardProps {
  project: Project;
}

const partnershipTypeColors = {
  monetary: "bg-green-100 text-green-800 border-green-200",
  knowledge: "bg-blue-100 text-blue-800 border-blue-200",
  skilled: "bg-purple-100 text-purple-800 border-purple-200",
  volunteering: "bg-amber-100 text-amber-800 border-amber-200",
};

const partnershipTypeLabels = {
  monetary: "💰 Monetary",
  knowledge: "📚 Knowledge",
  skilled: "🧠 Skilled",
  volunteering: "🤝 Volunteering",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { user } = useAuth();
  const { checkApplicationStatus, applyToProject, isLoading } = useProjectApplications();
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  
  // Check if current user is the project owner
  const isOwner = user && user.id === project.organizerId;
  
  // Select default partnership type to apply with (first one in the list)
  const defaultPartnershipType = project.partnershipTypes && project.partnershipTypes.length > 0 
    ? project.partnershipTypes[0] 
    : "skilled";

  // Check if the user has already applied
  useEffect(() => {
    const checkApplication = async () => {
      if (user && project.id) {
        // Only check application status for projects with valid UUIDs
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(project.id);
        
        if (isValidUUID) {
          const application = await checkApplicationStatus(project.id, user.id);
          if (application) {
            setApplicationStatus(application.status);
          }
        }
      }
    };
    
    if (user) {
      checkApplication();
    }
  }, [user, project.id, checkApplicationStatus]);

  // Handle apply button click
  const handleApply = async () => {
    if (!user || !project.id) return;
    
    // Only allow applying to projects with valid UUIDs
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(project.id);
    
    if (!isValidUUID) {
      console.error("Cannot apply to project with invalid ID format:", project.id);
      return;
    }
    
    const result = await applyToProject(project.id, user.id, defaultPartnershipType);
    if (result) {
      setApplicationStatus("pending");
    }
  };

  // Render apply button based on conditions
  const renderApplyButton = () => {
    if (isOwner) {
      return null; // Don't show apply button for the project owner
    }
    
    if (applicationStatus === "pending") {
      return (
        <Button size="sm" variant="outline" disabled>
          <Check className="h-4 w-4 mr-1" /> Applied
        </Button>
      );
    }
    
    if (applicationStatus === "approved") {
      return (
        <Button size="sm" variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800" disabled>
          <Check className="h-4 w-4 mr-1" /> Approved
        </Button>
      );
    }
    
    if (applicationStatus === "rejected") {
      return (
        <Button size="sm" variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800" disabled>
          Application Rejected
        </Button>
      );
    }
    
    return (
      <Button size="sm" onClick={handleApply} disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
        Apply
      </Button>
    );
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
      <div className="aspect-video w-full bg-muted overflow-hidden">
        {project.image ? (
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/10">
            <span className="text-lg font-semibold text-primary/70">{project.title.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>
            <Link to={`/projects/${project.id}`} className="hover:text-primary transition-colors">
              {project.title}
            </Link>
          </CardTitle>
          <Badge variant={project.status === 'published' ? "default" : "outline"}>
            {project.status === 'published' ? 'Active' : 'Completed'}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.partnershipTypes && project.partnershipTypes.map((type) => (
            <Badge key={type} variant="outline" className={partnershipTypeColors[type as keyof typeof partnershipTypeColors]}>
              {partnershipTypeLabels[type as keyof typeof partnershipTypeLabels]}
            </Badge>
          ))}
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {project.timeline && project.timeline.start ? new Date(project.timeline.start).toLocaleDateString() : "No start date"} - 
              {project.timeline && project.timeline.end ? new Date(project.timeline.end).toLocaleDateString() : "No end date"}
            </span>
          </div>
          {project.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{project.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{project.partners?.length || 0} partners</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-muted">
              {project.organizerName ? project.organizerName.substring(0, 2).toUpperCase() : "??"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{project.organizerName || "Unknown"}</span>
        </div>
        {renderApplyButton()}
      </CardFooter>
    </Card>
  );
}
