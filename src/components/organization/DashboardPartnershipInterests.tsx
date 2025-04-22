
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { PartnershipInterestsTab } from "./PartnershipInterestsTab";

export function DashboardPartnershipInterests() {
  const { user } = useAuth();
  const [selectedOrg, setSelectedOrg] = useState<string>("");

  // Fetch user's organizations (where they are owner)
  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['user-owned-organizations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .order('name');
        
      if (error) {
        console.error('Error fetching organizations:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  if (orgsLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {organizations && organizations.length > 0 ? (
        <>
          <div className="w-full sm:w-[300px]">
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOrg && (
            <PartnershipInterestsTab 
              organizationId={selectedOrg}
              isOwner={true}
              isMember={true}
            />
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Organizations Found</CardTitle>
            <CardDescription>
              You don't have any organizations yet. Create one to manage partnership interests.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
