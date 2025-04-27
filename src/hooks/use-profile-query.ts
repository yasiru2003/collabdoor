
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  return { profile, isLoading, error };
}
