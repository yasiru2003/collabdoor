import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, 
  Search, 
  AlertCircle, 
  Eye,
  Trash2,
  CheckCircle,
  UserPlus,
  Check,
  X
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { 
  TablesInsert, 
  Tables, 
  TablesUpdate 
} from "@/integrations/supabase/types";

export function AdminOrganizations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [isOrgDetailsOpen, setIsOrgDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch organizations with owner profile data
  const { data: organizations, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select(`
          *,
          profiles!organizations_owner_id_fkey (name, email)
        `);
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch organization join requests
  const { 
    data: joinRequests,
    isLoading: isLoadingRequests,
    error: requestsError
  } = useQuery({
    queryKey: ["organization-join-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_join_requests")
        .select(`
          *,
          organizations (name),
          profiles!organization_join_requests_user_id_fkey (name, email, profile_image)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Mutation for handling request approval/rejection
  const handleRequestMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      userId, 
      organizationId, 
      organizationName 
    }: { 
      requestId: string, 
      status: 'approved' | 'rejected',
      userId: string,
      organizationId: string,
      organizationName: string
    }) => {
      // Update the request status
      const { error: requestError } = await supabase
        .from("organization_join_requests")
        .update({ status })
        .eq("id", requestId);
        
      if (requestError) throw requestError;
      
      // If approved, add user to organization members
      if (status === 'approved') {
        const { error: memberError } = await supabase
          .from("organization_members")
          .insert({
            organization_id: organizationId,
            user_id: userId,
            role: "member"
          });
          
        if (memberError) throw memberError;
      }
      
      // Send notification to user
      const notificationTitle = status === 'approved' 
        ? "Organization Join Request Approved" 
        : "Organization Join Request Rejected";
        
      const notificationMessage = status === 'approved'
        ? `Your request to join ${organizationName} has been approved.`
        : `Your request to join ${organizationName} has been rejected.`;
        
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          title: notificationTitle,
          message: notificationMessage,
          link: status === 'approved' ? `/organizations/${organizationId}` : null,
          read: false
        });
        
      if (notificationError) throw notificationError;
      
      return { requestId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-join-requests"] });
      toast({
        title: "Request processed",
        description: "The join request has been processed successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Filter organizations based on search query
  const filteredOrgs = organizations?.filter(org => 
    org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleViewOrganization = (orgId: string) => {
    navigate(`/organizations/${orgId}`);
  };
  
  const handleViewDetails = (org: any) => {
    setSelectedOrg(org);
    setIsOrgDetailsOpen(true);
  };
  
  const confirmDelete = (org: any) => {
    setSelectedOrg(org);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!selectedOrg) return;
    
    try {
      const { error } = await supabase
        .from("organizations")
        .delete()
        .eq("id", selectedOrg.id);
      
      if (error) throw error;
      
      toast({
        title: "Organization deleted",
        description: `${selectedOrg.name} has been permanently deleted`,
      });
      
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error deleting organization",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleApproveRequest = (request: any) => {
    handleRequestMutation.mutate({
      requestId: request.id,
      status: "approved",
      userId: request.user_id,
      organizationId: request.organization_id,
      organizationName: request.organizations?.name || "the organization"
    });
  };
  
  const handleRejectRequest = (request: any) => {
    handleRequestMutation.mutate({
      requestId: request.id,
      status: "rejected",
      userId: request.user_id,
      organizationId: request.organization_id,
      organizationName: request.organizations?.name || "the organization"
    });
  };
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load organizations: {error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Organization Management</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="organizations">
        <TabsList>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="join-requests">
            Join Requests
            {joinRequests && joinRequests.length > 0 && (
              <Badge className="ml-2" variant="secondary">{joinRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="organizations" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[30px]" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredOrgs?.length ? (
                  filteredOrgs.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>{org.industry || "Not specified"}</TableCell>
                      <TableCell>{org.location || "Not specified"}</TableCell>
                      <TableCell>{org.profiles?.name || "Unknown"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {org.created_at ? format(new Date(org.created_at), "MMM d, yyyy") : "Unknown"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrganization(org.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View organization
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetails(org)}>
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => confirmDelete(org)} 
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete organization
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No organizations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="join-requests" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRequests ? (
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    </TableRow>
                  ))
                ) : joinRequests?.length ? (
                  joinRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={request.profiles?.profile_image || ""} />
                            <AvatarFallback className="text-xs">
                              {request.profiles?.name?.substring(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{request.profiles?.name}</p>
                            <p className="text-xs text-muted-foreground">{request.profiles?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{request.organizations?.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(request.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-[200px]">
                          {request.message || "No message provided"}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApproveRequest(request)}
                            disabled={handleRequestMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectRequest(request)}
                            disabled={handleRequestMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-4">
                        <UserPlus className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No pending join requests</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Organization details dialog */}
      <Dialog open={isOrgDetailsOpen} onOpenChange={setIsOrgDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Organization Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected organization
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrg && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Organization ID:</div>
                <div className="truncate">{selectedOrg.id}</div>
                
                <div className="font-semibold">Name:</div>
                <div>{selectedOrg.name}</div>
                
                <div className="font-semibold">Industry:</div>
                <div>{selectedOrg.industry || "Not specified"}</div>
                
                <div className="font-semibold">Location:</div>
                <div>{selectedOrg.location || "Not specified"}</div>
                
                <div className="font-semibold">Size:</div>
                <div>{selectedOrg.size || "Not specified"}</div>
                
                <div className="font-semibold">Founded:</div>
                <div>{selectedOrg.founded_year || "Not specified"}</div>
                
                <div className="font-semibold">Website:</div>
                <div>
                  {selectedOrg.website ? (
                    <a 
                      href={selectedOrg.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline truncate"
                    >
                      {selectedOrg.website}
                    </a>
                  ) : (
                    "Not specified"
                  )}
                </div>
                
                <div className="font-semibold">Owner:</div>
                <div>{selectedOrg.profiles?.name || "Unknown"}</div>
                
                <div className="font-semibold">Created:</div>
                <div>
                  {selectedOrg.created_at 
                    ? format(new Date(selectedOrg.created_at), "PPP") 
                    : "Unknown"}
                </div>
              </div>
              
              <div>
                <div className="font-semibold mb-1">Description:</div>
                <div className="text-sm text-muted-foreground">{selectedOrg.description || "No description provided"}</div>
              </div>
              
              {selectedOrg.logo && (
                <div>
                  <div className="font-semibold mb-1">Logo:</div>
                  <img 
                    src={selectedOrg.logo} 
                    alt={`${selectedOrg.name} logo`} 
                    className="w-24 h-24 object-contain border rounded"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the organization "{selectedOrg?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
