
import { useState } from "react";
import { Link } from "react-router-dom";
import { Project, Organization, PartnershipType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Building, 
  MapPin, 
  Link as LinkIcon, 
  Contact2,
  Edit,
  Save,
  Share2,
  Heart,
  HeartOff
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const toggleSave = () => {
    const newSavedState = !saved;
    setSaved(newSavedState);
    localStorage.setItem(`saved_${project.id}`, newSavedState.toString());
  };
  
  // Make sure the status badge shows the pending_publish status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-green-600">Published</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-600">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-purple-600">Completed</Badge>;
      case 'pending_publish':
        return <Badge variant="default" className="bg-yellow-600">Pending Approval</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
          <div className="flex items-center space-x-2">
            {isOwner && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {!isOwner && (
              <Button variant="ghost" size="icon" onClick={toggleSave}>
                {saved ? <Heart className="h-5 w-5 text-red-500" /> : <HeartOff className="h-5 w-5" />}
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {project.organizationName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4" />
              {project.organizationName}
            </div>
          )}
          {project.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {project.location}
            </div>
          )}
        </CardDescription>
        {getStatusBadge(project.status)}
      </CardHeader>
      <CardContent>
        {project.image && (
          <img
            src={project.image}
            alt={project.title}
            className="rounded-md w-full aspect-video object-cover mb-4"
          />
        )}
        <p className="text-md text-muted-foreground">{project.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {!isOwner && applicationStatus === null && project.status !== 'completed' && (
            <Button onClick={handleApply} disabled={applicationLoading}>
              {applicationLoading ? "Applying..." : "Apply Now"}
            </Button>
          )}
          {!isOwner && applicationStatus === "pending" && (
            <Badge variant="secondary">Application Pending</Badge>
          )}
          {!isOwner && applicationStatus === "approved" && (
            <Badge variant="default" className="bg-green-600">Approved Partner</Badge>
          )}
          <Button variant="outline" onClick={handleContact}>
            <Contact2 className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>
      </CardFooter>

      {/* Application Dialog */}
      <Dialog open={applicationOpen} onOpenChange={setApplicationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Apply to {project.title}</DialogTitle>
            <DialogDescription>
              Submit your application to become a partner in this project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="partnershipType" className="text-right">
                Partnership Type
              </label>
              <Select onValueChange={setPartnershipType} defaultValue="skilled">
                <SelectTrigger className="col-span-3">
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
            
            {userOrganizations.length > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="organization" className="text-right">
                  Apply as
                </label>
                <Select value={selectedOrganizationId || "individual"} onValueChange={setSelectedOrganizationId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an organization or apply individually" />
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

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="message" className="text-right">
                Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Why do you want to join this project?"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={onApplySubmit}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
