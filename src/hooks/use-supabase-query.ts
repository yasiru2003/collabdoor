import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "@/components/ui/sonner";
import { useToast } from "@/hooks/use-toast";
import { mapSupabaseProjectToProject, mapSupabaseOrgToOrganization } from "@/utils/data-mappers";

export function useProjects() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles(name)")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching projects",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return (data || []).map(project => {
        const mappedProject = mapSupabaseProjectToProject(project);
        mappedProject.organizerName = project.profiles?.name || "Unknown";
        return mappedProject;
      });
    },
  });
}

export function useProject(id: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles(name)")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code !== "PGRST116") { // PGRST116 is "no rows returned" error
          toast({
            title: "Error fetching project",
            description: error.message,
            variant: "destructive",
          });
        }
        throw error;
      }

      const mappedProject = mapSupabaseProjectToProject(data);
      mappedProject.organizerName = data.profiles?.name || "Unknown";
      return mappedProject;
    },
    enabled: !!id,
  });
}

export function usePartners() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        toast({
          title: "Error fetching partners",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return (data || []).map(org => mapSupabaseOrgToOrganization(org));
    },
  });
}

export function useUserProjects(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["userProjects", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles(name)")
        .eq("organizer_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching user projects",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return (data || []).map(project => {
        const mappedProject = mapSupabaseProjectToProject(project);
        mappedProject.organizerName = project.profiles?.name || "Unknown";
        return mappedProject;
      });
    },
    enabled: !!userId,
  });
}

export function usePartnerships(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["partnerships", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("partnerships")
        .select(`
          *,
          project:projects(*),
          organization:organizations(*)
        `)
        .eq("partner_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching partnerships",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
  });
}

export function useSavedProjects(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["savedProjects", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("saved_projects")
        .select(`
          *,
          projects(*, profiles(name))
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching saved projects",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return (data || []).map(savedProject => {
        if (!savedProject.projects) return null;
        const mappedProject = mapSupabaseProjectToProject(savedProject.projects);
        mappedProject.organizerName = savedProject.projects.profiles?.name || "Unknown";
        return mappedProject;
      }).filter(Boolean);
    },
    enabled: !!userId,
  });
}

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

          return {
            id: participantId, // Using the participant ID as conversation ID
            participantId: participantId,
            participantName: profile?.name || "Unknown User",
            participantImage: profile?.profile_image,
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

      if (error) {
        toast({
          title: "Error fetching conversation",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

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

export function useProjectApplications(projectId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["projectApplications", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      // Fix the query to correctly join with profiles
      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          profiles:profiles(name, email, profile_image)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching project applications:", error);
        toast({
          title: "Error fetching project applications",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!projectId,
  });
}

export function useUserApplications(userId: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["userApplications", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          projects(*, profiles(name))
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user applications:", error);
        toast({
          title: "Error fetching user applications",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Map the projects data in each application
      return (data || []).map(application => {
        if (application.projects) {
          const projectData = {
            ...application.projects,
            profiles: application.projects.profiles
          };
          const mappedProject = mapSupabaseProjectToProject(projectData);
          mappedProject.organizerName = application.projects.profiles?.name || "Unknown";
          application.projects = mappedProject;
        }
        return application;
      });
    },
    enabled: !!userId,
  });
}
