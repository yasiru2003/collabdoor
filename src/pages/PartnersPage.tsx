import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { usePartnerships } from "@/hooks/use-organizations-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use the enhanced usePartnerships hook
  const { data: partnerships, isLoading: isLoadingPartnerships, refetch } = usePartnerships(user?.id);

  // Filter partnerships based on search query
  const filteredPartnerships = partnerships?.filter(partnership => {
    if (!searchQuery) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    const projectTitle = partnership.projects?.title?.toLowerCase() || "";
    const orgName = partnership.organizations?.name?.toLowerCase() || "";
    
    return projectTitle.includes(searchTerm) || orgName.includes(searchTerm);
  });

  // Find requested partnerships (pending)
  const requestedPartnerships = filteredPartnerships?.filter(p => p.status === 'pending') || [];
  
  // Find active partnerships
  const activePartnerships = filteredPartnerships?.filter(p => p.status === 'active') || [];
  
  // Find past partnerships (completed)
  const pastPartnerships = filteredPartnerships?.filter(p => 
    p.status === 'completed' || (p.projects?.status === 'completed')
  ) || [];

  // Find rejected partnerships
  const rejectedPartnerships = filteredPartnerships?.filter(p => p.status === 'rejected') || [];

  // Accept a partnership request
  const handleAcceptPartnership = async (partnershipId) => {
    try {
      // Fixed: Update the partnership status in the partnerships table
      const { error } = await supabase
        .from("partnerships")
        .update({ status: "active" })
        .eq("id", partnershipId);

      if (error) throw error;

      toast({
        title: "Partnership accepted",
        description: "The partnership has been activated successfully.",
      });
      
      refetch();
    } catch (error) {
      console.error("Error accepting partnership:", error);
      toast({
        title: "Error accepting partnership",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Reject a partnership request
  const handleRejectPartnership = async (partnershipId) => {
    try {
      const { error } = await supabase
        .from("partnerships")
        .update({ status: "rejected" })
        .eq("id", partnershipId);

      if (error) throw error;

      toast({
        title: "Partnership rejected",
        description: "The partnership has been rejected.",
        variant: "destructive",
      });
      
      refetch();
    } catch (error) {
      console.error("Error rejecting partnership:", error);
      toast({
        title: "Error rejecting partnership",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // View partnership details (navigate to project page)
  const handleViewDetails = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const renderPartnershipTable = (partnershipsList) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organization</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {partnershipsList.length > 0 ? (
          partnershipsList.map((partnership) => (
            <TableRow key={partnership.id}>
              <TableCell className="font-medium">
                {partnership.organizations?.name || 
                 partnership.organization_name || 
                 partnership.projects?.organization_name || 
                 "Unknown Organization"}
              </TableCell>
              <TableCell>{partnership.projects?.title || "Unknown Project"}</TableCell>
              <TableCell>
                <Badge variant="outline">{partnership.partnership_type}</Badge>
              </TableCell>
              <TableCell>
                {partnership.status === 'pending' && (
                  <Badge variant="secondary">Pending</Badge>
                )}
                {partnership.status === 'active' && (
                  <Badge variant="default">Active</Badge>
                )}
                {partnership.status === 'rejected' && (
                  <Badge variant="destructive">Rejected</Badge>
                )}
                {(partnership.status === 'completed' || partnership.projects?.status === 'completed') && (
                  <Badge variant="outline">Completed</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(partnership.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(partnership.project_id)}
                >
                  View Details
                </Button>
                
                {partnership.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600"
                      onClick={() => handleAcceptPartnership(partnership.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleRejectPartnership(partnership.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No partnerships found</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Partners</h1>
          <p className="text-muted-foreground">Manage your partnership relationships</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 my-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search partnerships..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="requested" className="mb-6">
        <TabsList>
          <TabsTrigger value="requested">Requested Partners</TabsTrigger>
          <TabsTrigger value="active">Active Partners</TabsTrigger>
          <TabsTrigger value="past">Completed Partners</TabsTrigger>
          <TabsTrigger value="rejected">Rejected Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="requested" className="mt-4">
          {isLoadingPartnerships ? (
            <div className="py-8">
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            renderPartnershipTable(requestedPartnerships)
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          {isLoadingPartnerships ? (
            <div className="py-8">
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            renderPartnershipTable(activePartnerships)
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {isLoadingPartnerships ? (
            <div className="py-8">
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            renderPartnershipTable(pastPartnerships)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          {isLoadingPartnerships ? (
            <div className="py-8">
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            renderPartnershipTable(rejectedPartnerships)
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
