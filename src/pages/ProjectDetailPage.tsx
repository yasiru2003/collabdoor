import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Project, PartnershipType } from "@/types";
import { useProject, useProjectApplications } from "@/hooks/use-supabase-query";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  GlobeIcon,
  ListChecksIcon,
  MapPinIcon,
  Star,
  StarOff,
  UserIcon,
  Users2Icon,
  TagIcon,
  BriefcaseIcon,
  Building2Icon,
  InfoIcon,
  StickyNoteIcon,
  Mail,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProjectApplications as useProjectApps } from "@/hooks/use-project-applications";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: project, isLoading, error } = useProject(id);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const { 
    checkApplicationStatus, 
    applyToProject, 
    isLoading: applicationLoading,
    updateApplicationStatus,
  } = useProjectApps();
  const { data: projectApplications, isLoading: loadingApplications } = useProjectApplications(id);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [partnershipType, setPartnershipType] = useState<PartnershipType>("skilled");
  const [message, setMessage] = useState("");

  // Check if current user is the project owner
  const isOwner = user && project && user.id === project.organizerId;

  useEffect(() => {
    // Simulate checking if project is saved
    setTimeout(() => {
      setSaved(localStorage.getItem(`saved_${id}`) === "true");
    }, 500);

    // Check if the user has already applied
    const checkApplication = async () => {
      if (user && id) {
        const application = await checkApplicationStatus(id, user.id);
        if (application) {
          setApplicationStatus(application.status);
        }
      }
    };
    
    if (user) {
      checkApplication();
    }
  }, [id, user, checkApplicationStatus]);

  const handleSaveProject = () => {
    const newSaved = !saved;
    setSaved(newSaved);
    localStorage.setItem(`saved_${id}`, newSaved.toString());

    toast({
      title: newSaved ? "Project saved" : "Project removed from saved",
      description: newSaved
        ? "This project has been added to your saved list."
        : "This project has been removed from your saved list.",
    });
  };

  const handleApply = async () => {
    if (!user || !id) return;
    
    const result = await applyToProject(id, user.id, partnershipType, message);
    if (result) {
      setApplicationStatus("pending");
      setApplicationOpen(false);
      setMessage("");
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: "approved" | "rejected") => {
    await updateApplicationStatus(applicationId, status);
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
          disabled 
          className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 flex items-center gap-1"
        >
          <Check className="h-4 w-4" /> Approved
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

  const renderPartnershipTypes = () => {
    const partnershipLabels: Record<PartnershipType, string> = {
      monetary: "Financial Support",
      knowledge: "Knowledge Sharing",
      skilled: "Skilled Professionals",
      volunteering: "Volunteer Support",
    };

    return (
      <div className="space-y-1 mt-3">
        <h3 className="text-sm font-medium text-foreground">
          Looking for partnership in:
        </h3>
        <div className="flex flex-wrap gap-2">
          {project && project.partnershipTypes && project.partnershipTypes.length > 0 ? (
            project.partnershipTypes.map((type) => (
              <Badge key={type} variant="outline" className="flex items-center gap-1">
                {type === "monetary" && <TagIcon className="h-3 w-3" />}
                {type === "knowledge" && <StickyNoteIcon className="h-3 w-3" />}
                {type === "skilled" && <BriefcaseIcon className="h-3 w-3" />}
                {type === "volunteering" && <Users2Icon className="h-3 w-3" />}
                {partnershipLabels[type]}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              No partnership types specified
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderPartnershipCards = () => {
    const partnershipInfo: Record<
      PartnershipType,
      { title: string; description: string; icon: React.ReactNode }
    > = {
      monetary: {
        title: "Financial Support",
        description:
          "Contribute financially to help fund this project's activities and resources.",
        icon: <TagIcon className="h-5 w-5" />,
      },
      knowledge: {
        title: "Knowledge Sharing",
        description:
          "Share expertise, guidance, and insights to help this project succeed.",
        icon: <StickyNoteIcon className="h-5 w-5" />,
      },
      skilled: {
        title: "Skilled Professionals",
        description:
          "Provide professional services or skilled team members to support specific needs.",
        icon: <BriefcaseIcon className="h-5 w-5" />,
      },
      volunteering: {
        title: "Volunteer Support",
        description:
          "Offer volunteer time and general assistance to help with project activities.",
        icon: <Users2Icon className="h-5 w-5" />,
      },
    };

    return (
      <div className="grid gap-4 mt-6 sm:grid-cols-2">
        {project && project.partnershipTypes && project.partnershipTypes.map((type) => (
          <Card key={type}>
            <CardHeader className="p-4">
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {partnershipInfo[type].icon}
                </div>
                <div>
                  <CardTitle className="text-base">
                    {partnershipInfo[type].title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {partnershipInfo[type].description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  };

  const renderRequiredSkills = () => {
    return (
      <div className="space-y-1 mt-6">
        <h3 className="text-sm font-medium text-foreground">Required skills:</h3>
        <div className="flex flex-wrap gap-2">
          {project && project.requiredSkills && project.requiredSkills.length > 0 ? (
            project.requiredSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              No specific skills required
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    let timelineText = "Timeline not specified";
    
    if (project) {
      const startDate = project.timeline.start;
      const endDate = project.timeline.end;
      
      if (startDate && endDate) {
        timelineText = `${format(new Date(startDate), "MMM d, yyyy")} to ${format(
          new Date(endDate),
          "MMM d, yyyy"
        )}`;
      } else if (startDate) {
        timelineText = `Starts on ${format(new Date(startDate), "MMM d, yyyy")}`;
      } else if (endDate) {
        timelineText = `Ends on ${format(new Date(endDate), "MMM d, yyyy")}`;
      }
    }
    
    return (
      <div className="flex gap-1 items-center mt-2">
        <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm">{timelineText}</span>
      </div>
    );
  };

// Let's focus on fixing the applications table section with proper null checks
const renderApplicationsTable = () => {
  if (!isOwner || !projectApplications || projectApplications.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Partnership Applications</CardTitle>
        <CardDescription>Review and manage applications to partner on this project</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Partnership Type</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectApplications.map((application) => {
              console.log("Rendering application:", application);
              
              // Type assertion for profiles data
              const profiles = application.profiles || {};
              
              // Extract profile data with safe fallbacks
              const profileImage = typeof profiles === 'object' && profiles.profile_image ? profiles.profile_image : "";
              const profileName = typeof profiles === 'object' && profiles.name ? profiles.name : "Unknown";
              const profileEmail = typeof profiles === 'object' && profiles.email ? profiles.email : "";
              
              // Only calculate initials if we have a valid name
              const initials = profileName !== "Unknown" 
                ? profileName.substring(0, 2).toUpperCase() 
                : "??";

              return (
                <TableRow key={application.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profileImage} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{profileName}</div>
                      <div className="text-xs text-muted-foreground">{profileEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {application.partnership_type.charAt(0).toUpperCase() + application.partnership_type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(application.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        application.status === "approved" ? "success" : 
                        application.status === "rejected" ? "destructive" : 
                        "secondary"
                      }
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {application.status === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 text-green-700 hover:bg-green-100"
                          onClick={() => handleUpdateApplicationStatus(application.id, "approved")}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 text-red-700 hover:bg-red-100"
                          onClick={() => handleUpdateApplicationStatus(application.id, "rejected")}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                    {application.status !== "pending" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                      >
                        <Mail className="h-4 w-4 mr-1" /> Contact
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded mb-4"></div>
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-6"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/projects">Browse Projects</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/projects">Browse Projects</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-muted-foreground">
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                <span className="text-sm">{project.organizerName}</span>
              </div>
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
            {renderApplyButton()}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="p-0">
                {project.image ? (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
                    <Building2Icon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Published {format(new Date(project.createdAt), "MMM d, yyyy")}
                    </p>
                    {renderTimeline()}
                  </div>
                  <Separator />
                  <div>
                    <h2 className="text-xl font-semibold mb-2">About the Project</h2>
                    <p className="whitespace-pre-line">{project.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {renderApplicationsTable()}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={project.organizerName} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {project.organizerName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{project.organizerName}</h3>
                      <p className="text-sm text-muted-foreground">Project Organizer</p>
                    </div>
                  </div>
                  <Separator />
                  {renderPartnershipTypes()}
                  {renderRequiredSkills()}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">How You Can Partner</h2>
              {renderPartnershipCards()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
