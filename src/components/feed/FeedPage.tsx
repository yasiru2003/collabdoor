
import React, { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, MessageSquare, Loader2 
} from "lucide-react";
import { FeedPost } from "@/components/feed/FeedPost";
import { CreatePostForm } from "@/components/feed/CreatePostForm";
import { FeedPost as FeedPostType } from "./types";

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  // Query to fetch all posts
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError
  } = useQuery({
    queryKey: ["feed-posts", activeTab],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        let query = supabase
          .from("feed_posts")
          .select(`
            *,
            organizations(name, logo),
            feed_likes(id, user_id),
            feed_comments(id, content, created_at, user_id)
          `)
          .order("created_at", { ascending: false });
        
        // Add filtering for "My Organizations" tab
        if (activeTab === "following") {
          // Fetch user's organization memberships
          const { data: memberships, error: membershipError } = await supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", user.id);
          
          if (membershipError) {
            console.error("Error fetching memberships:", membershipError);
            return [];
          }
          
          if (memberships && memberships.length > 0) {
            const orgIds = memberships.map(m => m.organization_id);
            query = query.in("organization_id", orgIds);
          } else {
            // User is not a member of any organizations
            return [];
          }
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching posts:", error);
          throw error;
        }
        
        // Separately fetch user profiles for post authors and commenters
        if (data && data.length > 0) {
          // Get all user IDs from posts
          const userIds = new Set(data.map(post => post.user_id));
          
          // Get all commenter IDs
          data.forEach(post => {
            if (post.feed_comments) {
              post.feed_comments.forEach(comment => {
                userIds.add(comment.user_id);
              });
            }
          });
          
          // Fetch profiles for all users
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name, profile_image")
            .in("id", Array.from(userIds));
          
          if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
          } else if (profiles) {
            // Create a map of profiles by ID for quick lookup
            const profilesMap = profiles.reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
            
            // Attach profiles to posts and comments
            data.forEach(post => {
              post.profiles = profilesMap[post.user_id];
              
              if (post.feed_comments) {
                post.feed_comments.forEach(comment => {
                  comment.profiles = profilesMap[comment.user_id];
                });
              }
            });
          }
          
          // Fetch tagged organizations if any
          const postsWithTags = data.filter(post => post.tagged_organizations && post.tagged_organizations.length > 0);
          
          if (postsWithTags.length > 0) {
            // Get all unique organization IDs from tagged_organizations
            const orgIds = new Set<string>();
            postsWithTags.forEach(post => {
              if (post.tagged_organizations) {
                post.tagged_organizations.forEach(orgId => orgIds.add(orgId));
              }
            });
            
            // Fetch organization details
            const { data: taggedOrgs, error: taggedOrgsError } = await supabase
              .from("organizations")
              .select("id, name, logo")
              .in("id", Array.from(orgIds));
              
            if (taggedOrgsError) {
              console.error("Error fetching tagged organizations:", taggedOrgsError);
            } else if (taggedOrgs) {
              // Create a map of organizations by ID
              const orgsMap = taggedOrgs.reduce((acc, org) => {
                acc[org.id] = org;
                return acc;
              }, {});
              
              // Attach tagged organizations details to posts
              postsWithTags.forEach(post => {
                if (post.tagged_organizations) {
                  post.taggedOrganizationsDetails = post.tagged_organizations
                    .map(orgId => orgsMap[orgId])
                    .filter(Boolean);
                }
              });
            }
          }
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!user,
  });

  // Query to fetch user's organizations
  const {
    data: userOrganizations,
    isLoading: orgsLoading
  } = useQuery({
    queryKey: ["user-organizations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Get organizations where user is a member
        const { data: memberships, error: membershipError } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id);
        
        if (membershipError) {
          console.error("Error fetching memberships:", membershipError);
          throw membershipError;
        }
        
        if (memberships && memberships.length > 0) {
          const orgIds = memberships.map(m => m.organization_id);
          
          const { data: organizations, error: orgsError } = await supabase
            .from("organizations")
            .select("id, name, logo")
            .in("id", orgIds);
          
          if (orgsError) {
            console.error("Error fetching organizations:", orgsError);
            throw orgsError;
          }
          return organizations || [];
        }
        
        return [];
      } catch (error) {
        console.error("Error fetching user organizations:", error);
        toast({
          title: "Error",
          description: "Failed to load your organizations. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar - hidden on mobile, shown on tablet and above */}
          <div className="hidden md:block md:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={user?.user_metadata?.profile_image || ""} />
                    <AvatarFallback>
                      {user?.email?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">{user?.user_metadata?.name || user?.email}</h2>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <h3 className="font-medium mb-2">My Organizations</h3>
                  {orgsLoading ? (
                    <p className="text-sm">Loading organizations...</p>
                  ) : userOrganizations && userOrganizations.length > 0 ? (
                    <div className="space-y-2">
                      {userOrganizations.map((org) => (
                        <div key={org.id} className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={org.logo || ""} />
                            <AvatarFallback>
                              {org.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{org.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      You're not a member of any organizations yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="col-span-1 md:col-span-2">
            <CreatePostForm userOrganizations={userOrganizations || []} />
            
            <Tabs 
              defaultValue="all" 
              className="mt-6"
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="following">My Organizations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : postsError ? (
                  <p className="text-red-500">Error loading posts</p>
                ) : posts && posts.length > 0 ? (
                  posts.map((post: FeedPostType) => (
                    <FeedPost key={post.id} post={post} currentUser={user} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Be the first to share something with the community!
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="following" className="space-y-4">
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : postsError ? (
                  <p className="text-red-500">Error loading posts</p>
                ) : posts && posts.length > 0 ? (
                  posts.map((post: FeedPostType) => (
                    <FeedPost key={post.id} post={post} currentUser={user} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No posts from your organizations</h3>
                    <p className="text-muted-foreground mb-6">
                      Join more organizations or encourage your organizations to post more!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
