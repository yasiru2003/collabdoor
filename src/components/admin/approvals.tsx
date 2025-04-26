
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, AlertCircle, Building2, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { format } from "date-fns";

export function AdminApprovals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingOrgs, setPendingOrgs] = useState<any[]>([]);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { autoApproveOrganizations, autoApproveProjects } = useSystemSettings();

  // Fetch pending organizations and projects
  useEffect(() => {
    const fetchPendingItems = async () => {
      setIsLoading(true);
      try {
        // Fetch pending organizations
        const { data: orgs, error: orgsError } = await supabase
          .from('organizations')
          .select(`
            *,
            profiles!organizations_owner_id_fkey(id, name, email, profile_image)
          `)
          .eq('status', 'pending_approval')
          .order('created_at', { ascending: false });
          
        if (orgsError) throw orgsError;
        
        // Fetch pending projects
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            profiles!projects_organizer_id_fkey(id, name, email, profile_image)
          `)
          .eq('status', 'pending_publish')
          .order('created_at', { ascending: false });
          
        if (projectsError) throw projectsError;
        
        setPendingOrgs(orgs || []);
        setPendingProjects(projects || []);
      } catch (error) {
        console.error("Error fetching pending items:", error);
        toast({
          title: "Error fetching pending items",
          description: "There was a problem loading the pending approvals.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPendingItems();
    
    // Setup real-time listeners for new organizations and projects
    const orgChannel = supabase
      .channel('organizations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'organizations', filter: 'status=eq.pending_approval' }, 
        () => fetchPendingItems()
      )
      .subscribe();
      
    const projectChannel = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects', filter: 'status=eq.pending_publish' }, 
        () => fetchPendingItems()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(orgChannel);
      supabase.removeChannel(projectChannel);
    };
  }, [toast]);

  // Handle organization approval
  const handleApproveOrganization = async (orgId: string, orgName: string, ownerId: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ status: 'active' })
        .eq('id', orgId);

      if (error) throw error;
      
      // Send notification to the organization owner
      await supabase
        .from('notifications')
        .insert({
          user_id: ownerId,
          title: 'Organization Approved',
          message: `Your organization "${orgName}" has been approved.`,
          link: `/organizations/${orgId}`,
          read: false
        });
      
      setPendingOrgs(prev => prev.filter(org => org.id !== orgId));
      
      toast({
        title: "Organization approved",
        description: `${orgName} has been successfully approved.`
      });
      
      // Refresh related data
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-approvals'] });
    } catch (error: any) {
      toast({
        title: "Error approving organization",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Handle organization rejection
  const handleRejectOrganization = async (orgId: string, orgName: string, ownerId: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ status: 'rejected' })
        .eq('id', orgId);

      if (error) throw error;
      
      // Send notification to the organization owner
      await supabase
        .from('notifications')
        .insert({
          user_id: ownerId,
          title: 'Organization Rejected',
          message: `Your organization "${orgName}" has been rejected. Please contact admin for more information.`,
          read: false
        });
      
      setPendingOrgs(prev => prev.filter(org => org.id !== orgId));
      
      toast({
        title: "Organization rejected",
        description: `${orgName} has been rejected.`
      });
      
      // Refresh related data
      queryClient.invalidateQueries({ queryKey: ['admin-pending-approvals'] });
    } catch (error: any) {
      toast({
        title: "Error rejecting organization",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Handle project approval
  const handleApproveProject = async (projectId: string, projectTitle: string, organizerId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'published' })
        .eq('id', projectId);

      if (error) throw error;
      
      // Send notification to the project organizer
      await supabase
        .from('notifications')
        .insert({
          user_id: organizerId,
          title: 'Project Published',
          message: `Your project "${projectTitle}" has been approved and published.`,
          link: `/projects/${projectId}`,
          read: false
        });
      
      setPendingProjects(prev => prev.filter(project => project.id !== projectId));
      
      toast({
        title: "Project published",
        description: `${projectTitle} has been successfully published.`
      });
      
      // Refresh related data
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-approvals'] });
    } catch (error: any) {
      toast({
        title: "Error publishing project",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Handle project rejection
  const handleRejectProject = async (projectId: string, projectTitle: string, organizerId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'draft' })
        .eq('id', projectId);

      if (error) throw error;
      
      // Send notification to the project organizer
      await supabase
        .from('notifications')
        .insert({
          user_id: organizerId,
          title: 'Project Publication Rejected',
          message: `Your project "${projectTitle}" was not approved for publication. Please review and try again.`,
          link: `/projects/${projectId}/edit`,
          read: false
        });
      
      setPendingProjects(prev => prev.filter(project => project.id !== projectId));
      
      toast({
        title: "Project rejected",
        description: `${projectTitle} has been returned to draft status.`
      });
      
      // Refresh related data
      queryClient.invalidateQueries({ queryKey: ['admin-pending-approvals'] });
    } catch (error: any) {
      toast({
        title: "Error rejecting project",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Manage organization and project approval requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4 p-4 border rounded-md">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Auto-approval status notice
  const renderAutoApprovalStatus = () => {
    return (
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 border rounded-md flex items-center space-x-4 ${autoApproveOrganizations ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
          <div className={`p-2 rounded-full ${autoApproveOrganizations ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Organization Auto-Approval</p>
            <p className="text-sm text-muted-foreground">
              {autoApproveOrganizations 
                ? "Organizations are automatically approved when created" 
                : "Manual approval required for new organizations"}
            </p>
          </div>
          <Badge variant={autoApproveOrganizations ? "success" : "outline"} className="ml-auto">
            {autoApproveOrganizations ? "ON" : "OFF"}
          </Badge>
        </div>
        
        <div className={`p-4 border rounded-md flex items-center space-x-4 ${autoApproveProjects ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
          <div className={`p-2 rounded-full ${autoApproveProjects ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Project Auto-Approval</p>
            <p className="text-sm text-muted-foreground">
              {autoApproveProjects 
                ? "Projects are automatically published when submitted" 
                : "Manual approval required for project publication"}
            </p>
          </div>
          <Badge variant={autoApproveProjects ? "success" : "outline"} className="ml-auto">
            {autoApproveProjects ? "ON" : "OFF"}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Manage organization and project approval requests</CardDescription>
      </CardHeader>
      <CardContent>
        {renderAutoApprovalStatus()}
        
        <Tabs defaultValue="organizations">
          <TabsList>
            <TabsTrigger value="organizations">
              Organizations
              {pendingOrgs.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingOrgs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="projects">
              Projects
              {pendingProjects.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingProjects.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="organizations" className="mt-4">
            {pendingOrgs.length === 0 ? (
              <div className="text-center py-12 border rounded-md">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/70" />
                <h3 className="mt-4 text-lg font-medium">No pending organization approvals</h3>
                <p className="mt-2 text-muted-foreground">
                  All organizations have been processed or auto-approval is enabled.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrgs.map((org) => (
                  <div key={org.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {org.logo ? (
                          <img src={org.logo} alt={org.name} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{org.name}</h4>
                        <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                          <span>{org.industry || "No industry"}</span>
                          <span>•</span>
                          <span>{org.location || "No location"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 justify-end mt-2 sm:mt-0">
                      <div className="flex items-center space-x-2 mr-4">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={org.profiles?.profile_image} alt={org.profiles?.name} />
                          <AvatarFallback>{org.profiles?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{org.profiles?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(org.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleApproveOrganization(org.id, org.name, org.owner_id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRejectOrganization(org.id, org.name, org.owner_id)}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="projects" className="mt-4">
            {pendingProjects.length === 0 ? (
              <div className="text-center py-12 border rounded-md">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/70" />
                <h3 className="mt-4 text-lg font-medium">No pending project approvals</h3>
                <p className="mt-2 text-muted-foreground">
                  All projects have been processed or auto-approval is enabled.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProjects.map((project) => (
                  <div key={project.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden">
                        {project.image ? (
                          <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
                        ) : (
                          <FileText className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{project.title}</h4>
                        <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                          <span>{project.organization_name || "No organization"}</span>
                          <span>•</span>
                          <span>{project.category || "No category"}</span>
                          <span>•</span>
                          <span>{project.location || "No location"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 justify-end mt-2 sm:mt-0">
                      <div className="flex items-center space-x-2 mr-4">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={project.profiles?.profile_image} alt={project.profiles?.name} />
                          <AvatarFallback>{project.profiles?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{project.profiles?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleApproveProject(project.id, project.title, project.organizer_id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRejectProject(project.id, project.title, project.organizer_id)}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
