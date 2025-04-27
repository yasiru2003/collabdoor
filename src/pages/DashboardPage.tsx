import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useProjects, useUserProjects } from "@/hooks/use-projects-query";
import { useUserApplications } from "@/hooks/use-supabase-query";
import { Project } from "@/types";
import { CalendarIcon, ClockIcon, ListTodo, MapPinIcon, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/hooks/use-organization-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: projects, isLoading: isProjectsLoading } = useUserProjects(user?.id || "");
  const { data: applications, isLoading: isApplicationsLoading } = useUserApplications(user?.id);
  const { organization, isLoading: isOrgLoading } = useOrganization();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to view your dashboard.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/login">Sign In</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  const pendingApplications = applications?.filter(
    (app) => app.status === "pending"
  );

  const approvedApplications = applications?.filter(
    (app) => app.status === "approved"
  );

  const sortedProjects = [...(projects || [])].sort((a, b) => {
    // Sort by created_at date, most recent first
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const recentProjects = sortedProjects.slice(0, 3);

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.user_metadata?.name || user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Projects
                  </CardTitle>
                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isProjectsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      projects?.length || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Projects you've created
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Applications
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isApplicationsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      applications?.length || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Applications you've submitted
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Organization
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  {isOrgLoading ? (
                    <Skeleton className="h-8 w-full" />
                  ) : organization ? (
                    <div>
                      <div className="text-2xl font-bold truncate max-w-[180px]">
                        {organization.name}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your organization
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-medium">No Organization</div>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link to="/organizations/new">Create one</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Applications
                  </CardTitle>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isApplicationsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      pendingApplications?.length || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting response
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {isProjectsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : recentProjects.length > 0 ? (
                    <div className="space-y-4">
                      {recentProjects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="space-y-1">
                            <Link
                              to={`/projects/${project.id}`}
                              className="font-medium hover:underline"
                            >
                              {project.title}
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="capitalize">
                                {project.status?.replace("-", " ")}
                              </Badge>
                              {project.location && (
                                <div className="flex items-center gap-1">
                                  <MapPinIcon className="h-3 w-3" />
                                  <span>{project.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="ml-auto"
                          >
                            <Link to={`/projects/${project.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        You haven't created any projects yet.
                      </p>
                      <Button asChild>
                        <Link to="/projects/new">Create Your First Project</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
                {recentProjects.length > 0 && (
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/projects">View All Projects</Link>
                    </Button>
                  </CardFooter>
                )}
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {isApplicationsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : applications && applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.slice(0, 3).map((application) => (
                        <div
                          key={application.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="space-y-1">
                            <Link
                              to={`/projects/${application.project_id}`}
                              className="font-medium hover:underline"
                            >
                              {application.projects?.title}
                            </Link>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge
                                variant={
                                  application.status === "approved"
                                    ? "success"
                                    : application.status === "rejected"
                                    ? "destructive"
                                    : "outline"
                                }
                                className="capitalize"
                              >
                                {application.status}
                              </Badge>
                              {application.created_at && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <CalendarIcon className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      application.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="ml-auto"
                          >
                            <Link to={`/projects/${application.project_id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        You haven't applied to any projects yet.
                      </p>
                      <Button asChild>
                        <Link to="/browse/projects">Browse Projects</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
                {applications && applications.length > 0 && (
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/applications">View All Applications</Link>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Projects</h2>
              <Button asChild>
                <Link to="/projects/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>

            {isProjectsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Projects Found</CardTitle>
                  <CardDescription>
                    You haven't created any projects yet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button asChild>
                    <Link to="/projects/new">Create Your First Project</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Applications</h2>
              <Button asChild>
                <Link to="/browse/projects">Browse Projects</Link>
              </Button>
            </div>

            {isApplicationsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            <Link
                              to={`/projects/${application.project_id}`}
                              className="hover:underline"
                            >
                              {application.projects?.title}
                            </Link>
                          </CardTitle>
                          <CardDescription>
                            Applied on{" "}
                            {application.created_at
                              ? new Date(
                                  application.created_at
                                ).toLocaleDateString()
                              : "Unknown date"}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            application.status === "approved"
                              ? "success"
                              : application.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                          className="capitalize"
                        >
                          {application.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Partnership Type:</span>
                          <span>{application.partnership_type || "N/A"}</span>
                        </div>
                        {application.message && (
                          <div>
                            <span className="font-medium">Your message:</span>
                            <p className="text-muted-foreground mt-1">
                              {application.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full"
                      >
                        <Link to={`/projects/${application.project_id}`}>
                          View Project
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Applications Found</CardTitle>
                  <CardDescription>
                    You haven't applied to any projects yet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button asChild>
                    <Link to="/browse/projects">Browse Projects</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function ProjectCard({ project }: { project: Project }) {
  // Calculate progress based on status
  let progress = 0;
  switch (project.status) {
    case "draft":
      progress = 25;
      break;
    case "published":
      progress = 50;
      break;
    case "in-progress":
      progress = 75;
      break;
    case "completed":
      progress = 100;
      break;
    default:
      progress = 0;
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1">
            <Link
              to={`/projects/${project.id}`}
              className="hover:underline"
            >
              {project.title}
            </Link>
          </CardTitle>
          <Badge variant="outline" className="capitalize">
            {project.status?.replace("-", " ")}
          </Badge>
        </div>
        <CardDescription className="line-clamp-1">
          {project.category || "No category"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          {project.image && (
            <div className="aspect-video w-full overflow-hidden rounded-md">
              <img
                src={project.image}
                alt={project.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <p className="text-muted-foreground line-clamp-2">
            {project.description || "No description provided."}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
            {project.location && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-3.5 w-3.5" />
                <span>{project.location}</span>
              </div>
            )}
            {project.created_at && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button asChild variant="outline" className="w-full">
          <Link to={`/projects/${project.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
