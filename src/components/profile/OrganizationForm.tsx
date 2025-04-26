import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlus, Upload, CheckCircle2 } from "lucide-react";
import { useSystemSettings } from "@/hooks/use-system-settings";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  industry: z.string().min(2, {
    message: "Industry must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  size: z.string().min(2, {
    message: "Size must be at least 2 characters.",
  }),
  founded_year: z.string().min(4, {
    message: "Founded year must be at least 4 characters.",
  }),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }),
  logo: z.string().optional(),
});

export function OrganizationForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { autoApproveOrganizations } = useSystemSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      location: "",
      size: "",
      founded_year: "",
      website: "",
    },
  });

  const { mutate: createOrganization, isLoading } = useMutation(
    async (values: z.infer<typeof formSchema>) => {
      if (!user) {
        throw new Error("You must be logged in to create an organization.");
      }

      const status = autoApproveOrganizations ? 'active' : 'pending_approval';

      const { data, error } = await supabase
        .from("organizations")
        .insert([
          {
            ...values,
            owner_id: user.id,
            logo: logoUrl,
            status: status,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    {
      onSuccess: (data) => {
        toast({
          title: autoApproveOrganizations ? "Organization Created" : "Organization Submitted for Review",
          description: autoApproveOrganizations
            ? "Your organization has been created successfully."
            : "Your organization has been submitted and is awaiting admin approval.",
        });
        navigate(`/organizations/${data.id}`);
      },
      onError: (error: any) => {
        toast({
          title: "Error creating organization",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createOrganization(values);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (!file) {
      toast({
        title: "Error uploading logo",
        description: "Please select a logo to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from("logos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      const url = `${
        import.meta.env.VITE_SUPABASE_URL
      }/storage/v1/object/public/logos/${filePath}`;
      setLogoUrl(url);
    } catch (error: any) {
      toast({
        title: "Error uploading logo",
        description: error.message,
        variant: "destructive",
      });
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization name</FormLabel>
              <FormControl>
                <Input placeholder="CollabDoor" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed on your organization
                page.
              </FormDescription>
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
                  placeholder="Tell us a little bit about your organization"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write a clear and concise description of your organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input placeholder="Technology" {...field} />
                </FormControl>
                <FormDescription>
                  What industry does your organization operate in?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="New York" {...field} />
                </FormControl>
                <FormDescription>Where is your organization located?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input placeholder="11-50 employees" {...field} />
                </FormControl>
                <FormDescription>How many employees does your organization have?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="founded_year"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Founded year</FormLabel>
                <FormControl>
                  <Input placeholder="2020" {...field} />
                </FormControl>
                <FormDescription>When was your organization founded?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://collabdoor.com" {...field} />
              </FormControl>
              <FormDescription>
                What is the URL of your organization's website?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Logo</FormLabel>
          <div
            className={cn(
              "border-dashed border-2 rounded-md flex flex-col items-center justify-center relative aspect-square h-40 cursor-pointer",
              logoUrl ? "border-primary" : "border-muted"
            )}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {logoUrl ? (
              <>
                <Avatar className="absolute h-full w-full">
                  <AvatarImage src={logoUrl} alt="Organization logo" className="object-cover" />
                  <AvatarFallback>
                    <ImagePlus className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-green-500 stroke-2" />
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <Label className="text-sm text-muted-foreground">
                  Upload a logo
                </Label>
              </>
            )}
          </div>
        </div>
        <Button type="submit" disabled={isLoading}>
          Create organization
        </Button>
      </form>
    </Form>
  );
}
