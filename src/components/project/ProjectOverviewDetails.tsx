
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Clock, FileText, MapPin, User2 } from "lucide-react";
import { format } from "date-fns";

interface ProjectDetailsProps {
  project: {
    organizerId: string;
    organizerName: string;
    organizationName?: string;
    organizationId?: string;
    location?: string;
    timeline?: {
      start?: string | null;
      end?: string | null;
    };
    proposalFilePath?: string;
    requiredSkills?: string[];
    partnershipTypes?: string[];
  };
  navigateToOrganization: () => void;
  navigateToOrganizerProfile: () => void;
}

export function ProjectOverviewDetails({
  project,
  navigateToOrganization,
  navigateToOrganizerProfile
}: ProjectDetailsProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  return (
    <>
      <div className="prose max-w-none">
        <h3 className="text-lg font-medium mb-2">Description</h3>
        <p className="whitespace-pre-line">{project.description}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Project Details</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-start">
              <User2 className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Organizer</div>
                <button 
                  onClick={navigateToOrganizerProfile}
                  className="font-medium hover:underline"
                >
                  {project.organizerName}
                </button>
              </div>
            </div>
            
            {project.organizationName && (
              <div className="flex items-start">
                <Building2 className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Organization</div>
                  <button 
                    onClick={navigateToOrganization}
                    className="font-medium hover:underline"
                  >
                    {project.organizationName}
                  </button>
                </div>
              </div>
            )}
            
            {project.location && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{project.location}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Start Date</div>
                <div className="font-medium">{formatDate(project.timeline?.start || null)}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">End Date</div>
                <div className="font-medium">{formatDate(project.timeline?.end || null)}</div>
              </div>
            </div>
            
            {project.proposalFilePath && (
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Project Proposal</div>
                  <a 
                    href={project.proposalFilePath}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary hover:underline"
                    onClick={(e) => {
                      // Log when proposal is accessed and prevent default navigation
                      console.log("Opening proposal document:", project.proposalFilePath);
                    }}
                  >
                    View Document
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {project.requiredSkills && project.requiredSkills.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {project.requiredSkills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {project.partnershipTypes && project.partnershipTypes.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Partnership Types</h3>
          <div className="flex flex-wrap gap-2">
            {project.partnershipTypes.map((type, index) => (
              <Badge key={index} variant="outline" className="capitalize">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
