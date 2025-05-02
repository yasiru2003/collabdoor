import { useState } from "react";
import { Link } from "react-router-dom";
import { Project, Organization, PartnershipType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ExternalLink, AlertCircle, Edit } from "lucide-react";

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
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`saved_${project.id}`, (!saved).toString());
      setSaved(!saved);
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="mb-6">
      <div className="relative">
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          className="w-full rounded-md aspect-video object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {isOwner && (
            <Button size="icon" variant="secondary" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="secondary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center gap-2 mb-4">
        <Badge 
          className={`px-2 py-1 ${
            project.status === "published" 
              ? "bg-green-500" 
              : project.status === "in-progress" 
                ? "bg-blue-500" 
                : project.status === "completed" 
                  ? "bg-purple-500" 
                  : project.status === "pending_publish"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
          }`}
        >
          {project.status === "pending_publish" 
            ? "Pending Approval" 
            : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </Badge>
        {project.category && (
          <Badge variant="secondary">{project.category}</Badge>
        )}
        {project.location && (
          <Badge variant="secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-2 h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.294.294 0 00.075-.068l2-2.419a.75.75 0 01.691-.583h1.202a.75.75 0 01.69.583l2 2.419a.3.3 0 00.074.068l.029-.016.069-.041a2 2 0 00.26-.217l3-3a.75.75 0 011.06 1.06l-3 3a3.5 3.5 0 01-.455.385A2.25 2.25 0 0119.771 21h-.041c-1.087.017-2.17.107-3.235.266-.133.018-.266.037-.398.058l-.031.009a.115.115 0 01-.015-.002H12a.115.115 0 01-.015.002l-.031-.009a2.242 2.242 0 01-.398-.058c-1.065-.159-2.148-.249-3.235-.266h-.041a2.25 2.25 0 01-1.944-2.819 3.5 3.5 0 01-.455-.385l-3-3a.75.75 0 011.06-1.06l3 3a2 2 0 00.259.217zM6.53 10.947a.75.75 0 00-1.06 1.06l4.72 4.72a.75.75 0 001.06-1.06l-4.72-4.72zm11.94 0a.75.75 0 00-1.06 1.06l4.72 4.72a.75.75 0 101.06-1.06l-4.72-4.72z"
                clipRule="evenodd"
              />
            </svg>
            {project.location}
          </Badge>
        )}
        {project.timeline?.start && project.timeline?.end && (
          <Badge variant="secondary">
            {new Date(project.timeline.start).toLocaleDateString()} - {new Date(project.timeline.end).toLocaleDateString()}
          </Badge>
        )}
      </div>
      
      {/* Show pending approval message for project owners */}
      {isOwner && project.status === "pending_publish" && (
        <div className="mb-6 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
          <h3 className="flex items-center text-yellow-800 dark:text-yellow-200 font-medium">
            <AlertCircle className="h-4 w-4 mr-2" />
            Awaiting Admin Approval
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            This project is pending approval from administrators before it becomes publicly visible.
          </p>
        </div>
      )}
      
      <h2 className="text-3xl font-bold">{project.title}</h2>
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          {applicationStatus === "pending" ? (
            <Button variant="secondary" disabled>
              Application Pending
            </Button>
          ) : applicationStatus === "approved" ? (
            <Button variant="secondary" disabled>
              Partnered
            </Button>
          ) : (
            <Button onClick={handleApply} disabled={applicationLoading}>
              Apply to Project
            </Button>
          )}
          <Button variant="outline" onClick={handleContact}>
            Contact
          </Button>
          {project.proposalFilePath && (
            <Button variant="link" asChild>
              <Link to={project.proposalFilePath} target="_blank">
                View Proposal
                <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {applicationOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="relative bg-white rounded-lg max-w-2xl mx-auto p-6">
              <h3 className="text-xl font-semibold mb-4">Apply to {project.title}</h3>

              {/* Partnership Type */}
              <div className="mb-4">
                <Label htmlFor="partnershipType" className="block text-sm font-medium text-gray-700">
                  Partnership Type
                </Label>
                <Select value={partnershipType} onValueChange={setPartnershipType}>
                  <SelectTrigger id="partnershipType" className="w-full">
                    <SelectValue placeholder="Select a partnership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monetary">Monetary</SelectItem>
                    <SelectItem value="knowledge">Knowledge</SelectItem>
                    <SelectItem value="skilled">Skilled</SelectItem>
                    <SelectItem value="volunteering">Volunteering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Organization Selection */}
              {userOrganizations && userOrganizations.length > 0 && (
                <div className="mb-4">
                  <Label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                    Apply as Organization (Optional)
                  </Label>
                  <Select value={selectedOrganizationId} onValueChange={setSelectedOrganizationId}>
                    <SelectTrigger id="organization" className="w-full">
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      {userOrganizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Message */}
              <div className="mb-4">
                <Label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </Label>
                <Textarea
                  id="message"
                  rows={4}
                  className="shadow-sm focus:ring-primary focus:border-primary mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="secondary" onClick={() => setApplicationOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={onApplySubmit} disabled={applicationLoading}>
                  Submit Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
