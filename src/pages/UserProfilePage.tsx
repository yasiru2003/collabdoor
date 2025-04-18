
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { UserProfile } from "@/components/profile/UserProfile";
import { NotFound } from "@/pages/NotFound";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfilePage() {
  const { userId } = useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          reviews(count)
        `)
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId
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

  if (!profile) {
    return <NotFound />;
  }

  return (
    <Layout>
      <UserProfile profile={profile} />
    </Layout>
  );
}
