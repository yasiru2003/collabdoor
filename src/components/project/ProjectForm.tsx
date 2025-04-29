
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

export function ProjectForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [partnershipTypes, setPartnershipTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if projects require admin approval
  const { data: projectApprovalSetting } = useSystemSetting("require_project_approval");
  const requiresAdminApproval = projectApprovalSetting?.value || false;

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
      
      const { data, error } = await supabase
        .from("projects")
        .insert({
          title,
          description,
          category: category || null,
          location: location || null,
          partnership_types: validPartnershipTypes.length > 0 ? validPartnershipTypes : ["knowledge"],
          organizer_id: user.id,
          status: initialStatus
        })
        .select()
        .single();
        
      if (error) throw error;
      
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
              onChange={(values) => setPartnershipTypes(values)}
            />
          </div>
        </CardContent>
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
