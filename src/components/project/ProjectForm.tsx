import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Image as ImageIcon, Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PartnershipType, Organization } from "@/types";
import { uploadImage, uploadProposal } from "@/utils/upload-utils";
import { mapSupabaseOrgToOrganization } from "@/utils/data-mappers";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  location: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  partnershipTypes: z.array(z.string()).min(1, { message: "Select at least one partnership type" }),
  requiredSkills: z.array(z.string()).optional(),
  projectType: z.enum(["individual", "organization"]),
  organizationId: z.string().optional(),
  proposalFile: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "File size must be less than 10MB"
    )
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
      "Only PDF and Word documents are accepted"
    ),
  projectImage: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "File size must be less than 10MB"
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only JPEG, PNG, or WebP images are accepted"
    ),
});

type FormValues = z.infer<typeof formSchema>;

export function ProjectForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      partnershipTypes: [],
      requiredSkills: [],
      projectType: "individual",
      organizationId: "",
    },
  });
  
  // Watch the projectType value to conditionally render organization selection
  const projectType = form.watch("projectType");
  
  // Fetch user's organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("owner_id", user.id);
          
        if (error) throw error;
        
        const mappedOrgs = (data || []).map(org => mapSupabaseOrgToOrganization(org));
        setUserOrganizations(mappedOrgs);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganizations();
  }, [user]);
  
  const partnershipTypes: { value: PartnershipType; label: string }[] = [
    { value: "monetary", label: "Monetary Support" },
    { value: "knowledge", label: "Knowledge Sharing" },
    { value: "skilled", label: "Skilled Labor" },
    { value: "volunteering", label: "Volunteering" },
  ];
  
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
  
  const addSkill = () => {
    if (newSkill.trim() && !form.getValues().requiredSkills?.includes(newSkill.trim())) {
      form.setValue("requiredSkills", [...(form.getValues().requiredSkills || []), newSkill.trim()]);
      setNewSkill("");
    }
  };
  
  const removeSkill = (skill: string) => {
    form.setValue(
      "requiredSkills",
      form.getValues().requiredSkills?.filter((s) => s !== skill) || []
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue("proposalFile", file);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      form.setValue("projectImage", file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a project",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let proposal_file_path = null;
      let project_image_url = null;
      
      // Upload proposal file if selected
      if (values.proposalFile) {
        console.log("Uploading proposal file:", values.proposalFile.name);
        proposal_file_path = await uploadProposal(values.proposalFile, user.id);
        
        if (!proposal_file_path) {
          toast({
            title: "Proposal upload failed",
            description: "Failed to upload project proposal, but proceeding with project creation",
            variant: "destructive",
          });
        } else {
          console.log("Proposal successfully uploaded:", proposal_file_path);
        }
      }
      
      // Upload project image if selected
      if (values.projectImage) {
        project_image_url = await uploadImage(values.projectImage, 'projects', user.id);
        if (!project_image_url) {
          toast({
            title: "Image upload failed",
            description: "Failed to upload project image, but proceeding with project creation",
            variant: "destructive",
          });
        }
      }
      
      // Determine organization details based on project type
      let organization_id = null;
      let organization_name = null;
      
      if (values.projectType === "organization" && values.organizationId) {
        const selectedOrg = userOrganizations.find(org => org.id === values.organizationId);
        organization_id = values.organizationId;
        organization_name = selectedOrg?.name || null;
      }
      
      const projectData = {
        title: values.title,
        description: values.description,
        category: values.category,
        location: values.location,
        start_date: values.startDate.toISOString(),
        end_date: values.endDate.toISOString(),
        partnership_types: values.partnershipTypes as PartnershipType[],
        required_skills: values.requiredSkills,
        organizer_id: user.id,
        organization_id: organization_id,
        organization_name: organization_name,
        status: "published" as "draft" | "published" | "in-progress" | "completed",
        proposal_file_path: proposal_file_path,
        image: project_image_url,
      };
      
      const { data, error } = await supabase.from("projects").insert(projectData).select();
      
      if (error) throw error;
      
      toast({
        title: "Project created successfully",
        description: "Your project has been created and is now visible to potential partners",
      });
      
      // Navigate to the newly created project
      if (data && data[0]) {
        navigate(`/projects/${data[0].id}`);
      } else {
        navigate("/projects");
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Failed to create project",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Project Image Upload */}
            <FormField
              control={form.control}
              name="projectImage"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Project Image</FormLabel>
                  <FormDescription>
                    Upload a cover image for your project (optional, JPEG, PNG or WebP, max 10MB)
                  </FormDescription>
                  <FormControl>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={handleImageChange}
                          className="flex-1"
                          {...fieldProps}
                        />
                      </div>
                      
                      {imagePreview && (
                        <div className="relative">
                          <div className="aspect-video w-full max-h-[200px] overflow-hidden rounded-md border border-border">
                            <img
                              src={imagePreview}
                              alt="Project image preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                              form.setValue("projectImage", undefined);
                            }}
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 p-0"
                          >
                            ✕
                          </Button>
                        </div>
                      )}
                    </div>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your project, its goals, and why partners should join" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
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
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Project location (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Project Type Selection */}
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Project Type</FormLabel>
                  <FormDescription>
                    Choose whether this is a personal project or from one of your organizations
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="individual" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Individual Project
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="organization" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Organization Project
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Organization selection - only shown when organization project type is selected */}
            {projectType === "organization" && userOrganizations.length > 0 && (
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Organization</FormLabel>
                    <FormDescription>
                      Choose which organization this project belongs to
                    </FormDescription>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userOrganizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {projectType === "organization" && userOrganizations.length === 0 && (
              <div className="rounded-md bg-muted p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Building className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-foreground">No organizations found</h3>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        You don't have any organizations yet. Create one before publishing an organization project.
                      </p>
                      <div className="mt-3">
                        <Button 
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/organizations/create")}
                        >
                          Create Organization
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Project Proposal File Upload */}
            <FormField
              control={form.control}
              name="proposalFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Project Proposal</FormLabel>
                  <FormDescription>
                    Upload a detailed project proposal document (optional, PDF or Word, max 10MB)
                  </FormDescription>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="flex-1"
                          {...fieldProps}
                        />
                      </div>
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Selected file: {selectedFile.name}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedFile(null);
                              form.setValue("proposalFile", undefined);
                            }}
                            className="h-auto p-1"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="partnershipTypes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Partnership Types</FormLabel>
                    <FormDescription>
                      Select what types of partnerships you're looking for
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {partnershipTypes.map((type) => (
                      <FormField
                        key={type.value}
                        control={form.control}
                        name="partnershipTypes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={type.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, type.value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== type.value
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {type.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Required Skills</FormLabel>
              <FormDescription>
                Add skills that partners should have to contribute to this project
              </FormDescription>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="Add a required skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {form.getValues().requiredSkills?.map((skill) => (
                  <div
                    key={skill}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      className="text-sm hover:text-destructive"
                      onClick={() => removeSkill(skill)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </FormItem>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
