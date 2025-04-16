
import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch partnerships data with organizations and projects details
  const { data: partnerships, isLoading: isLoadingPartnerships } = useQuery({
    queryKey: ["partnerships", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("partnerships")
        .select(`
          *,
          projects:project_id(id, title, status, organization_name, completed_at),
          organizations:organization_id(id, name, logo, industry, location)
        `)
        .eq("partner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching partnerships:", error);
        toast({
          title: "Error",
          description: "Failed to load partnerships data",
          variant: "destructive",
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

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
  const pastPartnerships = filteredPartnerships?.filter(p => p.status === 'completed') || [];

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
                {partnership.organizations?.name || partnership.projects?.organization_name || "Unknown Organization"}
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
                {partnership.status === 'completed' && (
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
          <TabsTrigger value="past">Past Partners</TabsTrigger>
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
      </Tabs>
    </Layout>
  );
}
