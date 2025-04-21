import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { notifyOrganizationJoinRequest } from '@/services/notification-service';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Handshake, ExternalLink, Mail } from 'lucide-react';
import { PartnershipType } from '@/types';

interface PartnershipApplicationsTabProps {
  organizationId: string;
  organizationName: string;
  isOwner: boolean;
}

export function PartnershipApplicationsTab({
  organizationId,
  organizationName,
  isOwner
}: PartnershipApplicationsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  // Define partnership type labels
  const partnershipTypeLabels: Record<PartnershipType, string> = {
    'monetary': 'Financial Support',
    'knowledge': 'Knowledge Sharing',
    'skilled': 'Skilled Professionals',
    'volunteering': 'Volunteering'
  };

  // Fetch partnership applications for this organization
  const { data: applications, isLoading } = useQuery({
    queryKey: ["partnership-applications", organizationId],
    queryFn: async () => {
      if (!organizationId || !isOwner) return [];
      
      // First fetch the applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("partnership_applications")
        .select(`
          *,
          organization_partnership_interests(
            description,
            partnership_type
          ),
          projects(
            id,
            title,
            status
          )
        `)
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
        
      if (applicationsError) {
        console.error("Error fetching partnership applications:", applicationsError);
        throw applicationsError;
      }
      
      if (applicationsData && applicationsData.length > 0) {
        // Get all user IDs from applications
        const userIds = applicationsData.map(app => app.user_id);
        
        // Fetch profiles separately
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, email, profile_image")
          .in("id", userIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        // Merge the data
        const applicationsWithProfiles = applicationsData.map(app => {
          // Find the matching profile
          const profile = profilesData?.find(profile => profile.id === app.user_id);
          return {
            ...app,
            profile: profile || null
          };
        });
        
        return applicationsWithProfiles;
      }
      
      return applicationsData || [];
    },
    enabled: !!organizationId && isOwner,
  });

  // Handle application approval
  const handleApprove = async (applicationId: string, userId: string) => {
    try {
      setProcessingIds(prev => [...prev, applicationId]);
      
      // Update application status
      const { error: updateError } = await supabase
        .from("partnership_applications")
        .update({ status: "approved" })
        .eq("id", applicationId);
        
      if (updateError) throw updateError;
      
      try {
        // Send notification to user
        await notifyOrganizationJoinRequest(
          userId,
          organizationName,
          "approved",
          organizationId
        );
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Continue execution even if notification fails
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["partnership-applications"] });
      
      toast({
        title: "Application approved",
        description: "The partnership application has been approved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== applicationId));
    }
  };
  
  // Handle application rejection
  const handleReject = async (applicationId: string, userId: string) => {
    try {
      setProcessingIds(prev => [...prev, applicationId]);
      
      // Update application status
      const { error } = await supabase
        .from("partnership_applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);
        
      if (error) throw error;
      
      try {
        // Send notification to user
        await notifyOrganizationJoinRequest(
          userId,
          organizationName,
          "rejected"
        );
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Continue execution even if notification fails
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["partnership-applications"] });
      
      toast({
        title: "Application rejected",
        description: "The partnership application has been rejected.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== applicationId));
    }
  };

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Partnership Applications</CardTitle>
          <CardDescription>
            Only organization owners can view partnership applications
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partnership Applications</CardTitle>
        <CardDescription>
          Manage applications from users who want to partner with your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading applications...</p>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application: any) => (
              <div key={application.id} className="flex flex-col gap-4 p-4 border rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={application.profile?.profile_image || ""} />
                      <AvatarFallback>
                        {(application.profile?.name || application.profile?.email || "?").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      {/* Make applicant's name a link to profile page */}
                      <p className="font-medium">
                        {application.profile?.id ? (
                          <a
                            href={`/users/${application.profile.id}`}
                            className="hover:text-primary underline underline-offset-2 transition-colors"
                          >
                            {application.profile?.name || application.profile?.email || "Unknown User"}
                          </a>
                        ) : (
                          application.profile?.name || application.profile?.email || "Unknown User"
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Applied {new Date(application.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="mt-1">
                          {partnershipTypeLabels[application.partnership_type as PartnershipType]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => window.location.href = `mailto:${application.profile?.email}`}
                    >
                      <Mail className="h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </div>
                
                {application.message && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Message:</p>
                    <p className="mt-1 text-sm border-l-2 pl-2 border-muted">
                      "{application.message}"
                    </p>
                  </div>
                )}
                
                {application.project_id && application.projects && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Linked Project:</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {application.projects.title} ({application.projects.status})
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-auto p-1"
                        onClick={() => window.open(`/projects/${application.project_id}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleReject(application.id, application.user_id)}
                    disabled={processingIds.includes(application.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="text-white"
                    onClick={() => handleApprove(application.id, application.user_id)}
                    disabled={processingIds.includes(application.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Handshake className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Pending Applications</h3>
            <p className="text-muted-foreground max-w-md">
              There are no pending partnership applications for this organization.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
