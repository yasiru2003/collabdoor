
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface AnnouncementFormValues {
  title: string;
  message: string;
  color: string;
  is_active: boolean;
  end_date?: string;
}

export function AnnouncementForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<AnnouncementFormValues>({
    defaultValues: {
      title: "",
      message: "",
      color: "blue",
      is_active: true
    }
  });

  // Watch for form values
  const isActive = watch("is_active");

  // Register the values that won't use standard input fields
  const handleColorChange = (value: string) => {
    setValue("color", value);
  };

  const handleIsActiveChange = (checked: boolean) => {
    setValue("is_active", checked);
  };

  const onSubmit = async (data: AnnouncementFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Format the end date properly for database
      const formattedData = {
        title: data.title,
        message: data.message,
        color: data.color,
        is_active: data.is_active,
        created_by: user.id,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null
      };
      
      // Use raw SQL approach to avoid TypeScript issues with the newly created table
      const { error } = await supabase
        .from('announcement_banners')
        .insert(formattedData as any);
        
      if (error) throw error;
      
      toast({
        title: "Announcement created",
        description: "Your announcement banner has been created successfully."
      });
      
      // Reset the form
      reset();
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement banner",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Announcement Banner</CardTitle>
        <CardDescription>
          Create a new announcement banner that will be displayed on the dashboard.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Announcement Title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Announcement message"
              rows={4}
              {...register("message", { required: "Message is required" })}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select defaultValue="blue" onValueChange={handleColorChange}>
              <SelectTrigger id="color">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={handleIsActiveChange}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date (Optional)</Label>
            <Input
              id="end_date"
              type="datetime-local"
              {...register("end_date")}
            />
            <p className="text-xs text-muted-foreground">
              If set, the announcement will automatically deactivate after this date.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Announcement"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
