
import { useState } from "react";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { getProjectProposalUrl } from "@/utils/upload-utils";
import { FileDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ProjectOverviewProps {
  project: Project;
  isOwner: boolean;
  navigateToOrganization: () => void;
  navigateToOrganizerProfile: () => void;
  handleCompleteProject: () => void;
}

export function ProjectOverview({
  project,
  isOwner,
  navigateToOrganization,
  navigateToOrganizerProfile,
  handleCompleteProject
}: ProjectOverviewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleDownloadProposal = async () => {
    if (!project.proposal_file_path && !project.proposalFilePath) return;
    
    const filePath = project.proposal_file_path || project.proposalFilePath;
    const url = await getProjectProposalUrl(filePath!);
    if (url) {
      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title}-proposal`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-8">
      {/* Project Images */}
      {project.image && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Project Gallery</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:opacity-90 transition-opacity">
                  <CardContent className="p-0">
                    <AspectRatio ratio={16 / 9}>
                      <img 
                        src={project.image} 
                        alt="Project cover" 
                        className="object-cover w-full h-full rounded-t-lg"
                      />
                    </AspectRatio>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <img 
                  src={project.image} 
                  alt="Project cover" 
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organizer Info */}
        <div>
          <h3 className="text-lg font-semibold">Organizer</h3>
          <p>
            Organized by{" "}
            <Button variant="link" onClick={navigateToOrganizerProfile}>
              {project.organizerName}
            </Button>
          </p>
        </div>

        {/* Organization Info */}
        {project.organizationId && project.organizationName && (
          <div>
            <h3 className="text-lg font-semibold">Organization</h3>
            <p>
              Part of{" "}
              <Button variant="link" onClick={navigateToOrganization}>
                {project.organizationName}
              </Button>
            </p>
          </div>
        )}

        {/* Location */}
        {project.location && (
          <div>
            <h3 className="text-lg font-semibold">Location</h3>
            <p>{project.location}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold">Project Timeline</h3>
        <p>
          {new Date(project.timeline?.start || project.start_date || '').toLocaleDateString()} -{" "}
          {new Date(project.timeline?.end || project.end_date || '').toLocaleDateString()}
        </p>
      </div>

      {/* Required Skills */}
      <div>
        <h3 className="text-lg font-semibold">Required Skills</h3>
        {(project.requiredSkills || project.required_skills) && 
         (project.requiredSkills?.length > 0 || project.required_skills?.length > 0) ? (
          <ul className="list-disc pl-5">
            {(project.requiredSkills || project.required_skills || []).map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        ) : (
          <p>No specific skills required.</p>
        )}
      </div>

      {/* Partnership Types and Details */}
      <div>
        <h3 className="text-lg font-semibold">Partnership Types</h3>
        {(project.partnershipTypes || project.partnership_types) && 
         (project.partnershipTypes?.length || project.partnership_types?.length) > 0 && (
          <div className="space-y-4">
            {(project.partnershipTypes || project.partnership_types)?.map((type, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h4 className="font-semibold capitalize mb-2">{type}</h4>
                  {project.partnership_details && project.partnership_details[type] && (
                    <p className="text-muted-foreground">
                      {project.partnership_details[type]}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Previous Projects */}
      {project.previous_projects && (
        <div>
          <h3 className="text-lg font-semibold">Previous Projects</h3>
          <div className="space-y-4">
            {Object.entries(project.previous_projects).map(([name, details], index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h4 className="font-semibold">{name}</h4>
                  <p className="text-muted-foreground">{details as string}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Project Proposal Download */}
      {(project.proposal_file_path || project.proposalFilePath) && (
        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={handleDownloadProposal}
            className="flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Download Project Proposal
          </Button>
        </div>
      )}

      {/* Complete Project Button */}
      {isOwner && project.status !== "completed" && (
        <Button onClick={handleCompleteProject} variant="destructive">
          Mark as Completed
        </Button>
      )}
    </div>
  );
}
