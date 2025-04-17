import React from "react";
import { Project, PartnershipType, Organization } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, BookmarkCheck, Clock, HandshakeIcon, MessageCircle, Users } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  userOrganizations: Organization[];
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
  userOrganizations,
  selectedOrganizationId,
  setSelectedOrganizationId,
  onApplySubmit
}: ProjectHeaderProps) {
  const isCompleted = project.status === 'completed';
  
  const handleToggleSave = () => {
    setSaved(!saved);
    localStorage.setItem(`saved_${project.id}`, (!saved).toString());
  };
  
  const getStatus = () => {
    if (!applicationStatus) return null;
    
    switch (applicationStatus) {
      case 'pending':
        return (
          <div className="flex items-center text-amber-600">
            <Clock className="mr-1 h-4 w-4" />
            <span>Application Pending</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center text-green-600">
            <Users className="mr-1 h-4 w-4" />
            <span>You are a Partner</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-600">
            <span>Application Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold truncate max-w-2xl">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
            {getStatus()}
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!isOwner && !isCompleted && !applicationStatus && (
            <Button onClick={handleApply} className="flex items-center">
              <HandshakeIcon className="mr-2 h-4 w-4" />
              Apply to Partner
            </Button>
          )}
          
          {!isOwner && (
            <Button variant="outline" onClick={handleContact}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSave}
            className="w-10 h-10"
          >
            {saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Application Dialog */}
      <Dialog open={applicationOpen} onOpenChange={setApplicationOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply as Partner</DialogTitle>
            <DialogDescription>
              Submit your application to partner with this project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label>Apply as</Label>
              <RadioGroup 
                value={selectedOrganizationId || "individual"}
                onValueChange={(value) => setSelectedOrganizationId(value === "individual" ? null : value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="cursor-pointer">Individual (Personal Account)</Label>
                </div>
                
                {userOrganizations && userOrganizations.length > 0 && (
                  <>
                    <div className="text-sm text-muted-foreground mt-2">Or apply on behalf of an organization:</div>
                    {userOrganizations.map((org) => (
                      <div key={org.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={org.id} id={org.id} />
                        <Label htmlFor={org.id} className="cursor-pointer">{org.name}</Label>
                      </div>
                    ))}
                  </>
                )}
              </RadioGroup>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="partnership-type">Partnership Type</Label>
              <Select 
                value={partnershipType} 
                onValueChange={(value: PartnershipType) => setPartnershipType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select partnership type" />
                </SelectTrigger>
                <SelectContent>
                  {!project.partnershipTypes?.includes("skilled") && (
                    <SelectItem value="skilled">Skilled</SelectItem>
                  )}
                  {!project.partnershipTypes?.includes("monetary") && (
                    <SelectItem value="monetary">Monetary</SelectItem>
                  )}
                  {!project.partnershipTypes?.includes("volunteering") && (
                    <SelectItem value="volunteering">Volunteering</SelectItem>
                  )}
                  {!project.partnershipTypes?.includes("knowledge") && (
                    <SelectItem value="knowledge">Knowledge</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Briefly describe how you can contribute to this project..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplicationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onApplySubmit} disabled={applicationLoading}>
              {applicationLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
