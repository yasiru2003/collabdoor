
import { useState, useEffect } from "react";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { uploadImage, uploadProposal } from "@/utils/upload-utils";
import { useAuth } from "@/hooks/use-auth";

interface EnhancedEditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated: () => void;
}

export function EnhancedEditProjectDialog({ 
  project, 
  open, 
  onOpenChange, 
  onProjectUpdated 
}: EnhancedEditProjectDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(project.image || null);
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [proposalFileName, setProposalFileName] = useState<string | null>(
    project.proposalFilePath ? project.proposalFilePath.split('/').pop() : null
  );
  
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    category: project.category || "",
    location: project.location || "",
    partnershipTypes: project.partnershipTypes || [],
    requiredSkills: project.requiredSkills || [],
  });

  const categories = [
    "Environmental",
    "Healthcare",
    "Education",
    "Business",
    "Technology",
    "Arts",
    "Social",
    "Community",
  ];

  const partnershipTypeOptions = [
    "sponsor",
    "volunteer",
    "partner",
    "mentor",
    "advisor",
    "investor"
  ];

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle proposal file selection
  const handleProposalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProposalFile(file);
      setProposalFileName(file.name);
    }
  };

  // Handle partnership type selection
  const handlePartnershipTypeChange = (type: string) => {
    setFormData(prev => {
      const currentTypes = [...prev.partnershipTypes];
      
      if (currentTypes.includes(type)) {
        return {
          ...prev,
          partnershipTypes: currentTypes.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          partnershipTypes: [...currentTypes, type]
        };
      }
    });
  };

  // Handle required skills
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Split by commas and trim whitespace
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setFormData({
      ...formData,
      requiredSkills: skills
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update a project.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Upload image if a new one is selected
      let imageUrl = project.image;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'projects', user.id);
      }

      // Upload proposal file if a new one is selected
      let proposalUrl = project.proposalFilePath;
      if (proposalFile) {
        proposalUrl = await uploadProposal(proposalFile, user.id);
      }

      const { error } = await supabase
        .from("projects")
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          image: imageUrl,
          partnership_types: formData.partnershipTypes,
          required_skills: formData.requiredSkills,
          proposal_file_path: proposalUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);

      if (error) throw error;

      toast({
        title: "Project updated",
        description: "Your project has been successfully updated.",
      });
      
      onProjectUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast({
        title: "Error updating project",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear image preview
  const clearImagePreview = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  // Clear proposal file
  const clearProposalFile = () => {
    setProposalFile(null);
    setProposalFileName(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Make changes to your project details here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Project Image */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex items-center space-x-4">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Project cover" 
                      className="h-24 w-40 object-cover rounded-md" 
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-0 right-0 h-6 w-6 bg-black/60 rounded-full -mt-2 -mr-2"
                      onClick={clearImagePreview}
                    >
                      <X className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-24 w-40 border-2 border-dashed rounded-md flex items-center justify-center bg-muted">
                    <p className="text-xs text-muted-foreground">No image</p>
                  </div>
                )}
                <div>
                  <Input
                    id="project-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Label
                    htmlFor="project-image"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer text-sm font-medium"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 1200x630px
                  </p>
                </div>
              </div>
            </div>

            {/* Project Proposal File */}
            <div className="space-y-2">
              <Label>Project Proposal Document</Label>
              <div className="flex items-center space-x-4">
                {proposalFileName ? (
                  <div className="flex items-center p-2 border rounded-md bg-muted">
                    <File className="h-4 w-4 mr-2" />
                    <span className="text-sm truncate max-w-[150px]">{proposalFileName}</span>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 ml-2"
                      onClick={clearProposalFile}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No proposal file attached</div>
                )}
                <div>
                  <Input
                    id="project-proposal"
                    type="file"
                    accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleProposalChange}
                  />
                  <Label
                    htmlFor="project-proposal"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer text-sm font-medium"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {proposalFileName ? "Change File" : "Upload Proposal"}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Project location (optional)"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Required Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="e.g., Graphic Design, Marketing, Finance"
                value={formData.requiredSkills?.join(', ') || ""}
                onChange={handleSkillsChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Partnership Types</Label>
              <div className="flex flex-wrap gap-2">
                {partnershipTypeOptions.map((type) => (
                  <Badge 
                    key={type}
                    variant={formData.partnershipTypes?.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handlePartnershipTypeChange(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click to select/deselect partnership types
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
