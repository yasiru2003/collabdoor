
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Organization, PartnershipType } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { PartnerCard } from "@/components/partner-card";
import { mapSupabaseOrgToOrganization } from "@/utils/data-mappers";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Partnership type mapping for display
const partnershipTypeLabels: Record<PartnershipType, string> = {
  'monetary': 'Financial Support',
  'knowledge': 'Knowledge Sharing',
  'skilled': 'Skilled Professionals',
  'volunteering': 'Volunteering'
};

export default function PublicOrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [partnershipFilter, setPartnershipFilter] = useState<string>("all");
  const { user } = useAuth();
  
  // Fetch organizations with their partnership interests
  const { data, isLoading } = useQuery({
    queryKey: ["public-organizations-with-interests"],
    queryFn: async () => {
      // First get all organizations
      const { data: organizations, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .order("name");
      
      if (orgError) throw orgError;

      // Map organizations to the expected type
      const orgs = (organizations || []).map(org => mapSupabaseOrgToOrganization(org));
      
      // Then get all partnership interests
      const { data: interests, error: interestsError } = await supabase
        .from("organization_partnership_interests")
        .select("organization_id, partnership_type");
      
      if (interestsError) throw interestsError;
      
      // Combine the data
      const orgsWithInterests = orgs.map(org => {
        const orgInterests = interests
          ? interests.filter(int => int.organization_id === org.id)
                    .map(int => int.partnership_type as PartnershipType)
          : [];
        
        return {
          ...org,
          partnershipInterests: [...new Set(orgInterests)] // Remove duplicates
        };
      });
      
      return orgsWithInterests;
    },
  });

  // Filter organizations based on search query and partnership filter
  const filteredOrganizations = data?.filter(org => {
    // Search filter
    const matchesSearch = !searchQuery ||
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Partnership type filter
    const matchesPartnership = partnershipFilter === "all" || 
      (org.partnershipInterests && org.partnershipInterests.includes(partnershipFilter as PartnershipType));
    
    return matchesSearch && matchesPartnership;
  });

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Partner Organizations</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Discover organizations making an impact.
            </p>
          </div>
          {!user && (
            <Button asChild className="w-full sm:w-auto">
              <Link to="/login">Sign in to Connect</Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search organizations..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-[200px]">
            <Select value={partnershipFilter} onValueChange={setPartnershipFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by partnership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Partnerships</SelectItem>
                <SelectItem value="monetary">Financial Support</SelectItem>
                <SelectItem value="knowledge">Knowledge Sharing</SelectItem>
                <SelectItem value="skilled">Skilled Professionals</SelectItem>
                <SelectItem value="volunteering">Volunteering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {partnershipFilter !== "all" && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="mr-2">
            Showing: {partnershipTypeLabels[partnershipFilter as PartnershipType]}
            <button 
              className="ml-2 hover:text-destructive" 
              onClick={() => setPartnershipFilter("all")}
            >
              ✕
            </button>
          </Badge>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[200px] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredOrganizations && filteredOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredOrganizations.map((org) => (
            <PartnerCard 
              key={org.id} 
              organization={org} 
              partnershipInterests={org.partnershipInterests}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 md:py-12">
          <h2 className="text-xl md:text-2xl font-bold mb-2">No Organizations Found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}
