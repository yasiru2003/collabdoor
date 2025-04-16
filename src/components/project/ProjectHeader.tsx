
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  StarOff, 
  UserIcon, 
  Building2Icon, 
  TagIcon, 
  MapPinIcon, 
  InfoIcon, 
  BarChart2,
  Mail,
  Check,
  CheckCircle,
} from "lucide-react";
import { Project, PartnershipType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ProjectHeaderProps {
  project: Project;
  isOwner: boolean;
  canUpdateProgress: boolean;
  applicationStatus: string | null;
  saved: boolean;
  setSaved: (saved: boolean) => void;
  handleApply: () => Promise<void>;
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
  setApplicationOpen
}: ProjectHeaderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Determine if we should show the completed badge
  const showCompletedBadge = project.status === "completed";
  
  // Check if project has organization
  const hasOrganization = !!project.organizationId && !!project.organizationName;

  const navigateToOrganization = () => {
    if (project?.organizationId) {
      navigate(`/organizations/${project.organizationId}`);
    }
  };

  const handleSaveProject = () => {
    const newSaved = !saved;
    setSaved(newSaved);
    localStorage.setItem(`saved_${project.id}`, newSaved.toString());

    toast({
      title: newSaved ? "Project saved" : "Project removed from saved",
      description: newSaved
        ? "This project has been added to your saved list."
        : "This project has been removed from your saved list.",
    });
  };

  const renderApplyButton = () => {
    if (isOwner) {
      return (
        <Button size="sm" className="flex items-center gap-1">
          <Mail className="h-4 w-4" /> Contact
        </Button>
      );
    }
    
    if (applicationStatus === "pending") {
      return (
        <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
          <Check className="h-4 w-4" /> Applied
        </Button>
      );
    }
    
    if (applicationStatus === "approved") {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleContact}
          className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 flex items-center gap-1"
        >
          <Mail className="h-4 w-4 mr-1" /> Contact
        </Button>
      );
    }
    
    if (applicationStatus === "rejected") {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          disabled 
          className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 flex items-center gap-1"
        >
          Application Rejected
        </Button>
      );
    }
    
    return (
      <Dialog open={applicationOpen} onOpenChange={setApplicationOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="flex items-center gap-1">
            <Mail className="h-4 w-4" /> Apply
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for Partnership</DialogTitle>
            <DialogDescription>
              Submit your application to partner on this project. The organizer will review your request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="partnership-type">Partnership Type</Label>
              <Select 
                value={partnershipType} 
                onValueChange={(value) => setPartnershipType(value as PartnershipType)}
              >
                <SelectTrigger id="partnership-type">
                  <SelectValue placeholder="Select type of partnership" />
                </SelectTrigger>
                <SelectContent>
                  {project?.partnershipTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Describe how you'd like to contribute to this project..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplicationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={applicationLoading}>
              {applicationLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
          {showCompletedBadge && (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Completed
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-muted-foreground">
          {hasOrganization ? (
            <div className="flex items-center gap-1">
              <Building2Icon className="h-4 w-4" />
              <Button 
                variant="link" 
                onClick={navigateToOrganization} 
                className="h-auto p-0 text-sm text-muted-foreground hover:text-primary"
              >
                {project.organizationName} (by {project.organizerName})
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              <span className="text-sm">{project.organizerName}</span>
            </div>
          )}
          {project.category && (
            <div className="flex items-center gap-1">
              <TagIcon className="h-4 w-4" />
              <span className="text-sm">{project.category}</span>
            </div>
          )}
          {project.location && (
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              <span className="text-sm">{project.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <InfoIcon className="h-4 w-4" />
            <span className="text-sm capitalize">{project.status}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 self-end md:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveProject}
          className="flex items-center gap-1"
        >
          {saved ? (
            <>
              <StarOff className="h-4 w-4" /> Unsave
            </>
          ) : (
            <>
              <Star className="h-4 w-4" /> Save
            </>
          )}
        </Button>
        {canUpdateProgress && (
          <Button
            variant="progress"
            size="sm"
            onClick={() => setSearchParams({ tab: "progress" })}
            className="flex items-center gap-1"
          >
            <BarChart2 className="h-4 w-4" /> Track Progress
          </Button>
        )}
        {renderApplyButton()}
      </div>
    </div>
  );
}
