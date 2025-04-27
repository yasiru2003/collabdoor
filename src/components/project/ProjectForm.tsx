
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Project, PartnershipType } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomPartnershipTypes } from "@/components/project/CustomPartnershipTypes";
import { useSystemSettings } from "@/hooks/use-system-settings";

const projectFormSchema = z.object({
  title: z.string().min(2, {
    message: "Project title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
  proposalFilePath: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  applicationsEnabled: z.boolean().default(true).optional(),
});

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function ProjectForm({ project, onSubmit, isLoading }: ProjectFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: project?.title || "",
    description: project?.description || "",
    category: project?.category || "",
    location: project?.location || "",
    image: project?.image || "",
    proposalFilePath: project?.proposalFilePath || "",
    startDate: project?.timeline?.start || "",
    endDate: project?.timeline?.end || "",
    partnershipTypes: project?.partnershipTypes || [] as PartnershipType[],
    applicationsEnabled: project?.applicationsEnabled !== false,
    status: project?.status || "draft",
  });
  const [showCustomTypes, setShowCustomTypes] = useState(false);
  const { getSetting } = useSystemSettings();
  const allowCustomTypes = getSetting("allow_custom_partnership_types", true);
  
  // Check if user has admin role
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to create a project.",
      });
      navigate("/login");
    }
  }, [user, navigate, toast]);

  const formik = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      category: project?.category || "",
      location: project?.location || "",
      image: project?.image || "",
      startDate: project?.timeline?.start || "",
      endDate: project?.timeline?.end || "",
      applicationsEnabled: project?.applicationsEnabled !== false,
    },
    mode: "onChange",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      formik.handleSubmit(async (values) => {
        // Validate start and end dates
        if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
          toast({
            title: "Invalid date range",
            description: "Start date must be before end date.",
            variant: "destructive",
          });
          return;
        }

        // Check if approval is required
        const requireApproval = getSetting("require_project_approval", true);
        const initialStatus = requireApproval && !isAdmin ? "pending_publish" : "published";

        // Ensure applicationsEnabled is a boolean
        const applicationsEnabled = form.applicationsEnabled === true;

        const formData = {
          ...values,
          startDate: form.startDate,
          endDate: form.endDate,
          partnershipTypes: form.partnershipTypes,
          applicationsEnabled, // Explicitly pass the boolean value
          status: form.status || initialStatus,
        };

        await onSubmit(formData);
      })();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project.",
        variant: "destructive",
      });
    }
  };

  return (
    
    <Form {...formik}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <FormField
          control={formik.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="Name this project" {...field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={formik.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe this project"
                  {...field}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={formik.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Add category" {...field} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={formik.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Add location" {...field} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              type="date"
              id="startDate"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              type="date"
              id="endDate"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="block mb-2">Partnership Types</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Select the types of partnerships your project is looking for
            </p>

            <div className="space-y-2">
              {['monetary', 'knowledge', 'skilled', 'volunteering'].map((type) => (
                <div key={type} className="flex items-center">
                  <Checkbox
                    id={`type-${type}`}
                    checked={form.partnershipTypes.includes(type as PartnershipType)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setForm({ ...form, partnershipTypes: [...form.partnershipTypes, type as PartnershipType] });
                      } else {
                        setForm({ ...form, partnershipTypes: form.partnershipTypes.filter(t => t !== type) });
                      }
                    }}
                  />
                  <Label htmlFor={`type-${type}`} className="ml-2 capitalize">
                    {type}
                  </Label>
                </div>
              ))}
            </div>

            {allowCustomTypes && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCustomTypes(!showCustomTypes)}
                >
                  {showCustomTypes ? "Hide Custom Types" : "Show Custom Types"}
                </Button>

                {showCustomTypes && (
                  <CustomPartnershipTypes
                    projectId={project?.id}
                    existingTypes={form.partnershipTypes as string[]}
                    onTypesChange={(types) => setForm({ ...form, partnershipTypes: types as PartnershipType[] })}
                    className="mt-4"
                  />
                )}
              </>
            )}
          </div>
        </div>

        <FormField
          control={formik.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="Add image URL" {...field} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={formik.control}
          name="proposalFilePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal File Path</FormLabel>
              <FormControl>
                <Input placeholder="Add proposal file path" {...field} value={form.proposalFilePath} onChange={(e) => setForm({ ...form, proposalFilePath: e.target.value })} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="applicationsEnabled"
            checked={form.applicationsEnabled}
            onCheckedChange={(checked) => setForm({ ...form, applicationsEnabled: checked })}
          />
          <Label htmlFor="applicationsEnabled">Enable Applications</Label>
        </div>

        {getSetting("require_project_approval", true) && !isAdmin && (
          <div className="bg-yellow-50 p-4 rounded-md text-yellow-800 text-sm mb-6">
            <p className="font-medium">Admin Approval Required</p>
            <p className="mt-1">
              Your project will need to be approved by an administrator before it becomes publicly visible.
            </p>
          </div>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
