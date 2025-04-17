
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function AdminProjects() {
  const { data: projects, isLoading, refetch } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [pendingPublishProjects, setPendingPublishProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get pending publish projects
  useEffect(() => {
    const fetchPendingProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'pending_publish')
        .order('created_at', { ascending: false });
      
      if (data) {
        setPendingPublishProjects(data as Project[]);
      }
    };
    
    fetchPendingProjects();
  }, []);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: selectedProject.title,
          status: selectedProject.status,
          category: selectedProject.category,
          ...(selectedProject.status === 'completed' && { completed_at: new Date().toISOString() })
        } as any)
        .eq('id', selectedProject.id);

      if (error) throw error;

      toast({
        title: "Project updated",
        description: "The project has been successfully updated.",
      });
      
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleApprovePublication = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          status: 'published'
        })
        .eq('id', projectId);

      if (error) throw error;

      // Update organization owner notification
      const { data: projectData } = await supabase
        .from('projects')
        .select('title, organizer_id')
        .eq('id', projectId)
        .single();

      if (projectData) {
        await supabase
          .from('notifications')
          .insert({
            user_id: projectData.organizer_id,
            title: 'Project Published',
            message: `Your project "${projectData.title}" has been approved and published.`,
            link: `/projects/${projectId}`,
            read: false
          });
      }

      toast({
        title: "Project published",
        description: "The project has been successfully published.",
      });
      
      // Update local state
      setPendingPublishProjects(prev => prev.filter(p => p.id !== projectId));
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error: any) {
      toast({
        title: "Error publishing project",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleRejectPublication = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          status: 'draft'
        })
        .eq('id', projectId);

      if (error) throw error;

      // Update organization owner notification
      const { data: projectData } = await supabase
        .from('projects')
        .select('title, organizer_id')
        .eq('id', projectId)
        .single();

      if (projectData) {
        await supabase
          .from('notifications')
          .insert({
            user_id: projectData.organizer_id,
            title: 'Project Publication Rejected',
            message: `Your project "${projectData.title}" publication was rejected. Please review and resubmit.`,
            link: `/projects/${projectId}`,
            read: false
          });
      }

      toast({
        title: "Publication rejected",
        description: "The project has been returned to draft status.",
      });
      
      // Update local state
      setPendingPublishProjects(prev => prev.filter(p => p.id !== projectId));
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error: any) {
      toast({
        title: "Error rejecting publication",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'published': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      case 'pending_publish': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading projects...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Management</CardTitle>
        <CardDescription>Manage all projects in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingPublishProjects.length > 0 && (
          <div className="mb-6 border rounded-md p-4 bg-yellow-50 dark:bg-yellow-900/20">
            <h3 className="font-semibold mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
              Pending Publication Approval ({pendingPublishProjects.length})
            </h3>
            <div className="space-y-3">
              {pendingPublishProjects.map(project => (
                <div key={project.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Category: {project.category || "Uncategorized"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleApprovePublication(project.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRejectPublication(project.id)}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          {["all", "draft", "published", "in-progress", "completed"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="p-2 text-left">Title</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects
                      ?.filter(project => tab === "all" || project.status === tab)
                      .map((project) => (
                        <tr key={project.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-2 font-medium">{project.title}</td>
                          <td className="p-2">{project.category || "Uncategorized"}</td>
                          <td className="p-2">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </td>
                          <td className="p-2 text-center">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    {projects?.filter(project => tab === "all" || project.status === tab).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          No projects found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Make changes to the project details.
              </DialogDescription>
            </DialogHeader>
            
            {selectedProject && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={selectedProject.title}
                    onChange={(e) => setSelectedProject({...selectedProject, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={selectedProject.category || ""}
                    onChange={(e) => setSelectedProject({...selectedProject, category: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedProject.status}
                    onValueChange={(value) => 
                      setSelectedProject({
                        ...selectedProject, 
                        status: value as "draft" | "published" | "in-progress" | "completed"
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
