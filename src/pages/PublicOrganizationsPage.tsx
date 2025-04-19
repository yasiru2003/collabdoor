
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Organization } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { PartnerCard } from "@/components/partner-card";

export default function PublicOrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: organizations, isLoading } = useQuery({
    queryKey: ["public-organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Organization[];
    },
  });

  const filteredOrganizations = organizations?.filter(org =>
    !searchQuery ||
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Partner Organizations</h1>
          <p className="text-muted-foreground">
            Discover organizations making an impact.
          </p>
        </div>
        {!user && (
          <Button asChild>
            <Link to="/login">Sign in to Connect</Link>
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search organizations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[200px] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredOrganizations && filteredOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <PartnerCard key={org.id} organization={org} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">No Organizations Found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}
