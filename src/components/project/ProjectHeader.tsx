
import { useState } from "react";
import { Project, PartnershipType } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";
import { BookmarkIcon, CheckCircleIcon, MessageSquare, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface ProjectHeaderProps {
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
  userOrganizations?: any[];
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (id: string | null) => void;
  onApplySubmit: () => void;
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
  userOrganizations = [],
  selectedOrganizationId,
  setSelectedOrganizationId,
  onApplySubmit
}: ProjectHeaderProps) {
  const [localSaved, setLocalSaved] = useState(saved);
  
  const handleSaveProject = () => {
    // Toggle saved state
    const newSavedState = !localSaved;
    setLocalSaved(newSavedState);
    setSaved(newSavedState);
    
    // Save to localStorage (in a real app, this would be saved to a database)
    if (newSavedState) {
      localStorage.setItem(`saved_${project.id}`, "true");
    } else {
      localStorage.removeItem(`saved_${project.id}`);
    }
  };
  
  const getApplicationStatusBadge = () => {
    switch (applicationStatus) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Application Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Application Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Application Rejected</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="mb-8">
      {project.image && (
        <div className="relative h-64 w-full mb-6 overflow-hidden rounded-lg">
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="capitalize">
              {project.category || "General"}
            </Badge>
            
            <Badge variant="outline" className="capitalize">
              {project.status}
            </Badge>
            
            {applicationStatus && getApplicationStatusBadge()}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          {!isOwner && !applicationStatus && project.status !== 'completed' && (
            <Button onClick={handleApply} disabled={applicationLoading}>
              <UserPlus className="mr-2 h-4 w-4" />
              Apply Now
            </Button>
          )}
          
          {!isOwner && (
            <Button variant="outline" onClick={handleContact}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleSaveProject} 
            className={localSaved ? "bg-blue-50 border-blue-200" : ""}
          >
            <BookmarkIcon className={`mr-2 h-4 w-4 ${localSaved ? "text-blue-500 fill-blue-500" : ""}`} />
            {localSaved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
      
      {/* Application Dialog */}
      <Dialog open={applicationOpen} onOpenChange={setApplicationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply to Project</DialogTitle>
            <DialogDescription>
              Submit your application to join this project
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partnership-type">Partnership Type</Label>
              <Select
                value={partnershipType}
                onValueChange={(value) => setPartnershipType(value as PartnershipType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select partnership type" />
                </SelectTrigger>
                <SelectContent>
                  {project.partnershipTypes?.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                  {!project.partnershipTypes?.includes("skilled") && (
                    <SelectItem value="skilled">Skilled</SelectItem>
                  )}
                  {!project.partnershipTypes?.includes("financial") && (
                    <SelectItem value="financial">Financial</SelectItem>
                  )}
                  {!project.partnershipTypes?.includes("resource") && (
                    <SelectItem value="resource">Resource</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {userOrganizations && userOrganizations.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="organization">Apply as</Label>
                <Select
                  value={selectedOrganizationId || 'individual'}
                  onValueChange={(value) => setSelectedOrganizationId(value === 'individual' ? null : value)}
                >
                  <SelectTrigger id="organization">
                    <SelectValue placeholder="Select organization or individual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    {userOrganizations.map((org) => (
                      <SelectItem key={org.organizations.id} value={org.organizations.id}>
                        {org.organizations.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you want to join this project"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApplicationOpen(false)}
              disabled={applicationLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={onApplySubmit} 
              disabled={applicationLoading}
            >
              {applicationLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
