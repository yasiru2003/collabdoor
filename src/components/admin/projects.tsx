
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, 
  Search, 
  AlertCircle, 
  Eye,
  Ban,
  CheckCircle
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export function AdminProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch projects with organizer data
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles!projects_organizer_id_fkey (name, email)
        `);
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Filter projects based on search query
  const filteredProjects = projects?.filter(project => 
    project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };
  
  const handleViewDetails = (project: any) => {
    setSelectedProject(project);
    setIsProjectDetailsOpen(true);
  };
  
  const handleChangeStatus = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", projectId);
      
      if (error) throw error;
      
      toast({
        title: "Project status updated",
        description: `Project status has been changed to ${newStatus}`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load projects: {error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Management</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[30px]" /></TableCell>
                </TableRow>
              ))
            ) : filteredProjects?.length ? (
              filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>{project.category || "Uncategorized"}</TableCell>
                  <TableCell>{project.profiles?.name || "Unknown"}</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.created_at ? format(new Date(project.created_at), "MMM d, yyyy") : "Unknown"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(project)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleChangeStatus(project.id, "active")}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(project.id, "completed")}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(project.id, "cancelled")} className="text-destructive">
                          <Ban className="mr-2 h-4 w-4" />
                          Mark as cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No projects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Project details dialog */}
      <Dialog open={isProjectDetailsOpen} onOpenChange={setIsProjectDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected project
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Project ID:</div>
                <div className="truncate">{selectedProject.id}</div>
                
                <div className="font-semibold">Title:</div>
                <div>{selectedProject.title}</div>
                
                <div className="font-semibold">Category:</div>
                <div>{selectedProject.category || "Uncategorized"}</div>
                
                <div className="font-semibold">Status:</div>
                <div>{getStatusBadge(selectedProject.status)}</div>
                
                <div className="font-semibold">Organizer:</div>
                <div>{selectedProject.profiles?.name || "Unknown"}</div>
                
                <div className="font-semibold">Created:</div>
                <div>
                  {selectedProject.created_at 
                    ? format(new Date(selectedProject.created_at), "PPP") 
                    : "Unknown"}
                </div>
                
                <div className="font-semibold">Start Date:</div>
                <div>
                  {selectedProject.start_date 
                    ? format(new Date(selectedProject.start_date), "PPP") 
                    : "Not set"}
                </div>
                
                <div className="font-semibold">End Date:</div>
                <div>
                  {selectedProject.end_date 
                    ? format(new Date(selectedProject.end_date), "PPP") 
                    : "Not set"}
                </div>
              </div>
              
              <div>
                <div className="font-semibold mb-1">Description:</div>
                <div className="text-sm text-muted-foreground">{selectedProject.description}</div>
              </div>
              
              <div className="space-y-2">
                <div className="font-semibold">Required Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedProject.required_skills?.length ? (
                    selectedProject.required_skills.map((skill: string) => (
                      <Badge key={skill} variant="outline" className="mr-1 mb-1">{skill}</Badge>
                    ))
                  ) : (
                    <div className="text-muted-foreground">No skills required</div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-semibold">Partnership Types:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedProject.partnership_types?.length ? (
                    selectedProject.partnership_types.map((type: string) => (
                      <Badge key={type} variant="secondary" className="mr-1 mb-1">{type}</Badge>
                    ))
                  ) : (
                    <div className="text-muted-foreground">No partnership types specified</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
