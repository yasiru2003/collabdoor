
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { useSystemSetting } from "@/hooks/use-system-settings";
import { PartnershipType } from "@/types";
import { ProjectImagesUpload } from "@/components/project/ProjectImagesUpload";
import { uploadProjectProposal } from "@/utils/upload-utils";

export function ProjectForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [partnershipTypes, setPartnershipTypes] = useState<string[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [previousProjects, setPreviousProjects] = useState("");
  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if projects require admin approval
  const { data: projectApprovalSetting } = useSystemSetting("require_project_approval");
  const requiresAdminApproval = projectApprovalSetting?.value || false;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProposalFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a project",
        variant: "destructive",
      });
      return;
    }
    
    if (!title || !description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Determine initial status based on admin approval setting
      const initialStatus = requiresAdminApproval ? "pending_publish" : "draft";
      
      // Type-safe partnership_types using valid PartnershipType values
      const validPartnershipTypes = partnershipTypes
        .filter((type): type is PartnershipType => 
          ["monetary", "knowledge", "skilled", "volunteering"].includes(type)
        );

      // Upload proposal file if selected
      let proposalFilePath = null;
      if (proposalFile && user.id) {
        proposalFilePath = await uploadProjectProposal(proposalFile, user.id);
      }
      
      // Create contact information and previous projects objects
      const contactInfo = {
        email: contactEmail,
        phone: contactPhone
      };

      const previousProjectsInfo = previousProjects ? 
        { description: previousProjects } : null;
      
      const { data, error } = await supabase
        .from("projects")
        .insert({
          title,
          description,
          category: category || null,
          location: location || null,
          partnership_types: validPartnershipTypes.length > 0 ? validPartnershipTypes : ["knowledge"],
          organizer_id: user.id,
          status: initialStatus,
          partnership_details: contactInfo,
          previous_projects: previousProjectsInfo,
          proposal_file_path: proposalFilePath
        })
        .select()
        .single();
        
      if (error) throw error;

      // If we have images, associate them with the project
      if (projectImages.length > 0 && data) {
        const projectImagesData = projectImages.map(image_url => ({
          project_id: data.id,
          image_url
        }));

        const { error: imagesError } = await supabase
          .from("project_images")
          .insert(projectImagesData);

        if (imagesError) {
          console.error("Error saving project images:", imagesError);
        }
      }
      
      toast({
        title: "Project created",
        description: requiresAdminApproval 
          ? "Your project has been submitted for approval" 
          : "Your project has been created successfully",
      });
      
      // Redirect to the project page
      navigate(`/projects/${data.id}`);
      
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnershipOptions = [
    { value: "monetary", label: "Monetary" },
    { value: "knowledge", label: "Knowledge" },
    { value: "skilled", label: "Skilled" },
    { value: "volunteering", label: "Volunteering" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Enter the details of your project to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Partnership Types</Label>
            <MultiSelect
              options={partnershipOptions}
              value={partnershipTypes}
              onChange={setPartnershipTypes}
              placeholder="Select partnership types"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Provide contact details for interested partners.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="contact@example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              placeholder="Phone Number"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Previous Projects</CardTitle>
          <CardDescription>
            Share information about any relevant past projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="previousProjects">Previous Projects</Label>
            <Textarea
              id="previousProjects"
              placeholder="Describe your previous projects and experiences"
              value={previousProjects}
              onChange={(e) => setPreviousProjects(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Proposal</CardTitle>
          <CardDescription>
            Upload a detailed proposal document if available.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="proposalFile">Proposal Document</Label>
            <Input
              id="proposalFile"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground">
              Accepted formats: PDF, DOC, DOCX
            </p>
          </div>
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Project Images</CardTitle>
            <CardDescription>
              Upload images related to your project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectImagesUpload 
              userId={user.id} 
              onImagesChange={setProjectImages}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : requiresAdminApproval ? "Submit for Approval" : "Create Project"}
          </Button>
        </CardFooter>
      </Card>
      {requiresAdminApproval && (
        <div className="text-sm text-muted-foreground">
          Note: Your project will need admin approval before it's published.
        </div>
      )}
    </form>
  );
}
