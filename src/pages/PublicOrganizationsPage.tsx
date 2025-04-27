
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { mapOrganizationsData } from "@/utils/data-mappers";
import { Layout } from "@/components/layout";
import { PartnerCard } from "@/components/partner-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Building } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

interface Filters {
  industry?: string;
  size?: string;
  search?: string;
}

export default function PublicOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from("organizations")
          .select("*")
          .eq("status", "active");
          
        // Apply filters if provided
        if (filters.industry) {
          query = query.eq("industry", filters.industry);
        }
        
        if (filters.size) {
          query = query.eq("size", filters.size);
        }
        
        if (filters.search) {
          query = query.ilike("name", `%${filters.search}%`);
        }
        
        const { data, error } = await query.order("created_at", { ascending: false });
        
        if (error) throw error;
        
        const mappedOrgs = mapOrganizationsData(data || []);
        setOrganizations(mappedOrgs);
        
        // Extract unique industry values for filter options
        if (data) {
          const industries = [...new Set(data.map(org => org.industry).filter(Boolean))];
          setIndustryOptions(industries);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast({
          title: "Error",
          description: "Failed to load organizations",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganizations();
  }, [filters, toast]);

  const handleSearch = () => {
    setFilters({...filters, search: searchQuery});
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const filteredOrganizations = organizations;

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Browse Organizations</h1>
            <p className="text-muted-foreground">
              Find and connect with organizations to collaborate on projects
            </p>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
          
          {showFilters && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Industry</label>
                    <Select 
                      value={filters.industry || ""} 
                      onValueChange={(value) => setFilters({...filters, industry: value || undefined})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Industries</SelectItem>
                        {industryOptions.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="nonprofit">Non-Profit</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Size</label>
                    <Select 
                      value={filters.size || ""} 
                      onValueChange={(value) => setFilters({...filters, size: value || undefined})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Sizes</SelectItem>
                        <SelectItem value="small">Small (1-50)</SelectItem>
                        <SelectItem value="medium">Medium (51-200)</SelectItem>
                        <SelectItem value="large">Large (201-1000)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="ghost" onClick={clearFilters} className="text-sm">
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.industry && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Industry: {filters.industry}
                </Badge>
              )}
              {filters.size && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Size: {filters.size}
                </Badge>
              )}
              {filters.search && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: {filters.search}
                </Badge>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[250px] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredOrganizations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => (
              <PartnerCard key={org.id} organization={org} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building}
            title="No organizations found"
            description="Try adjusting your filters or search query"
          />
        )}
      </div>
    </Layout>
  );
}
