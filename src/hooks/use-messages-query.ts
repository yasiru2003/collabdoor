
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { handleSupabaseError } from "./use-supabase-utils";

/**
 * Hook to fetch all messages for a user
 */
export function useMessages(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      if (!userId) return [];

      // First get all conversations (unique sender/recipient pairs)
      const { data: sent, error: sentError } = await supabase
        .from("messages")
        .select("recipient_id, created_at")
        .eq("sender_id", userId)
        .order("created_at", { ascending: false });

      const { data: received, error: receivedError } = await supabase
        .from("messages")
        .select("sender_id, created_at")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false });

      if (sentError || receivedError) {
        toast({
          title: "Error fetching messages",
          description: sentError?.message || receivedError?.message,
          variant: "destructive",
        });
        throw sentError || receivedError;
      }

      // Create a set of unique conversation participants
      const participantIds = new Set<string>();
      sent?.forEach(msg => participantIds.add(msg.recipient_id));
      received?.forEach(msg => participantIds.add(msg.sender_id));

      // Get the latest message for each conversation
      const conversations = await Promise.all(
        Array.from(participantIds).map(async (participantId) => {
          // Get the latest message between these two users
          const { data: latestMessage, error: latestMessageError } = await supabase
            .from("messages")
            .select("*")
            .or(`and(sender_id.eq.${userId},recipient_id.eq.${participantId}),and(sender_id.eq.${participantId},recipient_id.eq.${userId})`)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (latestMessageError && latestMessageError.code !== "PGRST116") {
            console.error("Error fetching latest message:", latestMessageError);
            return null;
          }

          // Get unread count for this conversation
          const { count, error: countError } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", userId)
            .eq("sender_id", participantId)
            .eq("read", false);

          if (countError) {
            console.error("Error fetching unread count:", countError);
            return null;
          }

          // Get participant profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", participantId)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return null;
          }

          // Enhanced with organization info if available
          let organizationName = null;
          if (profile?.organization_id) {
            const { data: organization, error: orgError } = await supabase
              .from("organizations")
              .select("name")
              .eq("id", profile.organization_id)
              .single();
              
            if (!orgError && organization) {
              organizationName = organization.name;
            }
          }

          return {
            id: participantId, // Using the participant ID as conversation ID
            participantId: participantId,
            participantName: profile?.name || "Unknown User",
            participantImage: profile?.profile_image,
            organizationName: organizationName,
            lastMessage: latestMessage?.content || "",
            lastMessageTime: latestMessage?.created_at || "",
            unreadCount: count || 0
          };
        })
      );

      return conversations.filter(Boolean);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch a conversation between two users
 */
export function useConversation(userId: string | undefined, participantId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["conversation", userId, participantId],
    queryFn: async () => {
      if (!userId || !participantId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${participantId}),and(sender_id.eq.${participantId},recipient_id.eq.${userId})`)
        .order("created_at", { ascending: true });

      handleSupabaseError(error, "Error fetching conversation", toast);

      // Mark messages as read
      if (data && data.length > 0) {
        const unreadMessages = data.filter(msg => msg.recipient_id === userId && !msg.read);
        
        if (unreadMessages.length > 0) {
          // Update unread messages to read
          await supabase
            .from("messages")
            .update({ read: true })
            .in("id", unreadMessages.map(msg => msg.id));
        }
      }

      return data || [];
    },
    enabled: !!userId && !!participantId,
  });
}
