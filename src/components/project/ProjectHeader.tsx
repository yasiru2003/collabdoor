
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, CalendarIcon, MapPin, Users, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Project, PartnershipType } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectHeaderProps {
  project: Project;
  isOwner: boolean;
  canUpdateProgress: boolean;
  applicationStatus: string | null;
  saved: boolean;
  setSaved: (saved: boolean) => void;
  handleApply: () => void;
  handleContact: () => void;
  applicationLoading: boolean;
  partnershipType: PartnershipType;
  setPartnershipType: (type: PartnershipType) => void;
  message: string;
  setMessage: (message: string) => void;
  applicationOpen: boolean;
  setApplicationOpen: (open: boolean) => void;
}

export function ProjectHeader({
  project,
  isOwner,
  canUpdateProgress,
  applicationStatus,
  saved,
  setSaved,
  handleApply,
  handleContact,
  applicationLoading,
  partnershipType,
  setPartnershipType,
  message,
  setMessage,
  applicationOpen,
  setApplicationOpen,
}: ProjectHeaderProps) {
  const { user } = useAuth();
  const [userOrganizations, setUserOrganizations] = useState<{id: string, name: string}[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserOrganizations = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id, name")
          .eq("owner_id", user.id);
          
        if (error) throw error;
        
        setUserOrganizations(data || []);
      } catch (error) {
        console.error("Error fetching user organizations:", error);
      }
    };
    
    fetchUserOrganizations();
  }, [user]);

  const handleSaveProject = () => {
    localStorage.setItem(`saved_${project.id}`, (!saved).toString());
    setSaved(!saved);
  };
  
  const handleApplicationSubmit = () => {
    if (handleApply) {
      handleApply();
    }
  };

  const openApplicationDialog = () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/projects/${project.id}` } });
      return;
    }
    
    setApplicationOpen(true);
  };

  // Format dates for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMM yyyy");
  };

  const startDate = project.timeline?.start ? formatDate(project.timeline.start) : "";
  const endDate = project.timeline?.end ? formatDate(project.timeline.end) : "";
  
  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-lg">
        {/* Background image or color - reduced height */}
        <div className="h-24 md:h-32 bg-gradient-to-r from-indigo-600 to-blue-500"></div>
        
        {/* Project info overlay */}
        <div className="relative px-4 pb-4 pt-0 sm:px-6 -mt-16">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Project image */}
            <div className="flex-shrink-0 bg-white p-1 rounded-lg shadow-lg">
              <Avatar className="h-24 w-24 rounded-lg border-2 border-white bg-white">
                <AvatarImage src={project.image} alt={project.title} />
                <AvatarFallback className="bg-muted text-lg font-bold">
                  {project.title.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Project details */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                {project.title}
              </h1>
              
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {project.organizationName && (
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Building className="h-3.5 w-3.5" />
                    <span>{project.organizationName}</span>
                  </div>
                )}
                
                {project.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{project.location}</span>
                  </div>
                )}
                
                {project.timeline?.start && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>
                      {startDate}{endDate && ` - ${endDate}`}
                    </span>
                  </div>
                )}
                
                <Badge variant={
                  project.status === "published" ? "outline" :
                  project.status === "in-progress" ? "secondary" :
                  project.status === "completed" ? "success" : "default"
                }>
                  {project.status === "published" ? "Open" :
                   project.status === "in-progress" ? "In Progress" :
                   project.status === "completed" ? "Completed" : "Draft"}
                </Badge>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {project.partnershipTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="capitalize">
                    {type} partnership
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Action buttons - Fixed position and styling */}
            <div className="flex md:flex-col gap-2 mt-4 md:mt-0 md:min-w-36">
              {!isOwner && (
                <div className="flex md:flex-col gap-2 w-full">
                  {applicationStatus === null && project.status === "published" && (
                    <Button 
                      onClick={openApplicationDialog}
                      disabled={applicationLoading || !user}
                      className="w-full"
                      size="lg"
                    >
                      Apply to Join
                    </Button>
                  )}
                  
                  {applicationStatus === "pending" && (
                    <Button disabled className="w-full">
                      Application Pending
                    </Button>
                  )}
                  
                  {applicationStatus === "approved" && (
                    <Button disabled className="w-full bg-green-600 hover:bg-green-700">
                      Approved Partner
                    </Button>
                  )}
                  
                  {applicationStatus === "rejected" && (
                    <Button disabled className="w-full bg-red-600 hover:bg-red-700">
                      Application Rejected
                    </Button>
                  )}
                  
                  <div className="flex gap-2 w-full">
                    <Button 
                      onClick={handleSaveProject}
                      variant={saved ? "default" : "outline"}
                      size="icon"
                      className="flex-grow-0"
                    >
                      <Bookmark className={saved ? "fill-white" : ""} />
                    </Button>
                    
                    <Button 
                      onClick={handleContact} 
                      variant="outline"
                      disabled={!user}
                      className="flex-grow"
                    >
                      Contact Organizer
                    </Button>
                  </div>
                </div>
              )}
              
              {isOwner && (
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="w-full">
                    Edit Project
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Application Dialog */}
      <Dialog open={applicationOpen} onOpenChange={setApplicationOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply to Join Project</DialogTitle>
            <DialogDescription>
              Apply to collaborate on "{project.title}". Provide details about how you can contribute.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Choose partnership type:</h4>
              <Select
                value={partnershipType}
                onValueChange={(value) => setPartnershipType(value as PartnershipType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select partnership type" />
                </SelectTrigger>
                <SelectContent>
                  {project.partnershipTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type} partnership
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Apply from organization (optional):</h4>
              <Select
                value={selectedOrganizationId || ""}
                onValueChange={setSelectedOrganizationId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Apply as individual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Apply as individual</SelectItem>
                  {userOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Message (optional):</h4>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe how you or your organization can contribute to this project..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplicationOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplicationSubmit} 
              disabled={applicationLoading || !partnershipType}
            >
              {applicationLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
