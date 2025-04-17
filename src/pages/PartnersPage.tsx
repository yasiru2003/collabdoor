
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
import { useProjectApplications } from "@/hooks/use-project-applications";
import type { ApplicationStatus } from "@/hooks/use-project-applications";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Use the enhanced usePartnerships hook
  const { data: partnerships, isLoading: isLoadingPartnerships, refetch } = usePartnerships(user?.id);

  // Import the useProjectApplications hook that contains the working accept/reject logic
  const { updateApplicationStatus } = useProjectApplications();

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

  // Accept a partnership request using the application hook
  const handleAcceptPartnership = async (partnershipId) => {
    try {
      // Get the partnership details to get application ID
      const { data: partnershipData, error: fetchError } = await supabase
        .from("partnerships")
        .select("*")
        .eq("id", partnershipId)
        .maybeSingle(); // Changed from single() to maybeSingle() to avoid 406 error

      if (fetchError) throw fetchError;
      
      // If partnership data doesn't exist, throw an error
      if (!partnershipData) {
        throw new Error("Partnership not found");
      }

      // Check if there's a corresponding application
      const { data: applicationData, error: appError } = await supabase
        .from("project_applications")
        .select("id")
        .eq("project_id", partnershipData.project_id)
        .eq("user_id", partnershipData.partner_id)
        .maybeSingle();

      if (appError) throw appError;

      if (applicationData?.id) {
        // If there's an application, use the updateApplicationStatus function
        await updateApplicationStatus(applicationData.id, "approved" as ApplicationStatus);
      } else {
        // If no application exists, just update the partnership status directly
        const { error } = await supabase
          .from("partnerships")
          .update({ status: "active" })
          .eq("id", partnershipId);

        if (error) {
          console.error("Error updating partnership:", error);
          throw error;
        }
      }

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

  // Reject a partnership request using the application hook
  const handleRejectPartnership = async (partnershipId) => {
    try {
      // Get the partnership details to get application ID
      const { data: partnershipData, error: fetchError } = await supabase
        .from("partnerships")
        .select("*")
        .eq("id", partnershipId)
        .maybeSingle(); // Changed from single() to maybeSingle() to avoid 406 error

      if (fetchError) throw fetchError;
      
      // If partnership data doesn't exist, throw an error
      if (!partnershipData) {
        throw new Error("Partnership not found");
      }

      // Check if there's a corresponding application
      const { data: applicationData, error: appError } = await supabase
        .from("project_applications")
        .select("id")
        .eq("project_id", partnershipData.project_id)
        .eq("user_id", partnershipData.partner_id)
        .maybeSingle();

      if (appError) throw appError;

      if (applicationData?.id) {
        // If there's an application, use the updateApplicationStatus function
        await updateApplicationStatus(applicationData.id, "rejected" as ApplicationStatus);
      } else {
        // If no application exists, just update the partnership status directly
        const { error } = await supabase
          .from("partnerships")
          .update({ status: "rejected" })
          .eq("id", partnershipId);

        if (error) {
          console.error("Error updating partnership:", error);
          throw error;
        }
      }

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

  // Mobile card view for partnerships
  const renderPartnershipCard = (partnership) => (
    <Card key={partnership.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{partnership.organizations?.name || 
              partnership.organization_name || 
              partnership.projects?.organization_name || 
              "Unknown Organization"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {partnership.projects?.title || "Unknown Project"}
            </p>
          </div>
          <Badge variant={
            partnership.status === 'pending' ? "secondary" :
            partnership.status === 'active' ? "default" :
            partnership.status === 'rejected' ? "destructive" : "outline"
          }>
            {partnership.status.charAt(0).toUpperCase() + partnership.status.slice(1)}
          </Badge>
        </div>

        <div className="text-sm space-y-1 mt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span>{partnership.partnership_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{format(new Date(partnership.created_at), "MMM d, yyyy")}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-0">
        <Button 
          variant="outline" 
          size="sm"
          className="flex-1"
          onClick={() => handleViewDetails(partnership.project_id)}
        >
          View Details
        </Button>
        
        {partnership.status === 'pending' && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-green-600"
              onClick={() => handleAcceptPartnership(partnership.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-red-600"
              onClick={() => handleRejectPartnership(partnership.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );

  // Desktop table view for partnerships
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

  // Render content based on device type and data
  const renderPartnerships = (partnershipsList) => {
    if (isLoadingPartnerships) {
      return (
        <div className="py-8">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }
    
    if (partnershipsList.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">No partnerships found</div>
      );
    }
    
    return isMobile
      ? partnershipsList.map(partnership => renderPartnershipCard(partnership))
      : renderPartnershipTable(partnershipsList);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Partners</h1>
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

      <div className="overflow-x-auto">
        <Tabs defaultValue="requested" className="mb-6">
          <TabsList className="w-full md:w-auto flex">
            <TabsTrigger value="requested" className="flex-1">Requested</TabsTrigger>
            <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
            <TabsTrigger value="past" className="flex-1">Completed</TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="requested" className="mt-4">
            {renderPartnerships(requestedPartnerships)}
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            {renderPartnerships(activePartnerships)}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {renderPartnerships(pastPartnerships)}
          </TabsContent>

          <TabsContent value="rejected" className="mt-4">
            {renderPartnerships(rejectedPartnerships)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
