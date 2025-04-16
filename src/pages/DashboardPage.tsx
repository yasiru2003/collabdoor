
import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { PartnerCard } from "@/components/partner-card";
import { Plus, Check, X, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { 
  useUserProjects, 
  usePartnerships, 
  useMessages, 
  useProjectApplications,
  useUserApplications
} from "@/hooks/use-supabase-query";
import { useNavigate } from "react-router-dom";
import { mapSupabaseProjectToProject } from "@/utils/data-mappers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useProjectApplications as useProjectApplicationsHook } from "@/hooks/use-project-applications";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: userProjects, isLoading: projectsLoading } = useUserProjects(user?.id);
  const { data: partnerships, isLoading: partnershipsLoading } = usePartnerships(user?.id);
  const { data: conversations, isLoading: messagesLoading } = useMessages(user?.id);
  const { data: userApplications, isLoading: userApplicationsLoading } = useUserApplications(user?.id);
  
  const [dashboardTab, setDashboardTab] = useState<string>(user?.role === "organizer" ? "my-projects" : "recommended");
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(
    userProjects && userProjects.length > 0 ? userProjects[0].id : undefined
  );
  
  const { data: projectApplications, isLoading: projectApplicationsLoading } = useProjectApplications(selectedProjectId);
  const { updateApplicationStatus } = useProjectApplicationsHook();

  // Get current counts
  const projectsCount = userProjects?.length || 0;
  const partnershipsCount = partnerships?.length || 0;
  const messagesCount = conversations?.reduce((total, conv) => total + (conv.unreadCount || 0), 0) || 0;
  const applicationsCount = user?.role === "organizer" 
    ? projectApplications?.length || 0
    : userApplications?.length || 0;

  // Redirect to login page if not authenticated
  if (!loading && !user) {
    navigate("/login");
    return null;
  }

  // Handle status badge styling
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Check className="h-3 w-3 mr-1" /> Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <X className="h-3 w-3 mr-1" /> Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle application status update
  const handleUpdateStatus = async (applicationId: string, status: "approved" | "rejected") => {
    await updateApplicationStatus(applicationId, status);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your collaborations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
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
            <CardTitle className="text-lg">Applications</CardTitle>
            <CardDescription>
              {user?.role === "organizer" ? "Partnership requests" : "Your applications"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.role === "organizer" ? (
              projectApplicationsLoading ? (
                <Skeleton className="h-8 w-8" />
              ) : (
                <div className="text-3xl font-bold">{applicationsCount}</div>
              )
            ) : (
              userApplicationsLoading ? (
                <Skeleton className="h-8 w-8" />
              ) : (
                <div className="text-3xl font-bold">{applicationsCount}</div>
              )
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
                <TabsTrigger value="interested-partners">Partnership Requests</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="applied">My Applications</TabsTrigger>
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
              {projectsLoading ? (
                <Skeleton className="h-10 w-full mb-4" />
              ) : userProjects && userProjects.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <p className="text-sm text-muted-foreground mr-2">Select project:</p>
                    {userProjects.map((project) => (
                      <Button
                        key={project.id}
                        variant={selectedProjectId === project.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        {project.title}
                      </Button>
                    ))}
                  </div>
                  
                  {projectApplicationsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : projectApplications && projectApplications.length > 0 ? (
                    <div className="space-y-3">
                      {projectApplications.map((application: any) => (
                        <Card key={application.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={application.profiles?.profile_image} />
                                  <AvatarFallback className="bg-primary text-primary-foreground">
                                    {application.profiles?.name ? 
                                      application.profiles.name.substring(0, 2).toUpperCase() : 
                                      "UN"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{application.profiles?.name || "Unknown"}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Applied for: {application.partnership_type}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(application.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                {getStatusBadge(application.status)}
                                
                                {application.status === 'pending' && (
                                  <div className="flex gap-2 mt-2 sm:mt-0">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
                                      onClick={() => handleUpdateStatus(application.id, "approved")}
                                    >
                                      <Check className="h-4 w-4 mr-1" /> Approve
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800"
                                      onClick={() => handleUpdateStatus(application.id, "rejected")}
                                    >
                                      <X className="h-4 w-4 mr-1" /> Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {application.message && (
                              <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                                <p className="font-medium mb-1">Application message:</p>
                                <p>{application.message}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No partnership applications yet for this project.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You need to create a project first to receive partnership applications.</p>
                  <Button onClick={() => navigate("/projects/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              )}
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
              {userApplicationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : userApplications && userApplications.length > 0 ? (
                <div className="space-y-3">
                  {userApplications.map((application: any) => (
                    <Card key={application.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                          <div>
                            <h3 className="font-medium">
                              {application.projects?.title || "Unknown Project"}
                            </h3>
                            <div className="flex gap-2 items-center mt-1">
                              <Badge variant="outline">
                                {application.partnership_type}
                              </Badge>
                              {getStatusBadge(application.status)}
                              <span className="text-sm text-muted-foreground">
                                Applied on {new Date(application.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/projects/${application.project_id}`)}
                          >
                            View Project
                          </Button>
                        </div>
                        
                        {application.message && (
                          <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                            <p className="font-medium mb-1">Your message:</p>
                            <p>{application.message}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
