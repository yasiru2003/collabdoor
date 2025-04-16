
import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { PartnerCard } from "@/components/partner-card";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useUserProjects, usePartnerships, useMessages } from "@/hooks/use-supabase-query";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: userProjects, isLoading: projectsLoading } = useUserProjects(user?.id);
  const { data: partnerships, isLoading: partnershipsLoading } = usePartnerships(user?.id);
  const { data: conversations, isLoading: messagesLoading } = useMessages(user?.id);
  const [dashboardTab, setDashboardTab] = useState<string>(user?.role === "organizer" ? "my-projects" : "recommended");

  // Get current counts
  const projectsCount = userProjects?.length || 0;
  const partnershipsCount = partnerships?.length || 0;
  const messagesCount = conversations?.reduce((total, conv) => total + (conv.unreadCount || 0), 0) || 0;

  // Redirect to login page if not authenticated
  if (!loading && !user) {
    navigate("/login");
    return null;
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your collaborations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Projects</CardTitle>
            <CardDescription>
              {user?.role === "organizer" ? "Your active projects" : "Projects you're involved in"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <div className="text-3xl font-bold">{projectsCount}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Partners</CardTitle>
            <CardDescription>
              {user?.role === "organizer" ? "Organizations partnering with you" : "Your partnership applications"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {partnershipsLoading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <div className="text-3xl font-bold">{partnershipsCount}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Messages</CardTitle>
            <CardDescription>Unread messages requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {messagesLoading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <div className="text-3xl font-bold">{messagesCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={dashboardTab} onValueChange={setDashboardTab} className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            {user?.role === "organizer" ? (
              <>
                <TabsTrigger value="my-projects">My Projects</TabsTrigger>
                <TabsTrigger value="interested-partners">Interested Partners</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="applied">Applied Projects</TabsTrigger>
              </>
            )}
          </TabsList>

          {user?.role === "organizer" && (
            <Button className="gap-1" onClick={() => navigate("/projects/new")}>
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Button>
          )}
        </div>

        {user?.role === "organizer" ? (
          <>
            <TabsContent value="my-projects" className="mt-0">
              {projectsLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              ) : userProjects && userProjects.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {userProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You haven't created any projects yet.</p>
                  <Button onClick={() => navigate("/projects/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="interested-partners" className="mt-0">
              <div className="text-center py-12">
                <p className="text-muted-foreground">No partners have shown interest yet.</p>
              </div>
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="recommended" className="mt-0">
              {projectsLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {userProjects?.slice(0, 4).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="applied" className="mt-0">
              {partnershipsLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              ) : partnerships && partnerships.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {partnerships.map((partnership) => (
                    <ProjectCard
                      key={partnership.id}
                      project={partnership.project}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You haven't applied to any projects yet.</p>
                  <Button variant="outline" onClick={() => navigate("/projects")}>
                    Browse Projects
                  </Button>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {messagesLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : conversations && conversations.length > 0 ? (
            conversations.slice(0, 3).map((conversation) => (
              <Card key={conversation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${conversation.unreadCount > 0 ? 'bg-primary' : 'bg-muted'}`}></div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{conversation.participantName}</span> sent you a message
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conversation.lastMessageTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recent activity to display.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
