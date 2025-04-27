
import { Button } from "@/components/ui/button";
import { Project, Organization } from "@/types";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Trash } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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

interface ProjectHeaderProps {
  project: Project;
  isOwner: boolean;
  canUpdateProgress?: boolean;
  applicationStatus?: string | null;
  saved?: boolean;
  setSaved?: (saved: boolean) => void;
  handleApply?: () => void;
  handleContact?: () => void;
  applicationLoading?: boolean;
  partnershipType?: string;
  setPartnershipType?: (type: string) => void;
  message?: string;
  setMessage?: (message: string) => void;
  applicationOpen?: boolean;
  setApplicationOpen?: (open: boolean) => void;
  userOrganizations?: Organization[];
  selectedOrganizationId?: string | null;
  setSelectedOrganizationId?: (id: string | null) => void;
  onApplySubmit?: () => void;
  onEdit: () => void;
  onDelete: () => void;
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
  userOrganizations,
  selectedOrganizationId,
  setSelectedOrganizationId,
  onApplySubmit,
  onEdit,
  onDelete
}: ProjectHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-card border rounded-lg p-4 md:p-6 mb-6 relative">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold mb-2">{project.title}</h1>
            {project.status === "completed" && (
              <Badge variant="outline" className="gap-1.5 mt-1 w-fit">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </Badge>
            )}
            {project.status === "pending_publish" && (
              <Badge variant="destructive" className="gap-1.5 mt-1 w-fit">
                <AlertCircle className="h-4 w-4" />
                Pending Approval
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isOwner && (
              <>
                <Button onClick={onEdit} variant="outline" size={isMobile ? "default" : "sm"} className="w-full md:w-auto">
                  Edit Project
                </Button>
                <Button onClick={onDelete} variant="destructive" size={isMobile ? "default" : "sm"} className="w-full md:w-auto">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            {applicationStatus === "pending" ? (
              <Badge variant="secondary" className="w-full md:w-auto text-center">
                Application Pending
              </Badge>
            ) : applicationStatus === "approved" ? (
              <Badge variant="success" className="w-full md:w-auto text-center">
                Application Approved
              </Badge>
            ) : null}
            
            {handleContact && (
              <Button 
                variant="default" 
                size={isMobile ? "default" : "sm"} 
                onClick={handleContact}
                className="w-full md:w-auto"
              >
                Contact
              </Button>
            )}
          </div>
        </div>

        <p className="text-muted-foreground">{project.description}</p>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {isOwner ? (
            <Badge variant="secondary" className="w-full md:w-auto text-center">
              You are the project organizer
            </Badge>
          ) : applicationStatus === null && project.status !== "completed" && handleApply ? (
            <Button 
              size={isMobile ? "default" : "sm"} 
              onClick={handleApply} 
              disabled={applicationLoading || project.applicationsEnabled === false}
              className="w-full md:w-auto"
            >
              {project.applicationsEnabled === false ? "Applications Paused" : "Apply to Project"}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Application Dialog */}
      {applicationOpen && setApplicationOpen && partnershipType && setPartnershipType && 
        message !== undefined && setMessage && onApplySubmit && (
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
                  onValueChange={setPartnershipType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select partnership type" />
                  </SelectTrigger>
                  <SelectContent>
                    {project.partnershipTypes && project.partnershipTypes.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type} partnership
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {userOrganizations && selectedOrganizationId !== undefined && setSelectedOrganizationId && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Apply from organization (optional):</h4>
                  <Select
                    value={selectedOrganizationId || "individual"}
                    onValueChange={setSelectedOrganizationId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Apply as individual</SelectItem>
                      {userOrganizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
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
                onClick={onApplySubmit} 
                disabled={applicationLoading || !partnershipType}
              >
                {applicationLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
