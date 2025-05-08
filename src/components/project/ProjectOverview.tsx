
import React from "react";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProjectOverviewDetails } from "./ProjectOverviewDetails";

interface ProjectOverviewProps {
  project: Project;
  isOwner: boolean;
  navigateToOrganization: () => void;
  navigateToOrganizerProfile: () => void;
  handleCompleteProject: () => void;
  handleDeleteProject: () => void;
  applicationStatus: string | null;
  handleApply: () => void;
  applicationLoading: boolean;
}

export function ProjectOverview({ 
  project, 
  isOwner, 
  navigateToOrganization,
  navigateToOrganizerProfile,
  handleCompleteProject,
  handleDeleteProject,
  applicationStatus,
  handleApply,
  applicationLoading
}: ProjectOverviewProps) {
  const isCompleted = project.status === 'completed';
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
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
      {/* Apply button - Placed at the top of overview for visibility */}
      {!isOwner && applicationStatus === null && project.status !== 'completed' && (
        <Card className="border-primary">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Interested in this project?</h3>
                <p className="text-muted-foreground">Submit your application to collaborate on this project</p>
              </div>
              <Button 
                size="lg" 
                onClick={handleApply}
                disabled={applicationLoading}
                className="w-full md:w-auto"
              >
                {applicationLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Apply to Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className={`${isMobile ? 'flex flex-col space-y-4' : 'flex justify-between items-center'}`}>
              <div>
                <CardTitle className="text-xl md:text-2xl">Project Overview</CardTitle>
                <CardDescription>Details about this project</CardDescription>
              </div>
              <div className={`flex items-center ${isMobile ? 'justify-between' : 'space-x-2'}`}>
                {getStatusBadge(project.status)}
                
                {isOwner && !isCompleted && (
                  <Button 
                    className={`${isMobile ? 'ml-2 px-2 py-1 h-auto text-sm' : 'ml-4'}`}
                    onClick={handleCompleteProject}
                  >
                    <CheckCircle2 className={`${isMobile ? 'mr-1 h-3.5 w-3.5' : 'mr-2 h-4 w-4'}`} />
                    {isMobile ? 'Complete' : 'Mark as Complete'}
                  </Button>
                )}
                
                {isOwner && (
                  <Button 
                    variant="destructive"
                    className={`${isMobile ? 'px-2 py-1 h-auto text-sm' : ''}`}
                    onClick={handleDeleteProject}
                  >
                    <Trash2 className={`${isMobile ? 'mr-1 h-3.5 w-3.5' : 'mr-2 h-4 w-4'}`} />
                    Delete
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
            <ProjectOverviewDetails
              project={project}
              navigateToOrganization={navigateToOrganization}
              navigateToOrganizerProfile={navigateToOrganizerProfile}
            />
            
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
