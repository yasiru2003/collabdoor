import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { Organization } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapOrganizationsData } from "@/utils/data-mappers";

export default function OrganizationsPage() {
  const [ownedOrganizations, setOwnedOrganizations] = useState<Organization[]>([]);
  const [memberOrganizations, setMemberOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserOrganizations = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch organizations where user is a member
        const { data: membershipData, error: membershipError } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id);
          
        if (membershipError) throw membershipError;
        
        const orgIds = membershipData?.map(m => m.organization_id) || [];
        
        if (orgIds.length > 0) {
          const { data: orgsData, error: orgsError } = await supabase
            .from("organizations")
            .select("*")
            .in("id", orgIds);
            
          if (orgsError) throw orgsError;
          setMemberOrganizations(mapOrganizationsData(orgsData || []));
        }
        
        // Fetch organizations owned by user
        const { data: ownedData, error: ownedError } = await supabase
          .from("organizations")
          .select("*")
          .eq("owner_id", user.id);
          
        if (ownedError) throw ownedError;
        setOwnedOrganizations(mapOrganizationsData(ownedData || []));
        
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
    
    fetchUserOrganizations();
  }, [user, toast]);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">My Organizations</h1>
        
        {loading ? (
          <p>Loading organizations...</p>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Owned Organizations</h2>
              {ownedOrganizations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedOrganizations.map((org) => (
                    <Card key={org.id} className="h-full flex flex-col">
                      <CardHeader>
                        <CardTitle>{org.name}</CardTitle>
                        <CardDescription>{org.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p>Industry: {org.industry}</p>
                        <p>Size: {org.size}</p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild>
                          <Link to={`/organizations/${org.id}`}>View Details</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>You don't own any organizations yet.</p>
              )}
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Member Organizations</h2>
              {memberOrganizations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {memberOrganizations.map((org) => (
                    <Card key={org.id} className="h-full flex flex-col">
                      <CardHeader>
                        <CardTitle>{org.name}</CardTitle>
                        <CardDescription>{org.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p>Industry: {org.industry}</p>
                        <p>Size: {org.size}</p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild>
                          <Link to={`/organizations/${org.id}`}>View Details</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>You are not a member of any organizations yet.</p>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
