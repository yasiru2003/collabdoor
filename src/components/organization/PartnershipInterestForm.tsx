
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
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PartnershipType } from '@/types';

interface PartnershipInterestFormProps {
  organizationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  partnershipType: z.enum(['monetary', 'knowledge', 'skilled', 'volunteering'] as const),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description must not exceed 500 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function PartnershipInterestForm({ organizationId, onSuccess, onCancel }: PartnershipInterestFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partnershipType: 'knowledge',
      description: '',
    },
  });
  
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Use the typed version to access the organization_partnership_interests table
      const { error } = await supabase
        .from('organization_partnership_interests')
        .insert({
          organization_id: organizationId,
          partnership_type: values.partnershipType,
          description: values.description,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Partnership interest added successfully',
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Error creating partnership interest:', error);
      toast({
        title: 'Error',
        description: 'Failed to add partnership interest',
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values);
  };
  
  const partnershipOptions = [
    { value: 'monetary', label: 'Financial Support' },
    { value: 'knowledge', label: 'Knowledge Sharing' },
    { value: 'skilled', label: 'Skilled Professionals' },
    { value: 'volunteering', label: 'Volunteering' },
  ];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="partnershipType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partnership Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a partnership type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {partnershipOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the type of partnership your organization is looking for
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
                  placeholder="Describe the partnership opportunity and what you're looking for..."
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                Provide details about the partnership opportunity and requirements
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
            {createMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
