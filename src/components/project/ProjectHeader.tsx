import { Button } from "@/components/ui/button";
import { Project, Organization } from "@/types";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  partnershipType: string;
  setPartnershipType: (type: string) => void;
  message: string;
  setMessage: (message: string) => void;
  applicationOpen: boolean;
  setApplicationOpen: (open: boolean) => void;
  userOrganizations: Organization[];
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (id: string | null) => void;
  onApplySubmit: () => void;
  onEdit: () => void;
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
  onEdit
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
              <Button onClick={onEdit} variant="outline" size={isMobile ? "default" : "sm"} className="w-full md:w-auto">
                Edit Project
              </Button>
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
            
            <Button 
              variant="default" 
              size={isMobile ? "default" : "sm"} 
              onClick={handleContact}
              className="w-full md:w-auto"
            >
              Contact
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground">{project.description}</p>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {isOwner ? (
            <Badge variant="secondary" className="w-full md:w-auto text-center">
              You are the project organizer
            </Badge>
          ) : applicationStatus === null ? (
            <Button 
              size={isMobile ? "default" : "sm"} 
              onClick={handleApply} 
              disabled={applicationLoading}
              className="w-full md:w-auto"
            >
              Apply to Project
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
