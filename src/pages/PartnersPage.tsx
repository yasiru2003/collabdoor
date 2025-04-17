
import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Check, X } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useUserApplications } from "@/hooks/use-supabase-query";
import { useProjectApplications } from "@/hooks/use-project-applications";
import { usePartnerships } from "@/hooks/use-organizations-query";

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Get applications and partnerships for the current user
  const { data: userApplications, isLoading: isLoadingApplications } = useUserApplications(user?.id);
  const { data: partnerships, isLoading: isLoadingPartnerships } = usePartnerships(user?.id);
  const { updateApplicationStatus } = useProjectApplications();
  
  const isLoading = isLoadingApplications || isLoadingPartnerships;

  // Filter applications and partnerships based on search query
  const filteredApplications = userApplications?.filter(application => {
    if (!searchQuery) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    const projectTitle = application.projects?.title?.toLowerCase() || "";
    const orgName = application.projects?.organization_name?.toLowerCase() || "";
    
    return projectTitle.includes(searchTerm) || orgName.includes(searchTerm);
  });

  const filteredPartnerships = partnerships?.filter(partnership => {
    if (!searchQuery) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    const projectTitle = partnership.projects?.title?.toLowerCase() || "";
    const orgName = partnership.organizations?.name?.toLowerCase() || "";
    
    return projectTitle.includes(searchTerm) || orgName.includes(searchTerm);
  });

  // Find pending applications
  const pendingApplications = filteredApplications?.filter(app => app.status === 'pending') || [];
  
  // Find approved applications and active partnerships 
  const activePartnerships = filteredPartnerships?.filter(p => p.status === 'active') || [];
  
  // Find completed partnerships
  const completedPartnerships = filteredPartnerships?.filter(p => 
    p.status === 'completed' || (p.projects?.status === 'completed')
  ) || [];

  // Find rejected applications/partnerships
  const rejectedApplications = filteredApplications?.filter(app => app.status === 'rejected') || [];
  const rejectedPartnerships = filteredPartnerships?.filter(p => p.status === 'rejected') || [];
  const allRejected = [...rejectedApplications, ...rejectedPartnerships];

  // Handle acceptance of an application
  const handleAcceptApplication = async (applicationId) => {
    try {
      await updateApplicationStatus(applicationId, "approved");
      
      toast({
        title: "Application accepted",
        description: "The partnership has been activated successfully.",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error accepting application:", error);
      toast({
        title: "Error accepting application",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle rejection of an application
  const handleRejectApplication = async (applicationId) => {
    try {
      await updateApplicationStatus(applicationId, "rejected");
      
      toast({
        title: "Application rejected",
        description: "The application has been rejected.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast({
        title: "Error rejecting application",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // View project details
  const handleViewDetails = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Mobile card view for applications
  const renderApplicationCard = (application) => (
    <Card key={application.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{application.projects?.organization_name || "Unknown Organization"}</h3>
            <p className="text-sm text-muted-foreground">
              {application.projects?.title || "Unknown Project"}
            </p>
          </div>
          <Badge variant={
            application.status === 'pending' ? "secondary" :
            application.status === 'approved' ? "default" :
            application.status === 'rejected' ? "destructive" : "outline"
          }>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>

        <div className="text-sm space-y-1 mt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span>{application.partnership_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{format(new Date(application.created_at), "MMM d, yyyy")}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-0">
        <Button 
          variant="outline" 
          size="sm"
          className="flex-1"
          onClick={() => handleViewDetails(application.project_id)}
        >
          View Details
        </Button>
        
        {application.status === 'pending' && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-green-600"
              onClick={() => handleAcceptApplication(application.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-red-600"
              onClick={() => handleRejectApplication(application.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );

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
      </CardFooter>
    </Card>
  );

  // Desktop table view for applications
  const renderApplicationsTable = (applications) => (
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
        {applications.length > 0 ? (
          applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell className="font-medium">
                {application.projects?.organization_name || "Unknown Organization"}
              </TableCell>
              <TableCell>{application.projects?.title || "Unknown Project"}</TableCell>
              <TableCell>
                <Badge variant="outline">{application.partnership_type}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={
                  application.status === 'pending' ? "secondary" :
                  application.status === 'approved' ? "default" :
                  "destructive"
                }>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(application.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(application.project_id)}
                >
                  View Details
                </Button>
                
                {application.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600"
                      onClick={() => handleAcceptApplication(application.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleRejectApplication(application.id)}
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
            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No applications found</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  // Desktop table view for partnerships
  const renderPartnershipsTable = (partnershipsList) => (
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
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(partnership.project_id)}
                >
                  View Details
                </Button>
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
  const renderContent = (items, itemType) => {
    if (isLoading) {
      return (
        <div className="py-8">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }
    
    if (items.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          {itemType === 'applications' ? 'No applications found' : 'No partnerships found'}
        </div>
      );
    }
    
    if (isMobile) {
      return itemType === 'applications' 
        ? items.map(app => renderApplicationCard(app))
        : items.map(partnership => renderPartnershipCard(partnership));
    } else {
      return itemType === 'applications'
        ? renderApplicationsTable(items)
        : renderPartnershipsTable(items);
    }
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
        <Tabs defaultValue="requests" className="mb-6">
          <TabsList className="w-full md:w-auto flex">
            <TabsTrigger value="requests" className="flex-1">Requested</TabsTrigger>
            <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4">
            {renderContent(pendingApplications, 'applications')}
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            {renderContent(activePartnerships, 'partnerships')}
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {renderContent(completedPartnerships, 'partnerships')}
          </TabsContent>

          <TabsContent value="rejected" className="mt-4">
            {renderContent(allRejected, 'applications')}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
