
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Folder, LayoutDashboard, Mail, Users, Users2, Filter, Handshake, Building2, Plus, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useProjectApplications, type ApplicationStatus } from "@/hooks/use-project-applications";
import { useUserProjects, useUserApplications } from "@/hooks/use-supabase-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PartnershipInterestsTab } from "@/components/organization/PartnershipInterestsTab";
import { PartnershipApplicationsTab } from "@/components/organization/PartnershipApplicationsTab";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PartnershipInterestForm } from "@/components/organization/PartnershipInterestForm";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define a type for profile data to ensure type safety
interface ProfileData {
  id: string;
  name: string;
  email: string;
  profile_image: string;
}

// Define a type for partnership application data
interface PartnershipApplication {
  id: string;
  user_id: string;
  organization_id: string;
  status: string;
  created_at: string;
  message?: string;
  partnership_type: string;
  project_id?: string;
  profiles: ProfileData;
  organization_partnership_interests?: {
    description?: string;
    partnership_type?: string;
  };
  projects?: {
    id: string;
    title: string;
    status: string;
  };
}

const DashboardPage = () => {
  const { user, userProfile } = useAuth();
  const [receivedApplications, setReceivedApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [receivedApplicationFilter, setReceivedApplicationFilter] = useState<ApplicationStatus | "all">("all");
  const { updateApplicationStatus } = useProjectApplications();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Use the hooks to fetch data
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(user?.id);
  const { data: userApplications = [], isLoading: applicationsLoading } = useUserApplications(user?.id);
  
  // Add application filter state
  const [applicationFilter, setApplicationFilter] = useState<ApplicationStatus | "all">("all");

  // Fetch owned organizations
  const { data: ownedOrganizations, isLoading: orgsLoading } = useQuery({
    queryKey: ["owned-organizations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", user.id);
        
      if (error) {
        console.error("Error fetching owned organizations:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  // Get user's display name (from profile or metadata or email)
  const getUserDisplayName = () => {
    if (userProfile?.name) return userProfile.name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    return user?.email ? user.email.split('@')[0] : 'User';
  };

  // Function to fetch received applications
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

  useEffect(() => {
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
        await fetchReceivedApplications();
        
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
  
  // Filter received applications based on status
  const filteredReceivedApplications = receivedApplicationFilter === "all" 
    ? receivedApplications
    : receivedApplications.filter(app => app.status === receivedApplicationFilter);

  // Function to get the project status badge variant
  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return { variant: "success", label: 'Active' };
      case 'completed':
        return { variant: "secondary", label: 'Completed' };
      case 'draft':
      default:
        return { variant: "secondary", label: 'Draft' };
    }
  };

  // Fetch received partnership applications for organizations where user is owner
  const { data: partnershipApplications, isLoading: partnershipLoading } = useQuery({
    queryKey: ["partnership-applications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get organizations where user is owner
      const { data: ownedOrgs } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id);

      if (!ownedOrgs?.length) return [];

      const orgIds = ownedOrgs.map(org => org.id);

      // Then fetch partnership applications for these organizations
      const { data: applications, error } = await supabase
        .from("partnership_applications")
        .select(`
          *,
          profiles:user_id(id, name, email, profile_image),
          organization_partnership_interests(
            description,
            partnership_type
          )
        `)
        .in("organization_id", orgIds)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Apply type safety - ensure each application has a valid profile
      // First cast to unknown and then to our expected type
      return (applications || []).map(app => {
        // Ensure profiles has valid data with expected structure
        const safeProfiles = app.profiles || { id: '', name: 'Unknown', email: '', profile_image: '' };
        
        return {
          ...app,
          profiles: safeProfiles
        };
      }) as unknown as PartnershipApplication[];
    },
    enabled: !!user?.id
  });

  // Add partnership application handlers
  const handleApprovePartnership = async (applicationId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("partnership_applications")
        .update({ status: "approved" })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Partnership application approved",
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["partnership-applications"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectPartnership = async (applicationId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("partnership_applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Partnership application rejected",
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["partnership-applications"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Add state for selected organization
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showAddInterestForm, setShowAddInterestForm] = useState(false);

  // Set initial selected organization when data loads
  useEffect(() => {
    if (ownedOrganizations?.length > 0 && !selectedOrgId) {
      setSelectedOrgId(ownedOrganizations[0].id);
    }
  }, [ownedOrganizations]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Announcement Banner */}
        <AnnouncementBanner />

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
              <TabsTrigger value="partnerships" className="flex-1 md:flex-none">
                <Handshake className="h-4 w-4 mr-2" />
                <span className="whitespace-nowrap">Partnership Interest</span>
              </TabsTrigger>
              <TabsTrigger value="explain" className="flex-1 md:flex-none">
                <Info className="h-4 w-4 mr-2" />
                <span className="whitespace-nowrap">Explain</span>
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
            
            {applicationsLoading ? (
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

            {projectsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : projects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => {
                  const statusBadge = getProjectStatusBadge(project.status);
                  
                  return (
                    <Card key={project.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            <Link to={`/projects/${project.id}`} className="hover:text-primary transition-colors">
                              {project.title}
                            </Link>
                          </CardTitle>
                          <Badge variant={statusBadge.variant as "success" | "secondary" | "destructive"}>
                            {statusBadge.label}
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
                  );
                })}
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
                  value={receivedApplicationFilter}
                  onChange={(e) => setReceivedApplicationFilter(e.target.value as ApplicationStatus | "all")}
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
            ) : filteredReceivedApplications.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredReceivedApplications.map((application) => {
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
            
            {/* Add Partnership Applications Section */}
            
          </TabsContent>

          <TabsContent value="partnerships">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold">Partnership Interest Applications</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {ownedOrganizations && ownedOrganizations.length > 0 && (
                    <>
                      <Select
                        value={selectedOrgId || ''}
                        onValueChange={(value) => setSelectedOrgId(value)}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {ownedOrganizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={() => setShowAddInterestForm(true)}
                        className="w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Interest
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {orgsLoading ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                    <p>Loading organizations...</p>
                  </CardContent>
                </Card>
              ) : ownedOrganizations && ownedOrganizations.length > 0 ? (
                <PartnershipApplicationsTab
                  organizationId={selectedOrgId || ownedOrganizations[0].id}
                  organizationName={ownedOrganizations.find(org => org.id === selectedOrgId)?.name || ownedOrganizations[0].name}
                  isOwner={true}
                />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Handshake className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Organization</h3>
                    <p className="text-muted-foreground">
                      You do not own any organizations to see partnership interest applications.
                    </p>
                    <Button asChild className="mt-4">
                      <Link to="/organizations/new">Create an Organization</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Add Partnership Interest Form Dialog */}
            <Dialog open={showAddInterestForm} onOpenChange={setShowAddInterestForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Partnership Interest</DialogTitle>
                  <DialogDescription>
                    Specify what type of partnerships your organization is looking for
                  </DialogDescription>
                </DialogHeader>
                
                {selectedOrgId && (
                  <PartnershipInterestForm 
                    organizationId={selectedOrgId}
                    onSuccess={() => setShowAddInterestForm(false)}
                    onCancel={() => setShowAddInterestForm(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="explain" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Dashboard Explanation</h2>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>What is this dashboard?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-2" /> My Applications
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This tab shows all the projects you've applied to. You can view the status of your applications (pending, approved, or rejected) and all related details.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-medium flex items-center">
                      <Folder className="h-4 w-4 mr-2" /> My Projects
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Here you'll find all the projects you've created. You can view their status, details, and manage them directly from this section.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-medium flex items-center">
                      <Users2 className="h-4 w-4 mr-2" /> Received Applications
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This tab displays all applications received for projects you've created. You can review, approve, or reject applications from interested partners.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-medium flex items-center">
                      <Handshake className="h-4 w-4 mr-2" /> Partnership Interest
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Manage your organization's partnership interests and applications in this tab. You can review incoming partnership requests and set up partnership interests.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Need help? Contact our support team for assistance with any dashboard features.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="organization-interests">
            {/* Organization Interests tab removed as requested */}
           </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardPage;
