
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Type definitions for feed items
export interface FeedPost {
  id: string;
  content: string;
  user_id: string;
  organization_id?: string;
  location?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  tagged_organizations?: string[];
  profiles?: {
    name: string;
    profile_image?: string;
  };
  organizations?: {
    name: string;
    logo?: string;
  };
  feed_likes?: FeedLike[];
  feed_comments?: FeedComment[];
}

export interface FeedLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface FeedComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    profile_image?: string;
  };
}

// Hook for fetching posts
export function useFeedPosts(filter: "all" | "following" = "all") {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["feed-posts", filter],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        let query = supabase
          .from("feed_posts")
          .select(`
            *,
            profiles(name, profile_image),
            organizations(name, logo),
            feed_likes(id, user_id),
            feed_comments(id, content, created_at, user_id, profiles(name, profile_image))
          `)
          .order("created_at", { ascending: false });
        
        if (filter === "following") {
          // Get organizations the user is a member of
          const { data: memberships } = await supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", user.id);
          
          if (memberships && memberships.length > 0) {
            const orgIds = memberships.map(m => m.organization_id);
            query = query.in("organization_id", orgIds);
          } else {
            return []; // User doesn't follow any organizations
          }
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data as unknown as FeedPost[];
      } catch (error: any) {
        console.error("Error fetching feed posts:", error);
        toast({
          title: "Error fetching posts",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!user
  });
}

// Hook for creating posts
export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (postData: { 
      content: string; 
      organization_id?: string | null;
      location?: string | null;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      const newPost = {
        user_id: user.id,
        content: postData.content.trim(),
        organization_id: postData.organization_id || null,
        location: postData.location?.trim() || null
      };
      
      const { data, error } = await supabase
        .from("feed_posts")
        .insert(newPost)
        .select();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been shared successfully!",
      });
      
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
      console.error("Post creation error:", error);
    }
  });
}

// Hook for liking/unliking posts
export function useToggleLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      postId, 
      likeId 
    }: { 
      postId: string; 
      likeId?: string 
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      if (likeId) {
        // Unlike the post
        const { error } = await supabase
          .from("feed_likes")
          .delete()
          .eq("id", likeId);
          
        if (error) throw error;
      } else {
        // Like the post
        const { error } = await supabase
          .from("feed_likes")
          .insert({
            post_id: postId,
            user_id: user.id
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to process like action",
        variant: "destructive",
      });
      console.error("Like error:", error);
    }
  });
}

// Hook for adding comments
export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      postId, 
      content 
    }: { 
      postId: string; 
      content: string 
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      if (!content.trim()) throw new Error("Comment cannot be empty");
      
      const { error } = await supabase
        .from("feed_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      console.error("Comment error:", error);
    }
  });
}
