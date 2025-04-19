
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Handshake, Plus, PlusCircle } from 'lucide-react';
import { PartnershipInterestForm } from './PartnershipInterestForm';
import { PartnershipApplicationForm } from './PartnershipApplicationForm';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { PartnershipType } from '@/types';
import { EmptyState } from '@/components/empty-state';

interface PartnershipInterest {
  id: string;
  organization_id: string;
  partnership_type: PartnershipType;
  description: string;
  created_at: string;
}

interface PartnershipInterestsTabProps {
  organizationId: string;
  isOwner: boolean;
  isMember: boolean;
}

export function PartnershipInterestsTab({ organizationId, isOwner, isMember }: PartnershipInterestsTabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<PartnershipInterest | null>(null);
  
  // Fetch partnership interests
  const { data: interests, isLoading } = useQuery({
    queryKey: ['organization-partnership-interests', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_partnership_interests')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching partnership interests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load partnership interests',
          variant: 'destructive',
        });
        return [];
      }
      
      return data as PartnershipInterest[];
    },
    enabled: !!organizationId,
  });
  
  // Delete a partnership interest
  const deleteMutation = useMutation({
    mutationFn: async (interestId: string) => {
      const { error } = await supabase
        .from('organization_partnership_interests')
        .delete()
        .eq('id', interestId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-partnership-interests', organizationId] });
      toast({
        title: 'Success',
        description: 'Partnership interest removed',
      });
    },
    onError: (error) => {
      console.error('Error deleting partnership interest:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove partnership interest',
        variant: 'destructive',
      });
    }
  });
  
  const handleDelete = (interestId: string) => {
    if (confirm('Are you sure you want to remove this partnership interest?')) {
      deleteMutation.mutate(interestId);
    }
  };
  
  const handleAddSuccess = () => {
    setShowAddForm(false);
    queryClient.invalidateQueries({ queryKey: ['organization-partnership-interests', organizationId] });
  };
  
  const handleApplicationSuccess = () => {
    setSelectedInterest(null);
    toast({
      title: 'Application Submitted',
      description: 'Your partnership application has been submitted successfully',
    });
  };
  
  // Partnership type display mapping
  const partnershipTypeLabels: Record<PartnershipType, string> = {
    'monetary': 'Financial Support',
    'knowledge': 'Knowledge Sharing',
    'skilled': 'Skilled Professionals',
    'volunteering': 'Volunteering'
  };
  
  const partnershipTypeColors: Record<PartnershipType, string> = {
    'monetary': 'bg-green-100 text-green-800 hover:bg-green-200',
    'knowledge': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'skilled': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    'volunteering': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Partnership Interests</CardTitle>
          <CardDescription>Loading partnership interests...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Partnership Interests</CardTitle>
            <CardDescription>
              Areas where this organization is seeking partnerships
            </CardDescription>
          </div>
          {isOwner && (
            <Button variant="outline" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Interest
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {interests && interests.length > 0 ? (
            <div className="space-y-4">
              {interests.map((interest) => (
                <Card key={interest.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={partnershipTypeColors[interest.partnership_type]}>
                        {partnershipTypeLabels[interest.partnership_type]}
                      </Badge>
                      {isOwner && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(interest.id)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{interest.description}</p>
                  </CardContent>
                  {!isOwner && user && (
                    <CardFooter className="flex justify-end pt-0">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedInterest(interest)}
                      >
                        Apply for Partnership
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Handshake}
              title="No Partnership Interests"
              description={
                isOwner 
                  ? "Add your first partnership interest to let others know how they can collaborate with you"
                  : "This organization hasn't specified any partnership interests yet"
              }
            />
          )}
        </CardContent>
      </Card>
      
      {/* Add Partnership Interest Form Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Partnership Interest</DialogTitle>
            <DialogDescription>
              Specify what type of partnerships your organization is looking for
            </DialogDescription>
          </DialogHeader>
          
          <PartnershipInterestForm 
            organizationId={organizationId} 
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Partnership Application Form Modal */}
      <Dialog open={!!selectedInterest} onOpenChange={(open) => !open && setSelectedInterest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Partnership</DialogTitle>
            <DialogDescription>
              {selectedInterest && (
                <>
                  <Badge className="mt-2 mb-1">
                    {partnershipTypeLabels[selectedInterest.partnership_type]}
                  </Badge>
                  <p className="text-sm mt-2">{selectedInterest.description}</p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Separator className="my-2" />
          
          {selectedInterest && (
            <PartnershipApplicationForm 
              organizationId={organizationId}
              interestId={selectedInterest.id}
              partnershipType={selectedInterest.partnership_type}
              onSuccess={handleApplicationSuccess}
              onCancel={() => setSelectedInterest(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
