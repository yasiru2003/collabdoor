
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Project, PartnershipType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { MultiSelect } from "@/components/ui/multi-select";
import { useSystemSetting } from "@/hooks/use-system-settings";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { uploadProjectProposal } from "@/utils/upload-utils";

const projectFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string().optional(),
  status: z.enum(['draft', 'published', 'in-progress', 'completed', 'pending_publish']).default('draft'),
  timelineStart: z.string().optional(),
  timelineEnd: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  partnershipTypes: z.array(z.enum(["monetary", "knowledge", "skilled", "volunteering"])).optional(),
  location: z.string().optional(),
  image: z.string().optional(),
  applicationsEnabled: z.boolean().default(true).optional(),
  proposalFilePath: z.string().optional(),
  partnership_details: z.record(z.string(), z.string()).optional(),
  previous_projects: z.record(z.string(), z.string()).optional(),
});

interface ProjectFormProps {
  project?: Partial<Project>;
  onSubmit?: (data: z.infer<typeof projectFormSchema>) => void;
}

const ProjectForm = ({ project, onSubmit }: ProjectFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const { data: requireProjectApproval } = useSystemSetting("require_project_approval");

  // Define skill options for MultiSelect - moved outside form to avoid recreating on each render
  const skillOptions = React.useMemo(() => [
    { label: "Programming", value: "programming" },
    { label: "Design", value: "design" },
    { label: "Marketing", value: "marketing" },
    { label: "Writing", value: "writing" },
    { label: "Project Management", value: "project_management" },
    { label: "Research", value: "research" },
  ], []);

  // Define partnership options for MultiSelect - moved outside form to avoid recreating on each render
  const partnershipTypeOptions = React.useMemo(() => [
    { label: "Monetary", value: "monetary" },
    { label: "Knowledge", value: "knowledge" },
    { label: "Skilled", value: "skilled" },
    { label: "Volunteering", value: "volunteering" },
  ], []);

  // Set default values for form with proper fallbacks for arrays and objects
  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      category: project?.category || "",
      status: project?.status || 'draft',
      timelineStart: project?.timeline?.start || "",
      timelineEnd: project?.timeline?.end || "",
      requiredSkills: project?.requiredSkills || [],
      partnershipTypes: project?.partnershipTypes || [],
      location: project?.location || "",
      image: project?.image || "",
      applicationsEnabled: project?.applicationsEnabled !== undefined ? project?.applicationsEnabled : true,
      proposalFilePath: project?.proposalFilePath || "",
      partnership_details: project?.partnership_details || {},
      previous_projects: project?.previous_projects || {},
    },
  });

  useEffect(() => {
    // Populate the form with project data when it's available
    if (project) {
      form.setValue('title', project.title || "");
      form.setValue('description', project.description || "");
      form.setValue('category', project.category || "");
      form.setValue('status', project.status || 'draft');
      form.setValue('timelineStart', project.timeline?.start || "");
      form.setValue('timelineEnd', project.timeline?.end || "");
      form.setValue('requiredSkills', project.requiredSkills || []);
      form.setValue('partnershipTypes', project.partnershipTypes || []);
      form.setValue('location', project.location || "");
      form.setValue('image', project.image || "");
      form.setValue('applicationsEnabled', project.applicationsEnabled !== undefined ? project.applicationsEnabled : true);
      form.setValue('proposalFilePath', project.proposalFilePath || "");
      form.setValue('partnership_details', project.partnership_details || {});
      form.setValue('previous_projects', project.previous_projects || {});
    }
  }, [project, form]);

  const handleProposalUpload = async (file: File) => {
    setUploading(true);
    try {
      if (!file) return null;
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to upload files.",
          variant: "destructive",
        });
        return null;
      }

      const publicUrl = await uploadProjectProposal(file, userData.user.id);
      return publicUrl;
    } catch (error) {
      console.error("Unexpected error during upload: ", error);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred during upload. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onFormSubmit = async (formData: z.infer<typeof projectFormSchema>) => {
    setIsSaving(true);

    try {
      let proposalURL = formData.proposalFilePath || "";

      if (proposalFile) {
        const uploadedUrl = await handleProposalUpload(proposalFile);
        if (uploadedUrl === null) {
          setIsSaving(false);
          return;
        }
        proposalURL = uploadedUrl;
      }

      // Check if admin approval is required for publishing projects
      let status = formData.status;
      if (status === 'published' && requireProjectApproval?.value === true) {
        // Change status to pending_publish if admin approval required
        status = 'pending_publish';
      }

      const updates = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: status as 'draft' | 'published' | 'in-progress' | 'completed' | 'pending_publish',
        start_date: formData.timelineStart,
        end_date: formData.timelineEnd,
        required_skills: formData.requiredSkills || [], // Ensure it's never undefined
        partnership_types: formData.partnershipTypes as PartnershipType[] || [], // Ensure it's never undefined
        location: formData.location,
        image: formData.image,
        applications_enabled: formData.applicationsEnabled,
        proposal_file_path: proposalURL,
        partnership_details: formData.partnership_details || {},
        previous_projects: formData.previous_projects || {},
      };

      if (project?.id) {
        const { error } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', project.id);

        if (error) throw error;

        toast({
          title: "Project updated",
          description: "Your project has been updated successfully.",
        });
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const organizerId = userData?.user?.id;
        
        if (!organizerId) {
          throw new Error("User not authenticated");
        }
        
        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...updates,
            organizer_id: organizerId,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Project created",
          description: "Your project has been created successfully.",
        });

        // Redirect to the newly created project
        navigate(`/projects/${data.id}`);
      }

      if (status === 'pending_publish') {
        toast({
          title: "Project submitted for review",
          description: "Your project has been submitted and is awaiting admin approval.",
        });
      } else {
        toast({
          title: "Project saved",
          description: "Your project has been saved successfully.",
        });
      }

      navigate('/projects');
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Error",
        description: "Failed to submit project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="title">Title</FormLabel>
              <FormControl>
                <Input id="title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="description">Description</FormLabel>
              <FormControl>
                <Textarea id="description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="category">Category</FormLabel>
              <FormControl>
                <Input id="category" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_publish">Pending Publish</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="timelineStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="timelineStart">Timeline Start</FormLabel>
                <FormControl>
                  <Input id="timelineStart" type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="timelineEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="timelineEnd">Timeline End</FormLabel>
                <FormControl>
                  <Input id="timelineEnd" type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="requiredSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Skills</FormLabel>
              <FormControl>
                <MultiSelect 
                  value={field.value || []} // Ensure it's never undefined
                  onChange={field.onChange}
                  options={skillOptions}
                  placeholder="Add required skills"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="partnershipTypes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partnership Types</FormLabel>
              <FormControl>
                <MultiSelect
                  value={field.value || []} // Ensure it's never undefined
                  onChange={field.onChange}
                  options={partnershipTypeOptions}
                  placeholder="Select partnership types"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="location">Location</FormLabel>
              <FormControl>
                <Input id="location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="image">Image URL</FormLabel>
              <FormControl>
                <Input id="image" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="applicationsEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Input 
                  id="applicationsEnabled" 
                  type="checkbox"
                  className="w-4 h-4"
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              </FormControl>
              <FormLabel htmlFor="applicationsEnabled">Enable Applications</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <Label htmlFor="proposalFile">Proposal File</Label>
          <Input
            id="proposalFile"
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setProposalFile(e.target.files[0]);
              } else {
                setProposalFile(null);
              }
            }}
          />
          {uploading && <p>Uploading...</p>}
        </div>
        
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export { ProjectForm };
