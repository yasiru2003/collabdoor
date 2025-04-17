import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Folder, LayoutDashboard, Mail, Users, Users2, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useProjectApplications, type ApplicationStatus } from "@/hooks/use-project-applications";
import { useUserProjects, useUserApplications } from "@/hooks/use-supabase-query";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardPage = () => {
  const { user, userProfile } = useAuth();
  const [receivedApplications, setReceivedApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { updateApplicationStatus } = useProjectApplications();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Use the hooks to fetch data
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(user?.id);
  const { data: userApplications = [], isLoading: applicationsLoading } = useUserApplications(user?.id);
  
  // Add application filter state
  const [applicationFilter, setApplicationFilter] = useState<ApplicationStatus | "all">("all");

  // Get user's display name (from profile or metadata or email)
  const getUserDisplayName = () => {
    if (userProfile?.name) return userProfile.name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    return user?.email ? user.email.split('@')[0] : 'User';
  };

  useEffect(() => {
    const fetchReceivedApplications = async () => {
      if (!user || projects.length === 0) return;
      
      setIsLoading(true);
      try {
        // Fetch received applications for the user's projects
        const projectIds = projects.map(project => project.id);
        
        console.log("Fetching applications for projects:", projectIds);
        
        // Modified approach: Fetch applications first
        const { data: applications, error } = await supabase
          .from("project_applications")
          .select("*")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false });
          
        if (error) {
          console.error("Error fetching received applications:", error);
          toast({
            title: "Error fetching applications",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        if (applications && applications.length > 0) {
          // Get all user IDs from applications
          const userIds = applications.map(app => app.user_id);
          
          // Fetch profiles for these users
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name, email, profile_image")
            .in("id", userIds);
            
          if (profilesError) {
            console.error("Error fetching applicant profiles:", profilesError);
            toast({
              title: "Error fetching applicant profiles",
              description: profilesError.message,
              variant: "destructive",
            });
          }
          
          // Fetch project details for these applications
          const { data: projectDetails, error: projectsError } = await supabase
            .from("projects")
            .select("*")
            .in("id", projectIds);
            
          if (projectsError) {
            console.error("Error fetching project details:", projectsError);
          }
          
          // Create lookup maps
          const profilesMap = profiles ? profiles.reduce((map, profile) => {
            map[profile.id] = profile;
            return map;
          }, {} as Record<string, any>) : {};
          
          const projectsMap = projectDetails ? projectDetails.reduce((map, project) => {
            map[project.id] = project;
            return map;
          }, {} as Record<string, any>) : {};
          
          // Combine the data
          const combinedApplications = applications.map(application => ({
            ...application,
            profiles: profilesMap[application.user_id] || null,
            projects: projectsMap[application.project_id] || null
          }));
          
          console.log("Combined applications:", combinedApplications);
          setReceivedApplications(combinedApplications);
        } else {
          setReceivedApplications([]);
        }
      } catch (err) {
        console.error("Error in fetchReceivedApplications:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!projectsLoading && projects.length > 0) {
      fetchReceivedApplications();
    } else if (!projectsLoading) {
      setIsLoading(false);
    }
  }, [user, projects, projectsLoading, toast]);

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "pending":
      default:
        return "outline";
    }
  };

  // Function to handle updating application status
  const handleUpdateStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      const result = await updateApplicationStatus(applicationId, status);
      if (result) {
        // Refresh the received applications data
        if (user && projects.length > 0) {
          const projectIds = projects.map(project => project.id);
          
          const { data: receivedApps, error } = await supabase
            .from("project_applications")
            .select(`
              *,
              projects(*),
              profiles(*)
            `)
            .in("project_id", projectIds)
            .order("created_at", { ascending: false });
            
          if (!error) {
            setReceivedApplications(receivedApps || []);
          }
        }
        
        toast({
          title: "Application Updated",
          description: `Application has been ${status}`,
          variant: status === "approved" ? "default" : "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating application:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  // Filter applications based on status
  const filteredUserApplications = userApplications.filter(app => 
    applicationFilter === "all" || app.status === applicationFilter
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Welcome back, {getUserDisplayName()}!
              </CardTitle>
              <CardDescription>
                Manage your projects and applications from here.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full md:w-auto flex justify-between md:inline-flex">
              <TabsTrigger value="applications" className="flex-1 md:flex-none">
                <Mail className="h-4 w-4 mr-2" />
                <span className="whitespace-nowrap">My Applications</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex-1 md:flex-none">
                <Folder className="h-4 w-4 mr-2" />
                <span className="whitespace-nowrap">My Projects</span>
              </TabsTrigger>
              <TabsTrigger value="received" className="flex-1 md:flex-none">
                <Users2 className="h-4 w-4 mr-2" />
                <span className="whitespace-nowrap">Received Apps</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="applications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Applications</h2>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="bg-background text-sm border rounded-md px-2 py-1"
                  value={applicationFilter}
                  onChange={(e) => setApplicationFilter(e.target.value as ApplicationStatus | "all")}
                >
                  <option value="all">All Applications</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : filteredUserApplications.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredUserApplications.map((application) => (
                  <Card key={application.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          <Link to={`/projects/${application.project_id}`} className="hover:text-primary transition-colors">
                            {application.projects?.title || "Untitled Project"}
                          </Link>
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {application.projects?.description || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          Applied on {new Date(application.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Partnership Type: {application.partnership_type}
                        </div>
                        {application.message && (
                          <div className="mt-2">
                            <p className="font-medium text-sm">Your message:</p>
                            <p className="text-sm italic">{application.message}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <LayoutDashboard className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {applicationFilter === "all" 
                      ? "You haven't applied to any projects yet."
                      : `No ${applicationFilter} applications found.`}
                  </p>
                  <Button asChild variant="secondary">
                    <Link to="/projects">Browse Projects</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Projects</h2>
              <Button asChild size="sm">
                <Link to="/projects/create">Create New Project</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : projects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          <Link to={`/projects/${project.id}`} className="hover:text-primary transition-colors">
                            {project.title}
                          </Link>
                        </CardTitle>
                        <Badge variant={project.status === 'published' ? "success" : "secondary"}>
                          {project.status === 'published' ? 'Active' : 'Draft'}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Created on {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                        {project.location && (
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            Location: {project.location}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="secondary" size="sm">
                        <Link to={`/projects/${project.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <Folder className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't created any projects yet.
                  </p>
                  <Button asChild>
                    <Link to="/projects/create">Create Your First Project</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="received" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Applications to My Projects</h2>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="bg-background text-sm border rounded-md px-2 py-1"
                  onChange={(e) => {
                    const value = e.target.value;
                    const filtered = value === "all" 
                      ? receivedApplications 
                      : receivedApplications.filter(app => app.status === value);
                    setReceivedApplications(filtered);
                  }}
                  defaultValue="all"
                >
                  <option value="all">All Applications</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : receivedApplications.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {receivedApplications.map((application) => {
                  // Safely extract profile data with null checks
                  const profiles = application.profiles || {};
                  
                  // Extract profile data with proper null checks
                  const profileName = profiles.name || "Unknown";
                  const profileEmail = profiles.email || "";
                  
                  return (
                    <Card key={application.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            <Link to={`/projects/${application.project_id}`} className="hover:text-primary transition-colors">
                              {application.projects?.title || "Untitled Project"}
                            </Link>
                          </CardTitle>
                          <Badge variant={getStatusBadgeVariant(application.status)}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>
                          From: <span className="font-medium">{profileName}</span>
                          {profileEmail && <span className="text-xs ml-2">({profileEmail})</span>}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            Partnership Type: {application.partnership_type}
                          </div>
                          {application.message && (
                            <div className="mt-2">
                              <p className="font-medium text-sm">Applicant message:</p>
                              <p className="text-sm italic">{application.message}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      {application.status === "pending" && (
                        <CardFooter className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-700 hover:bg-green-100"
                            onClick={() => handleUpdateStatus(application.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-700 hover:bg-red-100"
                            onClick={() => handleUpdateStatus(application.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <Users2 className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Applications Received</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't received any applications to your projects yet.
                  </p>
                  <Button asChild variant="secondary">
                    <Link to="/projects">View Your Projects</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardPage;
