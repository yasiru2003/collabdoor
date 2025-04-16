
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  ChevronDown, 
  Building2, 
  CalendarIcon, 
  MapPin, 
  Tag,
  BookmarkPlus,
  BookmarkCheck,
  MessageSquare,
  HandHeart,
  Brain,
  Briefcase,
  Users,
  CornerDownRight,
  School
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Project, PartnershipType } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface ProjectHeaderProps {
  project: Project;
  isOwner: boolean;
  canUpdateProgress: boolean;
  applicationStatus: string | null;
  applicationLoading: boolean;
  saved: boolean;
  setSaved: (saved: boolean) => void;
  handleApply: () => void;
  handleContact: () => void;
  partnershipType: PartnershipType;
  setPartnershipType: (type: PartnershipType) => void;
  message: string;
  setMessage: (message: string) => void;
  applicationOpen: boolean;
  setApplicationOpen: (open: boolean) => void;
  userOrganizations?: any[];
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (id: string | null) => void;
}

export function ProjectHeader({
  project,
  isOwner,
  canUpdateProgress,
  applicationStatus,
  applicationLoading,
  saved,
  setSaved,
  handleApply,
  handleContact,
  partnershipType,
  setPartnershipType,
  message,
  setMessage,
  applicationOpen,
  setApplicationOpen,
  userOrganizations = [],
  selectedOrganizationId,
  setSelectedOrganizationId
}: ProjectHeaderProps) {
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  
  const handleSave = () => {
    localStorage.setItem(`saved_${project.id}`, saved ? "false" : "true");
    setSaved(!saved);
  };
  
  const partnershipIcons = {
    "monetary": <HandHeart className="h-5 w-5 mr-2" />,
    "knowledge": <Brain className="h-5 w-5 mr-2" />,
    "skilled": <Briefcase className="h-5 w-5 mr-2" />,
    "volunteering": <Users className="h-5 w-5 mr-2" />
  };
  
  const partnershipLabels = {
    "monetary": "Financial Support",
    "knowledge": "Knowledge/Expertise",
    "skilled": "Skilled Work",
    "volunteering": "Volunteer Work"
  };
  
  const partnershipDescriptions = {
    "monetary": "Provide financial resources to support the project",
    "knowledge": "Contribute with expertise, consultation, or mentoring",
    "skilled": "Offer professional services or specialized skills",
    "volunteering": "Participate with your time and effort"
  };
  
  const getStatusBadgeColor = () => {
    switch (project.status) {
      case 'draft': return 'bg-slate-500';
      case 'published': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  };
  
  const getApplicationButtonText = () => {
    if (applicationStatus === "pending") return "Application Pending";
    if (applicationStatus === "approved") return "Application Approved";
    if (applicationStatus === "rejected") return "Application Rejected";
    return "Apply to this Project";
  };
  
  const getApplicationButtonVariant = () => {
    if (applicationStatus === "pending") return "outline";
    if (applicationStatus === "approved") return "ghost";
    if (applicationStatus === "rejected") return "ghost";
    return "default";
  };
  
  const isApplicationEnabled = project.applicationsEnabled !== false && project.status === 'published';
  
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge className={getStatusBadgeColor()}>
              {project.status === 'in-progress' ? 'In Progress' : 
               project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
            {project.organizationName && (
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                <span>{project.organizationName}</span>
              </div>
            )}
            
            {project.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{project.location}</span>
              </div>
            )}
            
            {project.category && (
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                <span>{project.category}</span>
              </div>
            )}
            
            {project.timeline.start && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>
                  {new Date(project.timeline.start).toLocaleDateString()}
                  {project.timeline.end && ` - ${new Date(project.timeline.end).toLocaleDateString()}`}
                </span>
              </div>
            )}
          </div>
        </div>
      
        <div className="flex flex-wrap gap-2">
          {isOwner && (
            <Button asChild variant="outline">
              <Link to={`/projects/${project.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Link>
            </Button>
          )}
          
          {!isOwner && (
            <>
              <Button 
                variant={saved ? "outline" : "ghost"} 
                size="icon"
                onClick={handleSave}
              >
                {saved ? 
                  <BookmarkCheck className="h-5 w-5 text-primary" /> : 
                  <BookmarkPlus className="h-5 w-5" />
                }
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleContact}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
              
              {isApplicationEnabled && !isOwner && !canUpdateProgress && (
                <Button 
                  onClick={() => setApplicationOpen(true)}
                  disabled={applicationLoading || applicationStatus === "pending" || applicationStatus === "approved"}
                  variant={getApplicationButtonVariant()}
                >
                  {getApplicationButtonText()}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      {project.partnershipTypes && project.partnershipTypes.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Partnership Types Needed:</h3>
          <div className="flex flex-wrap gap-2">
            {project.partnershipTypes.map((type) => (
              <Badge key={type} variant="secondary" className="flex items-center">
                {partnershipIcons[type]}
                {partnershipLabels[type as keyof typeof partnershipLabels]}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <Dialog open={applicationOpen} onOpenChange={setApplicationOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Apply to Project</DialogTitle>
            <DialogDescription>
              Submit an application to partner on the project "{project.title}". The project organizer will review your application.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Partnership type selection */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">How do you want to contribute?</h3>
                <RadioGroup 
                  value={partnershipType} 
                  onValueChange={(value) => setPartnershipType(value as PartnershipType)}
                  className="space-y-3"
                >
                  {project.partnershipTypes.map((type) => (
                    <div key={type} className="flex items-start space-x-2">
                      <RadioGroupItem value={type} id={type} className="mt-1" />
                      <div className="grid gap-1.5">
                        <Label htmlFor={type} className="font-medium flex items-center">
                          {partnershipIcons[type]}
                          {partnershipLabels[type as keyof typeof partnershipLabels]}
                        </Label>
                        <p className="text-sm text-muted-foreground pl-7">
                          {partnershipDescriptions[type as keyof typeof partnershipDescriptions]}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            
            {/* Organization selection */}
            {userOrganizations && userOrganizations.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="organization" className="text-sm font-medium">
                  Apply as individual or organization?
                </Label>
                <Select 
                  value={selectedOrganizationId || "individual"} 
                  onValueChange={(value) => setSelectedOrganizationId(value === "individual" ? null : value)}
                >
                  <SelectTrigger id="organization">
                    <SelectValue placeholder="Select how you want to apply" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">As an Individual</SelectItem>
                    {userOrganizations.map((org) => (
                      <SelectItem key={org.organizations.id} value={org.organizations.id}>
                        {org.organizations.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Applying as an organization may increase your chances of acceptance
                </p>
              </div>
            )}
            
            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message to the project organizer
              </Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you want to partner on this project..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApplicationOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              disabled={applicationLoading}
            >
              {applicationLoading ? "Sending..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
