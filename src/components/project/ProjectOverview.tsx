
import { useState } from "react";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { getProjectProposalUrl } from "@/utils/upload-utils";
import { FileDown } from "lucide-react";

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
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleDownloadProposal = async () => {
    if (!project.proposalFilePath) return;
    
    const url = await getProjectProposalUrl(project.proposalFilePath);
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Organizer</h3>
          <p>
            Organized by{" "}
            <Button variant="link" onClick={navigateToOrganizerProfile}>
              {project.organizerName}
            </Button>
          </p>
        </div>

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
      </div>

      <div>
        <h3 className="text-lg font-semibold">Project Timeline</h3>
        <p>
          {new Date(project.timeline.start).toLocaleDateString()} -{" "}
          {new Date(project.timeline.end).toLocaleDateString()}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Required Skills</h3>
        {project.requiredSkills && project.requiredSkills.length > 0 ? (
          <ul className="list-disc pl-5">
            {project.requiredSkills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        ) : (
          <p>No specific skills required.</p>
        )}
      </div>
      
      {project.proposalFilePath && (
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

      {isOwner && project.status !== "completed" && (
        <Button onClick={handleCompleteProject} variant="destructive">
          Mark as Completed
        </Button>
      )}
    </div>
  );
}
