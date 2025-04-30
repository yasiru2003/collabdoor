
import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useUserOrganizations } from "@/hooks/use-user-organizations";
import { useToast } from "@/hooks/use-toast";
import { useFeedPosts } from "@/hooks/use-feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, User, Building, Users
} from "lucide-react";
import { FeedPost } from "@/components/feed/FeedPost";
import { CreatePostForm } from "@/components/feed/CreatePostForm";

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  
  // Use our custom hooks
  const { data: userOrganizations, isLoading: orgsLoading } = useUserOrganizations();
  const { data: posts, isLoading: postsLoading, error: postsError } = useFeedPosts(activeTab as "all" | "following");

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
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
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
                      <User className="h-3 w-3 inline mr-1" />
                      {user?.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Building className="h-4 w-4 mr-2" /> 
                    My Organizations
                  </h3>
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
          <div className="md:col-span-2">
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
                  <p>Loading posts...</p>
                ) : postsError ? (
                  <p className="text-red-500">Error loading posts</p>
                ) : posts && posts.length > 0 ? (
                  posts.map((post) => (
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
                  <p>Loading posts...</p>
                ) : postsError ? (
                  <p className="text-red-500">Error loading posts</p>
                ) : posts && posts.length > 0 ? (
                  posts.map((post) => (
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
