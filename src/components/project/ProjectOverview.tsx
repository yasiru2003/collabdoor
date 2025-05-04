
import React from "react";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Calendar, CheckCircle2, Clock, FileText, MapPin, User2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface ProjectOverviewProps {
  project: Project;
  isOwner: boolean;
  navigateToOrganization: () => void;
  navigateToOrganizerProfile: () => void;
  handleCompleteProject: () => void;
  handleDeleteProject: () => void;
}

export function ProjectOverview({ 
  project, 
  isOwner, 
  navigateToOrganization,
  navigateToOrganizerProfile,
  handleCompleteProject,
  handleDeleteProject
}: ProjectOverviewProps) {
  const isCompleted = project.status === 'completed';
  const { user } = useAuth();
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-50">Draft</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Project Overview</CardTitle>
                <CardDescription>Details about this project</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(project.status)}
                
                {isOwner && !isCompleted && (
                  <Button 
                    className="ml-4"
                    onClick={handleCompleteProject}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </Button>
                )}
                
                {isOwner && (
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteProject}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </Button>
                )}
              </div>
            </div>
            
            {project.image && (
              <div className="mt-4">
                <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-lg">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
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
            
            {isCompleted && project.completedAt && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-medium text-blue-700">Project Completed</h3>
                </div>
                <p className="mt-1 text-blue-600">
                  This project was successfully completed on {formatDate(project.completedAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
