import { Project, PartnershipType } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, MapPin, Users, Check, Loader2, BarChart2, Building, Mail, Pause } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useProjectApplications } from "@/hooks/use-project-applications";
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
import { Textarea } from "./ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface ProjectCardProps {
  project: Project;
}

const partnershipTypeColors = {
  monetary: "bg-green-100 text-green-800 border-green-200",
  knowledge: "bg-blue-100 text-blue-800 border-blue-200",
  skilled: "bg-purple-100 text-purple-800 border-purple-200",
  volunteering: "bg-amber-100 text-amber-800 border-amber-200",
};

const partnershipTypeLabels = {
  monetary: "💰 Monetary",
  knowledge: "📚 Knowledge",
  skilled: "🧠 Skilled",
  volunteering: "🤝 Volunteering",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { user } = useAuth();
  const { checkApplicationStatus, applyToProject, isLoading } = useProjectApplications();
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // New state for application dialog
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [partnershipType, setPartnershipType] = useState<PartnershipType>(
    project.partnershipTypes && project.partnershipTypes.length > 0 
      ? project.partnershipTypes[0] as PartnershipType
      : "skilled"
  );
  const [message, setMessage] = useState("");
  const [userOrganizations, setUserOrganizations] = useState<{id: string, name: string}[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [partnerCount, setPartnerCount] = useState<number>(0);
  
  // Check if current user is the project owner
  const isOwner = user && user.id === project.organizerId;
  
  // Check if the project is completed
  const isCompleted = project.status === 'completed';
  
  // Check if applications are paused for this project
  const isApplicationPaused = project.applicationsEnabled === false;

  // Load user organizations
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

  // Get actual partner count
  useEffect(() => {
    const fetchPartnerCount = async () => {
      if (!project.id) return;

      try {
        // Query the partnerships table to get actual partner count
        const { data, error, count } = await supabase
          .from("partnerships")
          .select("id", { count: 'exact' })
          .eq("project_id", project.id)
          .eq("status", "approved");
          
        if (error) throw error;
        
        setPartnerCount(count || 0);
      } catch (error) {
        console.error("Error fetching partner count:", error);
        // Fallback to project.partners length if available
        setPartnerCount(project.partners?.length || 0);
      }
    };
    
    fetchPartnerCount();
  }, [project.id]);

  // Check if the user has already applied
  useEffect(() => {
    const checkApplication = async () => {
      if (user && project.id) {
        // Only check application status for projects with valid UUIDs
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(project.id);
        
        if (isValidUUID) {
          const application = await checkApplicationStatus(project.id, user.id);
          if (application) {
            setApplicationStatus(application.status);
          }
        }
      }
    };
    
    if (user) {
      checkApplication();
    }
  }, [user, project.id, checkApplicationStatus]);

  // Handle apply button click
  const handleApply = async () => {
    if (!user || !project.id) return;
    
    // Only allow applying to projects with valid UUIDs
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(project.id);
    
    if (!isValidUUID) {
      console.error("Cannot apply to project with invalid ID format:", project.id);
      return;
    }
    
    const result = await applyToProject(
      project.id, 
      user.id, 
      partnershipType, 
      message, 
      selectedOrganizationId
    );
    
    if (result) {
      setApplicationStatus("pending");
      setApplicationOpen(false);
      setMessage("");
      setSelectedOrganizationId(null);
    }
  };

  // Navigate to project detail with progress tab focused
  const handleProgressClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/projects/${project.id}?tab=progress`);
  };
  
  // Handle contact button click to message project organizer
  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { returnTo: `/projects/${project.id}` } });
      return;
    }
    
    // Navigate to messages with the organizer info
    navigate("/messages", { 
      state: { 
        participantId: project.organizerId,
        participantName: project.organizerName
      } 
    });
  };

  // Open application dialog instead of direct apply
  const openApplicationDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { returnTo: `/projects/${project.id}` } });
      return;
    }
    
    setApplicationOpen(true);
  };

  // Handle click on organizer name or organization
  const handleOrganizerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/users/${project.organizerId}`);
  };
  
  const handleOrganizationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (project.organizationId) {
      navigate(`/organizations/${project.organizationId}`);
    }
  };

  // Render apply button based on conditions
  const renderApplyButton = () => {
    if (isOwner) {
      return (
        <Button size="sm" variant="outline" onClick={handleProgressClick}>
          <BarChart2 className="h-4 w-4 mr-1" /> Progress
        </Button>
      );
    }
    
    if (isCompleted) {
      return (
        <Button size="sm" variant="outline" disabled className="bg-green-50 text-green-700">
          <Check className="h-4 w-4 mr-1" /> Completed
        </Button>
      );
    }
    
    if (isApplicationPaused && !applicationStatus) {
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled className="bg-yellow-50 text-yellow-700">
            <Pause className="h-4 w-4 mr-1" /> Applications Paused
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleContact}
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    if (applicationStatus === "pending") {
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled>
            <Check className="h-4 w-4 mr-1" /> Applied
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleContact}
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    if (applicationStatus === "approved") {
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800" disabled>
            <Check className="h-4 w-4 mr-1" /> Approved
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleContact}
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    if (applicationStatus === "rejected") {
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800" disabled>
            Application Rejected
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleContact}
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={openApplicationDialog} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
          Apply
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleContact}
        >
          <Mail className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Determine if the project has an organization associated with it
  const hasOrganization = !!project.organizationId && !!project.organizationName;

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
        <div className="aspect-video w-full bg-muted overflow-hidden">
          {project.image ? (
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/10">
              <span className="text-lg font-semibold text-primary/70">{project.title.substring(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg md:text-xl">
              <Link to={`/projects/${project.id}`} className="hover:text-primary transition-colors">
                {project.title}
              </Link>
            </CardTitle>
            <Badge variant={project.status === 'published' ? "default" : "outline"} className="whitespace-nowrap">
              {project.status === 'published' ? 'Active' : 'Completed'}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-2 mb-4 overflow-hidden">
            {project.partnershipTypes && project.partnershipTypes.map((type: string) => (
              <Badge 
                key={type} 
                variant="outline" 
                className={
                  type in partnershipTypeColors
                    ? partnershipTypeColors[type as keyof typeof partnershipTypeColors]
                    : "bg-muted text-muted-foreground"
                }
              >
                {type in partnershipTypeLabels
                  ? partnershipTypeLabels[type as keyof typeof partnershipTypeLabels]
                  : type}
              </Badge>
            ))}
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {project.timeline && project.timeline.start ? new Date(project.timeline.start).toLocaleDateString() : "No start date"} - 
                {project.timeline && project.timeline.end ? new Date(project.timeline.end).toLocaleDateString() : "No end date"}
              </span>
            </div>
            {project.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{project.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>{partnerCount} partner{partnerCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-7 w-7 flex-shrink-0">
              {hasOrganization ? (
                <>
                  <AvatarImage src={project.image} alt={project.organizationName} />
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                    {project.organizationName?.substring(0, 2).toUpperCase() || "OR"}
                  </AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage src={project.image} alt={project.organizerName} />
                  <AvatarFallback className="text-xs bg-muted">
                    {project.organizerName ? project.organizerName.substring(0, 2).toUpperCase() : "??"}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm truncate">
                {hasOrganization ? (
                  <button 
                    onClick={handleOrganizationClick}
                    className="flex items-center hover:text-primary truncate"
                  >
                    <Building className="inline-block h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{project.organizationName}</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleOrganizerClick}
                    className="hover:text-primary truncate"
                  >
                    {project.organizerName || "Unknown"}
                  </button>
                )}
              </span>
              {hasOrganization && (
                <span className="text-xs text-muted-foreground truncate">
                  from <button 
                    onClick={handleOrganizerClick}
                    className="hover:text-primary"
                  >
                    {project.organizerName}
                  </button>
                </span>
              )}
            </div>
          </div>
          <div className="ml-2 flex-shrink-0">
            {renderApplyButton()}
          </div>
        </CardFooter>
      </Card>

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
                      {type in partnershipTypeLabels 
                        ? partnershipTypeLabels[type as keyof typeof partnershipTypeLabels]
                        : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
              onClick={handleApply} 
              disabled={isLoading || !partnershipType}
            >
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
