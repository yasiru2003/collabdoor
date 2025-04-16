
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notifyOrganizationJoinRequest } from "@/services/notification-service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Users } from "lucide-react";

interface OrganizationRequestsTabProps {
  organizationId: string;
  organizationName: string;
  isOwner: boolean;
}

export function OrganizationRequestsTab({
  organizationId,
  organizationName,
  isOwner
}: OrganizationRequestsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  // Fetch join requests for this organization
  const { data: joinRequests, isLoading } = useQuery({
    queryKey: ["organization-join-requests", organizationId],
    queryFn: async () => {
      if (!organizationId || !isOwner) return [];
      
      const { data, error } = await supabase
        .from("organization_join_requests")
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId && isOwner,
  });

  // Handle request approval
  const handleApprove = async (requestId: string, userId: string) => {
    try {
      setProcessingIds(prev => [...prev, requestId]);
      
      // Update request status
      const { error: updateError } = await supabase
        .from("organization_join_requests")
        .update({ status: "approved" })
        .eq("id", requestId);
        
      if (updateError) throw updateError;
      
      // Add user to organization members
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: organizationId,
          user_id: userId,
          role: "member"
        });
        
      if (memberError) throw memberError;
      
      // Send notification to user
      await notifyOrganizationJoinRequest(
        userId,
        organizationName,
        "approved",
        organizationId
      );
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["organization-join-requests"] });
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      
      toast({
        title: "Request approved",
        description: "The user has been added to the organization.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };
  
  // Handle request rejection
  const handleReject = async (requestId: string, userId: string) => {
    try {
      setProcessingIds(prev => [...prev, requestId]);
      
      // Update request status
      const { error } = await supabase
        .from("organization_join_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);
        
      if (error) throw error;
      
      // Send notification to user
      await notifyOrganizationJoinRequest(
        userId,
        organizationName,
        "rejected"
      );
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["organization-join-requests"] });
      
      toast({
        title: "Request rejected",
        description: "The join request has been rejected.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join Requests</CardTitle>
          <CardDescription>
            Only organization owners can view join requests
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Requests</CardTitle>
        <CardDescription>
          Manage requests from users who want to join your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading requests...</p>
        ) : joinRequests && joinRequests.length > 0 ? (
          <div className="space-y-4">
            {joinRequests.map((request: any) => (
              <div key={request.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={request.profiles?.profile_image || ""} />
                    <AvatarFallback>
                      {(request.profiles?.name || request.profiles?.email || "?").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.profiles?.name || request.profiles?.email || "Unknown User"}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    {request.message && (
                      <p className="mt-2 text-sm border-l-2 pl-2 border-muted">
                        "{request.message}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleReject(request.id, request.user_id)}
                    disabled={processingIds.includes(request.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="text-white"
                    onClick={() => handleApprove(request.id, request.user_id)}
                    disabled={processingIds.includes(request.id)}
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
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Pending Requests</h3>
            <p className="text-muted-foreground max-w-md">
              There are no pending join requests for this organization.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
