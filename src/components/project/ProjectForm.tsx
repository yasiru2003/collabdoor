
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid';
import { Editor } from "@tinymce/tinymce-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Project, PartnershipType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile-query";
import { useOrganization } from "@/hooks/use-organization-query";
import { useLocations } from "@/hooks/use-locations-query";
import { usePartnershipTypes } from "@/hooks/use-partnership-types-query";
import { useAuth } from "@/hooks/use-auth";
import { ImageIcon, Upload, Plus, CheckCircle } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { useSystemSettings } from "@/hooks/use-system-settings";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  category: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  organization_id: z.string().optional(),
  partnership_types: z.array(z.string()).optional(),
  content: z.string().optional(),
});

interface ProjectFormProps {
  project?: Project | null;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { organization } = useOrganization();
  const { locations } = useLocations();
  const { partnershipTypes } = usePartnershipTypes();
  const [imageUrl, setImageUrl] = useState<string | null>(project?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { autoApproveProjects } = useSystemSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: project?.title || "",
      category: project?.category || "",
      location: project?.location || "",
      description: project?.description || "",
      image: project?.image || "",
      content: project?.content || "",
      organization_id: project?.organization_id || organization?.id || "",
      partnership_types: project?.partnership_types || [],
    },
  });

  const { control, handleSubmit, setValue, getValues } = form;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size should be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Error uploading image: ", error);
        setUploadError(error.message);
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      } else {
        // Get the public URL - we need to use the publicUrl method instead of storageUrl directly
        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(data.path);
          
        setImageUrl(publicUrl);
        setValue('image', publicUrl);
        toast({
          title: "Upload successful",
          description: "Image uploaded successfully.",
        });
      }
    } catch (error: any) {
      console.error("Unexpected error during upload: ", error);
      setUploadError(error.message);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [setValue, toast]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.svg']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = () => {
    setImageUrl(null);
    setValue('image', "");
  };

  const upsertProject = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!user || !profile) {
        throw new Error("User not authenticated.");
      }

      const isUpdate = !!project?.id;
      const projectId = project?.id || uuidv4();
      const now = new Date().toISOString();
      const newStatus = autoApproveProjects ? 'published' : 'pending_publish';

      // Make sure partnership_types has valid values
      const validPartnershipTypes = (values.partnership_types || []).filter(
        (type): type is PartnershipType => 
          type === 'monetary' || 
          type === 'knowledge' || 
          type === 'skilled' || 
          type === 'volunteering'
      );

      const projectData = {
        id: projectId,
        title: values.title,
        category: values.category,
        location: values.location,
        description: values.description,
        image: values.image,
        content: values.content,
        organization_id: values.organization_id,
        organizer_id: profile.id,
        updated_at: now,
        partnership_types: validPartnershipTypes,
        status: newStatus as any,
      };

      if (isUpdate) {
        const { data, error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", projectId)
          .select()
          .single();

        if (error) {
          console.error("Error updating project:", error);
          throw error;
        }
        return data;
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert({
            ...projectData,
            created_at: now,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating project:", error);
          throw error;
        }
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
      toast({
        title: autoApproveProjects ? "Project Published" : "Project Submitted for Review",
        description: autoApproveProjects 
          ? "Your project has been published successfully."
          : "Your project has been submitted and is awaiting admin approval.",
      });
      navigate("/projects");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(values => upsertProject.mutate(values))} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{project ? "Edit Project" : "Create Project"}</CardTitle>
            <CardDescription>
              {project
                ? "Make changes to your project here. Click save when you're done."
                : "Create a new project to share with the community."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Project title" {...field} />
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
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Technology, Education" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations?.map((location) => (
                            <SelectItem key={location.id} value={location.name}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organization_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="Organization ID" {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      This project will be associated with your organization.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

						<FormField
							control={form.control}
							name="partnership_types"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Partnership Types</FormLabel>
									<FormControl>
										<MultiSelect
											options={partnershipTypes?.map((type) => ({
												label: type.name,
												value: type.id,
											})) || []}
											value={field.value}
											onChange={field.onChange}
											placeholder="Select partnership types"
										/>
									</FormControl>
									<FormDescription>
										Select the types of partnerships you are looking for.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

            <div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Project description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your project in detail.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Image Upload</FormLabel>
              <FormDescription>Upload a project image.</FormDescription>
              <div
                {...getRootProps()}
                className="border-dashed border-2 rounded-md p-4 relative cursor-pointer hover:bg-accent"
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 animate-spin text-primary" />
                    Uploading...
                  </div>
                ) : imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      className="max-h-40 rounded-md object-contain"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2"
                      type="button"
                      onClick={removeImage}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm mt-2 text-muted-foreground">
                      Click or drag and drop to upload an image
                    </p>
                  </div>
                )}
              </div>
              {uploadError && (
                <p className="text-sm text-red-500 mt-1">{uploadError}</p>
              )}
            </div>

            <div>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Editor
                        apiKey="YOUR_TINY_MCE_API_KEY"
                        value={field.value || ""}
                        onEditorChange={field.onChange}
                        init={{
                          height: 300,
                          menubar: true,
                          plugins: [
                            'advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table paste code help wordcount'
                          ],
                          toolbar:
                            'undo redo | formatselect | ' +
                            'bold italic backcolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help'
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Write the content for your project.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => navigate("/projects")}>
              Cancel
            </Button>
            <Button type="submit" disabled={upsertProject.isPending}>
              {upsertProject.isPending ? "Loading..." : "Submit"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
