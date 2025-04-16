import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useUserProjects, usePartnerships, useUserApplications } from "@/hooks/use-supabase-query";
import { ProjectCard } from "@/components/project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, ExternalLink } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: userProjects, isLoading: loadingProjects } = useUserProjects(user?.id);
  const { data: partnerships, isLoading: loadingPartnerships } = usePartnerships(user?.id);
  const { data: applications, isLoading: loadingApplications } = useUserApplications(user?.id);

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "Partner"}
          </p>
        </div>
        <Button asChild>
          <Link to="/projects/new" className="gap-1 self-start">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  My Projects
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingProjects ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    userProjects?.length || 0
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
                  Active Partnerships
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingPartnerships ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    partnerships?.length || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Projects you're partnering on
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Applications
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingApplications ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    applications?.filter(app => app.status === "pending").length || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting response
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Your recently created projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProjects ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userProjects?.length ? (
                  <div className="space-y-4">
                    {userProjects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {project.title.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            <Link
                              to={`/projects/${project.id}`}
                              className="hover:underline"
                            >
                              {project.title}
                            </Link>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              new Date(project.createdAt),
                              "MMMM d, yyyy"
                            )}
                            {project.status === "published" && (
                              <Badge className="ml-2" variant="outline">
                                Active
                              </Badge>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          asChild
                        >
                          <Link to={`/projects/${project.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">
                      You haven't created any projects yet
                    </p>
                    <Button asChild size="sm">
                      <Link to="/projects/new">Create Project</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Projects you've applied to partner on
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingApplications ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : applications?.length ? (
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {application.projects?.title.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            <Link
                              to={`/projects/${application.project_id}`}
                              className="hover:underline"
                            >
                              {application.projects?.title}
                            </Link>
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>
                              {format(
                                new Date(application.created_at),
                                "MMMM d, yyyy"
                              )}
                            </span>
                            <Badge 
                              className="ml-2" 
                              variant={
                                application.status === "approved" ? "success" :
                                application.status === "rejected" ? "destructive" :
                                "secondary"
                              }
                            >
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          asChild
                        >
                          <Link to={`/projects/${application.project_id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">
                      You haven't applied to any projects yet
                    </p>
                    <Button asChild size="sm">
                      <Link to="/projects">Browse Projects</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingProjects ? (
              [1, 2, 3].map((i) => (
                <Card key={i} className="relative overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </Card>
              ))
            ) : userProjects?.length ? (
              userProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium mb-2">
                  No projects found
                </h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any projects yet.
                </p>
                <Button asChild>
                  <Link to="/projects/new">Create Project</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-4">
          <div className="grid gap-4">
            {loadingPartnerships ? (
              [1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : partnerships?.length ? (
              partnerships.map((partnership) => (
                <Card key={partnership.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {partnership.project?.title?.substring(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {partnership.project?.title || "Unknown Project"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">
                              {partnership.partnership_type.charAt(0).toUpperCase() +
                                partnership.partnership_type.slice(1)}
                            </Badge>
                            <span>•</span>
                            <span>
                              {format(
                                new Date(partnership.created_at),
                                "MMMM d, yyyy"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button asChild>
                        <Link to={`/projects/${partnership.project_id}`}>
                          View Project
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">
                  No partnerships found
                </h3>
                <p className="text-muted-foreground mb-4">
                  You're not partnering on any projects yet.
                </p>
                <Button asChild>
                  <Link to="/projects">Browse Projects</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="grid gap-4">
            {loadingApplications ? (
              [1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : applications?.length ? (
              applications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {application.projects?.title?.substring(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {application.projects?.title || "Unknown Project"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">
                              {application.partnership_type.charAt(0).toUpperCase() +
                                application.partnership_type.slice(1)}
                            </Badge>
                            <span>•</span>
                            <span>
                              Applied {format(
                                new Date(application.created_at),
                                "MMMM d, yyyy"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            application.status === "approved" ? "success" :
                            application.status === "rejected" ? "destructive" :
                            "secondary"
                          }
                        >
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                        <Button asChild>
                          <Link to={`/projects/${application.project_id}`}>
                            View Project
                          </Link>
                        </Button>
                      </div>
                    </div>
                    {application.message && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm italic">{application.message}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">
                  No applications found
                </h3>
                <p className="text-muted-foreground mb-4">
                  You haven't applied to any projects yet.
                </p>
                <Button asChild>
                  <Link to="/projects">Browse Projects</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
