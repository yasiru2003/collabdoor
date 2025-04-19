
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { PartnershipType } from '@/types';
import { Check } from 'lucide-react';

interface PartnershipApplicationFormProps {
  organizationId: string;
  interestId: string;
  partnershipType: PartnershipType;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }).max(500, {
    message: "Message must not exceed 500 characters.",
  }),
  projectId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PartnershipApplicationForm({ 
  organizationId, 
  interestId, 
  partnershipType,
  onSuccess, 
  onCancel 
}: PartnershipApplicationFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      projectId: '',
    },
  });
  
  // Fetch user's projects for the select dropdown
  const { data: userProjects } = useQuery({
    queryKey: ['user-projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status')
        .eq('organizer_id', user.id)
        .in('status', ['published', 'in-progress'])
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching user projects:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });
  
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user) throw new Error('You must be logged in to apply');
      
      // Use the typed version to access the partnership_applications table
      const { error } = await supabase
        .from('partnership_applications')
        .insert({
          organization_id: organizationId,
          user_id: user.id,
          interest_id: interestId,
          partnership_type: partnershipType,
          project_id: values.projectId || null,
          message: values.message,
          status: 'pending',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Application Submitted',
        description: 'Your partnership application has been sent successfully',
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your application',
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {userProjects && userProjects.length > 0 && (
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to a Project (Optional)</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {userProjects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title} ({project.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Optionally connect this application to one of your projects
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Explain how you can contribute and why you're interested in this partnership..."
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormDescription>
                Provide details about your interest and qualifications for this partnership
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
