
import { Layout } from "@/components/layout";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Building, Users, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardPage() {
  const { showOnboarding, setShowOnboarding } = useOnboarding();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Fetch user's projects
  const { data: userProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ["dashboard-projects", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
  
  // Fetch user's organizations
  const { data: userOrgs, isLoading: orgsLoading } = useQuery({
    queryKey: ["dashboard-orgs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: memberships, error: membershipError } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id);
      
      if (membershipError) throw membershipError;
      
      if (memberships && memberships.length > 0) {
        const orgIds = memberships.map(m => m.organization_id);
        
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .in("id", orgIds)
          .limit(5);
        
        if (error) throw error;
        return data || [];
      }
      
      return [];
    },
    enabled: !!user,
  });
  
  // Fetch recent notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["dashboard-notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
  
  const welcomeMessage = user?.user_metadata?.name 
    ? `Welcome back, ${user.user_metadata.name}!` 
    : "Welcome to your dashboard!";
  
  return (
    <Layout>
      <div className="container mx-auto py-4 md:py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">{welcomeMessage}</h1>
            <p className="text-muted-foreground">
              This is your personal dashboard where you can manage your projects, organizations, and activities.
            </p>
          </div>
        
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban size={18} />
                      Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {projectsLoading ? "..." : userProjects?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Active projects</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/projects")}>
                      View All Projects
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Building size={18} />
                      Organizations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {orgsLoading ? "..." : userOrgs?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Member organizations</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/organizations")}>
                      View All Organizations
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Bell size={18} />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {notificationsLoading ? "..." : notifications?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Recent notifications</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/messages")}>
                      View All Notifications
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>Your most recent projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {projectsLoading ? (
                      <p>Loading projects...</p>
                    ) : userProjects && userProjects.length > 0 ? (
                      <div className="space-y-4">
                        {userProjects.slice(0, 3).map((project) => (
                          <div 
                            key={project.id} 
                            className="flex justify-between items-center p-3 border rounded-md hover:bg-accent cursor-pointer"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            <div>
                              <h3 className="font-medium">{project.title}</h3>
                              <p className="text-sm text-muted-foreground">{project.description?.substring(0, 50)}...</p>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">You don't have any projects yet</p>
                        <Button onClick={() => navigate("/projects/new")}>Create Your First Project</Button>
                      </div>
                    )}
                  </CardContent>
                  {userProjects && userProjects.length > 0 && (
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => navigate("/projects")}>
                        View All Projects
                      </Button>
                    </CardFooter>
                  )}
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks you might want to do</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/projects/new")}>
                      <FolderKanban className="mr-2 h-4 w-4" />
                      Create New Project
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/organizations/new")}>
                      <Building className="mr-2 h-4 w-4" />
                      Create New Organization
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/browse/projects")}>
                      <Users className="mr-2 h-4 w-4" />
                      Browse Projects
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your Projects</CardTitle>
                    <CardDescription>Manage all your ongoing projects</CardDescription>
                  </div>
                  <Button onClick={() => navigate("/projects/new")}>New Project</Button>
                </CardHeader>
                <CardContent>
                  {projectsLoading ? (
                    <p>Loading projects...</p>
                  ) : userProjects && userProjects.length > 0 ? (
                    <div className="space-y-4">
                      {userProjects.map((project) => (
                        <div 
                          key={project.id} 
                          className="flex justify-between items-center p-4 border rounded-md hover:bg-accent cursor-pointer"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <div>
                            <h3 className="font-medium">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">{project.description?.substring(0, 70)}...</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                {project.status || 'Active'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Created: {new Date(project.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">You don't have any projects yet</p>
                      <Button onClick={() => navigate("/projects/new")}>Create Your First Project</Button>
                    </div>
                  )}
                </CardContent>
                {userProjects && userProjects.length > 0 && (
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/projects")}>
                      View All Projects
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="organizations" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your Organizations</CardTitle>
                    <CardDescription>Manage organizations you belong to</CardDescription>
                  </div>
                  <Button onClick={() => navigate("/organizations/new")}>New Organization</Button>
                </CardHeader>
                <CardContent>
                  {orgsLoading ? (
                    <p>Loading organizations...</p>
                  ) : userOrgs && userOrgs.length > 0 ? (
                    <div className="space-y-4">
                      {userOrgs.map((org) => (
                        <div 
                          key={org.id} 
                          className="flex justify-between items-center p-4 border rounded-md hover:bg-accent cursor-pointer"
                          onClick={() => navigate(`/organizations/${org.id}`)}
                        >
                          <div>
                            <h3 className="font-medium">{org.name}</h3>
                            <p className="text-sm text-muted-foreground">{org.description?.substring(0, 70)}...</p>
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">You don't belong to any organizations yet</p>
                      <Button onClick={() => navigate("/organizations/new")}>Create Your First Organization</Button>
                    </div>
                  )}
                </CardContent>
                {userOrgs && userOrgs.length > 0 && (
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/organizations")}>
                      View All Organizations 
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent notifications and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {notificationsLoading ? (
                    <p>Loading notifications...</p>
                  ) : notifications && notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3 p-3 border-b last:border-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bell size={16} />
                          </div>
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No recent notifications</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <OnboardingFlow 
        open={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </Layout>
  );
}
