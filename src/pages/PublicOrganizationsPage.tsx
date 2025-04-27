import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { mapOrganizationsData } from "@/utils/data-mappers";

interface Filters {
  industry?: string;
  size?: string;
}

export default function PublicOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        
        const query = supabase
          .from("organizations")
          .select("*")
          .eq("status", "active");
          
        // Apply filters if provided
        if (filters.industry) {
          query.eq("industry", filters.industry);
        }
        
        if (filters.size) {
          query.eq("size", filters.size);
        }
        
        const { data, error } = await query.order("created_at", { ascending: false });
        
        if (error) throw error;
        
        setOrganizations(mapOrganizationsData(data || []));
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Organizations</h1>
      
      {/* Filters (example) */}
      <div className="mb-4">
        {/* Industry Filter */}
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
          Industry:
        </label>
        <select
          id="industry"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary-500 sm:text-sm"
          onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
        >
          <option value="">All Industries</option>
          <option value="technology">Technology</option>
          <option value="healthcare">Healthcare</option>
          {/* Add more options as needed */}
        </select>
        
        {/* Size Filter */}
        <label htmlFor="size" className="block mt-4 text-sm font-medium text-gray-700">
          Size:
        </label>
        <select
          id="size"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary-500 sm:text-sm"
          onChange={(e) => setFilters({ ...filters, size: e.target.value })}
        >
          <option value="">All Sizes</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          {/* Add more options as needed */}
        </select>
      </div>

      {loading ? (
        <p>Loading organizations...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {organizations.map((org) => (
            <div key={org.id} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold mb-2">{org.name}</h2>
              <p className="text-gray-600">{org.description}</p>
              {/* Add more organization details here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
