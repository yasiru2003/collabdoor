
import { format } from "date-fns";
import { CalendarIcon, Building2Icon, TagIcon, Users2Icon, StickyNoteIcon, BriefcaseIcon } from "lucide-react";
import { Project, PartnershipType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

interface ProjectOverviewProps {
  project: Project;
  isOwner: boolean;
  navigateToOrganization: () => void;
  handleCompleteProject: () => void;
}

export function ProjectOverview({ project, isOwner, navigateToOrganization, handleCompleteProject }: ProjectOverviewProps) {
  // Check if project has organization
  const hasOrganization = !!project.organizationId && !!project.organizationName;

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

  return (
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
        
        {/* Add Complete Project button right after the card for owner's view */}
        {isOwner && project.status !== "completed" && (
          <Button 
            onClick={handleCompleteProject}
            size="lg"
            className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Trophy className="h-6 w-6 mr-2" /> Complete Project
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {hasOrganization ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {/* Organization avatar */}
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {project.organizationName?.substring(0, 2).toUpperCase() || "OR"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        <Button 
                          variant="link" 
                          onClick={navigateToOrganization} 
                          className="h-auto p-0 text-foreground hover:text-primary"
                        >
                          {project.organizationName}
                        </Button>
                      </h3>
                      <p className="text-sm text-muted-foreground">Organization</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-2">
                    <Avatar className="h-8 w-8">
                      {/* Organizer avatar */}
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {project.organizerName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-medium">{project.organizerName}</h3>
                      <p className="text-xs text-muted-foreground">Project Creator</p>
                    </div>
                  </div>
                </>
              ) : (
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
              )}
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
  );
}
