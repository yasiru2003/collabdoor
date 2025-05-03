
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { useSystemSetting } from "@/hooks/use-system-settings";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { uploadImage, uploadProjectProposal } from "@/utils/upload-utils";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertCircle, HelpCircle, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Define the schema for the project form
const projectFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string().optional(),
  status: z.enum(['draft', 'published', 'in-progress', 'completed', 'pending_publish']).default('draft'),
  timelineStart: z.string().optional(),
  timelineEnd: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  partnershipTypes: z.array(z.enum(["monetary", "knowledge", "skilled", "volunteering", "resources", "network"])).optional(),
  location: z.string().optional(),
  image: z.string().optional(), // Changed from accepting File to just string
  contactEmail: z.string().email("Please enter a valid email address").optional(),
  contactPhone: z.string().optional(),
  organization_id: z.string().optional(),
  applicationsEnabled: z.boolean().default(true).optional(),
});

type FormValues = z.infer<typeof projectFormSchema>;

export function ProjectSubmissionForm({ project }: { project?: Project }) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<{ id: string, name: string }[]>([]);
  const { data: requireProjectApproval } = useSystemSetting("require_project_approval");
  const [uploading, setUploading] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
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
      contactEmail: "",
      contactPhone: "",
      organization_id: project?.organizationId || "",
      applicationsEnabled: project?.applicationsEnabled !== undefined ? project?.applicationsEnabled : true,
    },
  });

  // Enhanced skill options with detailed descriptions
  const skillOptions: Option[] = [
    { 
      label: "Programming", 
      value: "programming",
      description: "Software development, coding, and technical implementation skills"
    },
    { 
      label: "Design", 
      value: "design",
      description: "UI/UX, graphic design, and visual content creation"
    },
    { 
      label: "Marketing", 
      value: "marketing",
      description: "Digital marketing, social media, SEO, and content strategy"
    },
    { 
      label: "Writing", 
      value: "writing",
      description: "Content creation, copywriting, technical writing, and documentation"
    },
    { 
      label: "Project Management", 
      value: "project_management",
      description: "Coordination, timeline management, and stakeholder communication"
    },
    { 
      label: "Research", 
      value: "research",
      description: "Data analysis, market research, and academic investigation"
    },
    {
      label: "Community Building",
      value: "community_building",
      description: "Engagement, moderation, and growth of community initiatives"
    },
    {
      label: "Event Planning",
      value: "event_planning",
      description: "Organization, coordination, and execution of events"
    }
  ];

  // Enhanced partnership type options with detailed descriptions
  const partnershipTypeOptions: Option[] = [
    { 
      label: "Monetary", 
      value: "monetary",
      description: "Financial support through funding, grants, or investments"
    },
    { 
      label: "Knowledge", 
      value: "knowledge",
      description: "Expertise, mentorship, consultation, and advisory services"
    },
    { 
      label: "Skilled", 
      value: "skilled",
      description: "Professional services, technical expertise, and specialized work"
    },
    { 
      label: "Volunteering", 
      value: "volunteering",
      description: "Time contribution, community support, and hands-on assistance"
    },
    {
      label: "Resources",
      value: "resources",
      description: "Access to tools, equipment, facilities, or other physical resources"
    },
    {
      label: "Network",
      value: "network",
      description: "Connections, introductions, and community outreach opportunities"
    }
  ];

  // Category options
  const categoryOptions = [
    "Education", 
    "Environment", 
    "Healthcare", 
    "Technology", 
    "Arts", 
    "Social Services",
    "Community Development",
    "Research",
    "Humanitarian Aid",
    "Advocacy"
  ];

  // Fetch user's organizations
  useEffect(() => {
    const fetchUserOrganizations = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("organization_members")
          .select(`
            organization_id,
            organizations (id, name)
          `)
          .eq("user_id", user.id);
          
        if (error) throw error;
        
        const orgs = data.map(item => ({
          id: item.organizations.id,
          name: item.organizations.name
        }));
        
        setUserOrganizations(orgs);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };
    
    fetchUserOrganizations();
  }, [user?.id]);

  // Handle image upload preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle proposal file selection
  const handleProposalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProposalFile(e.target.files[0]);
    }
  };

  const uploadFiles = async () => {
    setUploading(true);
    try {
      let imageUrl = form.getValues("image") || "";
      let proposalPath = project?.proposalFilePath || "";
      
      // Upload project image if selected
      if (imageFile) {
        const uploadedImageUrl = await uploadImage(
          imageFile, 
          'projects', 
          user?.id as string
        );
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        }
      }
      
      // Upload proposal document if selected
      if (proposalFile) {
        const uploadedProposalPath = await uploadProjectProposal(
          proposalFile,
          user?.id as string
        );
        if (uploadedProposalPath) {
          proposalPath = uploadedProposalPath;
        }
      }
      
      return { imageUrl, proposalPath };
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading files. Please try again.",
        variant: "destructive"
      });
      return { imageUrl: "", proposalPath: "" };
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (formData: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a project",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Upload files first
      const { imageUrl, proposalPath } = await uploadFiles();
      
      // Determine status based on whether approval is required
      let submissionStatus = formData.status;
      if (submissionStatus === 'published' && requireProjectApproval?.value === true) {
        submissionStatus = 'pending_publish';
      }
      
      // Prepare project data - updated to match database schema
      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: submissionStatus,
        start_date: formData.timelineStart || null,
        end_date: formData.timelineEnd || null,
        required_skills: formData.requiredSkills || [],
        partnership_types: formData.partnershipTypes || [],
        location: formData.location,
        image: imageUrl || null, // Ensure only string type here
        applications_enabled: formData.applicationsEnabled,
        proposal_file_path: proposalPath || null,
        organization_id: formData.organization_id || null,
        // Add contact info to partnership_details
        partnership_details: {
          contactEmail: formData.contactEmail || "",
          contactPhone: formData.contactPhone || ""
        }
      };
      
      // Create or update the project
      if (project?.id) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', project.id);
        
        if (error) throw error;
        
        toast({
          title: "Project updated",
          description: submissionStatus === 'pending_publish' 
            ? "Your project has been submitted for approval." 
            : "Your project has been updated successfully."
        });
      } else {
        // Create new project - fixed type issues
        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...projectData,
            organizer_id: user.id
          })
          .select()
          .single();
        
        if (error) throw error;
        
        toast({
          title: "Project created",
          description: submissionStatus === 'pending_publish' 
            ? "Your project has been submitted for approval." 
            : "Your project has been created successfully."
        });
        
        // Navigate to the new project
        navigate(`/projects/${data.id}`);
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Error",
        description: "Failed to submit project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requireProjectApproval?.value && (
        <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Project Approval Required</AlertTitle>
          <AlertDescription>
            Projects submitted for publishing will require admin approval before they become visible to the public.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Title */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter a memorable title for your project" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Project Image */}
            <div className="md:col-span-2">
              <FormLabel htmlFor="image-upload">Project Image</FormLabel>
              <div className="mt-1 flex items-center gap-4">
                {(imagePreview || form.getValues("image")) && (
                  <div className="relative h-24 w-40 overflow-hidden rounded-md border">
                    <img 
                      src={imagePreview || String(form.getValues("image"))} 
                      alt="Project preview" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <label className="cursor-pointer">
                  <Button type="button" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload image
                  </Button>
                  <Input 
                    id="image-upload"
                    type="file" 
                    onChange={handleImageChange}
                    className="sr-only"
                    accept="image/*"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a high-quality image that represents your project (recommended size: 1200x630px)
              </p>
            </div>

            {/* Project Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="City, Country or 'Remote'" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Description */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe your project goals, impact, and how partners can contribute..." 
                        className="min-h-[150px]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Link to Organization */}
            {userOrganizations.length > 0 && (
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="organization_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Organization</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Personal Project</SelectItem>
                          {userOrganizations.map(org => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Connect this project to an organization you're a member of
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Timeline */}
            <FormField
              control={form.control}
              name="timelineStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Required Skills */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="requiredSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <FormDescription>
                      Select the skills needed for this project. Click on each option to see more details.
                    </FormDescription>
                    <FormControl>
                      <MultiSelect
                        options={skillOptions}
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Add required skills"
                        allowCustomEntry={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Partnership Types */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="partnershipTypes"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Partnership Types</FormLabel>
                      <Popover>
                        <PopoverTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4">
                          <h4 className="font-medium mb-2">About Partnership Types</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Select the types of support your project needs:
                          </p>
                          <ul className="text-sm space-y-1">
                            {partnershipTypeOptions.map(option => (
                              <li key={option.value} className="flex gap-2">
                                <span className="font-medium">{option.label}:</span> 
                                <span className="text-muted-foreground">{option.description}</span>
                              </li>
                            ))}
                          </ul>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2">
                        {partnershipTypeOptions.map(option => (
                          <div 
                            key={option.value} 
                            className={`flex items-start gap-2 p-3 rounded-md border cursor-pointer transition-colors ${
                              field.value?.includes(option.value as any) 
                                ? 'bg-primary/5 border-primary' 
                                : 'hover:bg-muted/30'
                            }`}
                            onClick={() => {
                              const current = field.value || [];
                              const updated = current.includes(option.value as any)
                                ? current.filter(v => v !== option.value)
                                : [...current, option.value as any];
                              field.onChange(updated);
                            }}
                          >
                            <Checkbox 
                              checked={field.value?.includes(option.value as any)}
                              className="mt-0.5"
                              onCheckedChange={() => {}}
                            />
                            <div>
                              <p className="font-medium">{option.label}</p>
                              <p className="text-xs text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="contact@example.com" />
                  </FormControl>
                  <FormDescription>
                    Email address for project inquiries
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="+1 234 567 8901" />
                  </FormControl>
                  <FormDescription>
                    Phone number for project inquiries
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Proposal Document */}
            <div className="md:col-span-2">
              <FormLabel htmlFor="proposal-file">Project Proposal</FormLabel>
              <div className="mt-1">
                <Input
                  id="proposal-file"
                  type="file"
                  onChange={handleProposalChange}
                  accept=".pdf,.doc,.docx"
                />
                <FormDescription>
                  Upload a detailed project proposal document (PDF or Word format)
                </FormDescription>
                {proposalFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected file: {proposalFile.name}
                  </p>
                )}
                {project?.proposalFilePath && !proposalFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Current proposal document: {project.proposalFilePath.split('/').pop()}
                  </p>
                )}
              </div>
            </div>

            {/* Project Status */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Project Status</FormLabel>
                    <FormControl>
                      <ToggleGroup 
                        type="single" 
                        value={field.value} 
                        onValueChange={(value) => {
                          if (value) field.onChange(value);
                        }}
                        className="justify-start"
                      >
                        <ToggleGroupItem value="draft">
                          Draft
                        </ToggleGroupItem>
                        <ToggleGroupItem value="published">
                          {requireProjectApproval?.value ? "Submit for Approval" : "Publish"}
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                    <FormDescription>
                      {field.value === "draft" ? 
                        "Save as draft to continue editing later" : 
                        requireProjectApproval?.value ? 
                          "Submit for admin review and approval" : 
                          "Make your project visible to the public"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Applications Enabled */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="applicationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Accept Applications</FormLabel>
                      <FormDescription>
                        Allow users to apply to join or contribute to this project
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Submit and Cancel buttons */}
          <div className="flex gap-4 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/projects')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || uploading}
            >
              {isSaving || uploading ? "Saving..." : project ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
