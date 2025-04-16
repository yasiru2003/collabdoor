
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "@/components/ui/sonner";

/**
 * Error handling utility for Supabase queries
 */
export const handleSupabaseError = (error: any, errorTitle: string, toast: ReturnType<typeof useToast>["toast"]) => {
  if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned" error
    toast({
      title: errorTitle,
      description: error.message,
      variant: "destructive",
    });
    console.error(`${errorTitle}:`, error);
    throw error;
  }
  return error;
};
