
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { UserProfile } from "@/components/profile/UserProfile";
import NotFound from "@/pages/NotFound";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function UserProfilePage() {
  const { userId } = useParams();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        // Get basic profile data without trying to join with reviews
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        if (!data) {
          console.error("No profile found for user:", userId);
          return null;
        }
        
        return data;
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: !!userId,
    retry: 1
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6 px-4">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error("Query error:", error);
    return (
      <Layout>
        <div className="container mx-auto py-6 px-4">
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Profile</h2>
            <p className="text-red-700">There was a problem loading this profile. Please try again later.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return <NotFound />;
  }

  return (
    <Layout>
      <UserProfile profile={profile} />
    </Layout>
  );
}
