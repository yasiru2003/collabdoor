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

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<z.infer<typeof projectFormSchema>>({
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
      setValue('title', project.title || "");
      setValue('description', project.description || "");
      setValue('category', project.category || "");
      setValue('status', project.status || 'draft');
      setValue('timelineStart', project.timeline?.start || "");
      setValue('timelineEnd', project.timeline?.end || "");
      setValue('requiredSkills', project.requiredSkills || []);
      setValue('partnershipTypes', project.partnershipTypes || []);
      setValue('location', project.location || "");
      setValue('image', project.image || "");
      setValue('applicationsEnabled', project.applicationsEnabled !== undefined ? project.applicationsEnabled : true);
      setValue('proposalFilePath', project.proposalFilePath || "");
      setValue('partnership_details', project.partnership_details || {});
      setValue('previous_projects', project.previous_projects || {});
    }
  }, [project, setValue]);

  const handleProposalUpload = async (file: File) => {
    setUploading(true);
    try {
      const filePath = `proposals/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from('project-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Error uploading file: ", error);
        toast({
          title: "Upload failed",
          description: "Failed to upload the proposal. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      const publicURL = `${supabase.storageUrl}/object/public/project-files/${filePath}`;
      return publicURL;
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const formData = {
      title: (event.target as HTMLFormElement).title.value,
      description: (event.target as HTMLFormElement).description.value,
      category: (event.target as HTMLFormElement).category.value,
      status: (event.target as HTMLFormElement).status.value,
      timelineStart: (event.target as HTMLFormElement).timelineStart.value,
      timelineEnd: (event.target as HTMLFormElement).timelineEnd.value,
      requiredSkills: (event.target as HTMLFormElement).requiredSkills.value ? ((event.target as HTMLFormElement).requiredSkills.value as string).split(',') : [],
      partnershipTypes: (event.target as HTMLFormElement).partnershipTypes.value ? ((event.target as HTMLFormElement).partnershipTypes.value as string).split(',') : [],
      location: (event.target as HTMLFormElement).location.value,
      image: (event.target as HTMLFormElement).image.value,
      applicationsEnabled: (event.target as HTMLFormElement).applicationsEnabled.checked,
      proposalFilePath: (event.target as HTMLFormElement).proposalFilePath.value,
      partnership_details: {},
      previous_projects: {},
    };

    try {
      let proposalURL = formData.proposalFilePath;

      if (proposalFile) {
        proposalURL = await handleProposalUpload(proposalFile);
        if (!proposalURL) {
          setIsSaving(false);
          return;
        }
      }

      // Check if admin approval is required for publishing projects
      if (formData.status === 'published' && requireProjectApproval?.value === true) {
        // Change status to pending_publish if admin approval required
        formData.status = 'pending_publish';
      }

      const updates = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        start_date: formData.timelineStart,
        end_date: formData.timelineEnd,
        required_skills: formData.requiredSkills,
        partnership_types: formData.partnershipTypes,
        location: formData.location,
        image: formData.image,
        applications_enabled: formData.applicationsEnabled,
        proposal_file_path: proposalURL,
        partnership_details: {},
        previous_projects: {},
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
        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...updates,
            organizer_id: supabase.auth.getUser().then((response) => response.data?.user?.id),
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

      if (formData.status === 'pending_publish') {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" type="text" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" type="text" {...register("category")} />
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select {...register("status")} defaultValue={project?.status || 'draft'}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_publish">Pending Publish</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timelineStart">Timeline Start</Label>
          <Input id="timelineStart" type="date" {...register("timelineStart")} />
          {errors.timelineStart && (
            <p className="text-sm text-red-500">{errors.timelineStart.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="timelineEnd">Timeline End</Label>
          <Input id="timelineEnd" type="date" {...register("timelineEnd")} />
          {errors.timelineEnd && (
            <p className="text-sm text-red-500">{errors.timelineEnd.message}</p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="requiredSkills">Required Skills</Label>
        <MultiSelect id="requiredSkills" {...register("requiredSkills")} />
        {errors.requiredSkills && (
          <p className="text-sm text-red-500">{errors.requiredSkills.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="partnershipTypes">Partnership Types</Label>
        <MultiSelect
          id="partnershipTypes"
          options={[
            { label: "Monetary", value: "monetary" },
            { label: "Knowledge", value: "knowledge" },
            { label: "Skilled", value: "skilled" },
            { label: "Volunteering", value: "volunteering" },
          ]}
          {...register("partnershipTypes")}
        />
        {errors.partnershipTypes && (
          <p className="text-sm text-red-500">{errors.partnershipTypes.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" type="text" {...register("location")} />
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input id="image" type="text" {...register("image")} />
        {errors.image && (
          <p className="text-sm text-red-500">{errors.image.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="applicationsEnabled">Applications Enabled</Label>
        <Input id="applicationsEnabled" type="checkbox" {...register("applicationsEnabled")} />
        {errors.applicationsEnabled && (
          <p className="text-sm text-red-500">{errors.applicationsEnabled.message}</p>
        )}
      </div>
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
        {errors.proposalFilePath && (
          <p className="text-sm text-red-500">{errors.proposalFilePath.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Submit"}
      </Button>
    </form>
  );
};

export default ProjectForm;
