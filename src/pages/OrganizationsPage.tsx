
import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Building, Filter, Plus, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";

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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
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
  
  // Extract unique industries and locations for filters
  const industries = useMemo(() => {
    if (!allOrganizations) return [];
    return [...new Set(allOrganizations.map(org => org.industry).filter(Boolean))];
  }, [allOrganizations]);
  
  const locations = useMemo(() => {
    if (!allOrganizations) return [];
    return [...new Set(allOrganizations.map(org => org.location).filter(Boolean))];
  }, [allOrganizations]);
  
  // Apply filters to organizations
  const filteredOrganizations = useMemo(() => {
    if (!allOrganizations) return [];
    
    return allOrganizations.filter(org => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (org.description && org.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (org.industry && org.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (org.location && org.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Industry filter
      const matchesIndustry = industryFilter === "all" || org.industry === industryFilter;
      
      // Location filter
      const matchesLocation = locationFilter === "all" || org.location === locationFilter;
      
      return matchesSearch && matchesIndustry && matchesLocation;
    });
  }, [allOrganizations, searchTerm, industryFilter, locationFilter]);
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setIndustryFilter("all");
    setLocationFilter("all");
  };
  
  const activeFiltersCount = [
    industryFilter !== "all" ? 1 : 0, 
    locationFilter !== "all" ? 1 : 0
  ].reduce((a, b) => a + b, 0);
  
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
  }, [user, loading, navigate, toast]);
  
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
            <Button onClick={() => navigate("/organizations/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Organization
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Organizations</h4>
                <Separator />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-organizations">My Organizations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover">
            {loadingAll ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[200px] bg-muted animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : filteredOrganizations && filteredOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrganizations.map((org) => (
                  <OrganizationCard key={org.id} organization={org} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building}
                title="No Organizations Found"
                description={
                  searchTerm || industryFilter !== "all" || locationFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "There are no organizations in the system yet"
                }
              />
            )}
          </TabsContent>
          
          <TabsContent value="my-organizations">
            {loadingMine ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-[200px] bg-muted animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : myOrganizations && myOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myOrganizations.map((org) => (
                  <OrganizationCard key={org.id} organization={org} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building}
                title="No Organizations Created Yet"
                description={
                  <div className="space-y-4">
                    <p>Create your first organization to start collaborating with others on projects</p>
                    <Button onClick={() => navigate("/organizations/new")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Organization
                    </Button>
                  </div>
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
