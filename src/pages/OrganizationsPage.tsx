
import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Building, Filter, Plus, Search, UsersRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types";

function OrganizationCard({ organization }: { organization: Organization }) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg">
            {organization.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold">{organization.name}</h3>
            {organization.location && <p className="text-sm text-muted-foreground">{organization.location}</p>}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {organization.description || "No description provided."}
        </p>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <span className="text-sm">{organization.industry || "Other"}</span>
          <Button size="sm" onClick={() => navigate(`/organizations/${organization.id}`)}>
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrganizationsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all organizations
  const { data: allOrganizations, isLoading: loadingAll } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("name", { ascending: true });
        
      if (error) throw error;
      return data as Organization[];
    }
  });
  
  // Fetch user's organizations (where they are the owner)
  const { data: myOrganizations, isLoading: loadingMine } = useQuery({
    queryKey: ["my-organizations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as Organization[];
    },
    enabled: !!user
  });
  
  // Filter organizations based on search term
  const filteredOrganizations = React.useMemo(() => {
    if (!searchTerm.trim() || !allOrganizations) return allOrganizations;
    
    const term = searchTerm.toLowerCase();
    return allOrganizations.filter(org => 
      org.name.toLowerCase().includes(term) || 
      (org.description && org.description.toLowerCase().includes(term)) ||
      (org.industry && org.industry.toLowerCase().includes(term)) ||
      (org.location && org.location.toLowerCase().includes(term))
    );
  }, [allOrganizations, searchTerm]);
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please login to view organizations",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/organizations" } });
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Organizations</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                className="pl-8 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/organizations/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Organization
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-organizations">My Organizations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover">
            {loadingAll ? (
              <div className="text-center py-12">Loading organizations...</div>
            ) : filteredOrganizations && filteredOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrganizations.map((org) => (
                  <OrganizationCard key={org.id} organization={org} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Organizations Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {searchTerm 
                    ? "No organizations match your search criteria" 
                    : "There are no organizations in the system yet"}
                </p>
                <Button onClick={() => navigate("/organizations/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-organizations">
            {loadingMine ? (
              <div className="text-center py-12">Loading your organizations...</div>
            ) : myOrganizations && myOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myOrganizations.map((org) => (
                  <OrganizationCard key={org.id} organization={org} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Organizations Created Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Create your first organization to start collaborating with others on projects
                </p>
                <Button onClick={() => navigate("/organizations/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
