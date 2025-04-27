
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "@/components/project-card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Organization, Project } from "@/types";
import { Building, Calendar, Globe, Mail, MapPin, Phone, Users, Edit, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mapOrganizationData, mapProjectData } from "@/utils/data-mappers";

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use mapOrganizationData when setting the organization state
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) throw error;
        if (data) {
          setOrganization(mapOrganizationData(data));
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
        setError("Failed to load organization details.");
        setLoading(false);
      }
    };
    
    fetchOrganization();
  }, [id]);

  // Fetch organization projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("organization_id", id)
          .eq("status", "published")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        // Map and transform the project data
        const mappedProjects = (data || []).map(project => mapProjectData(project));
        setProjects(mappedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    
    if (organization) {
      fetchProjects();
    }
  }, [id, organization]);

  // Fetch organization members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("organization_members")
          .select(`
            id,
            role,
            joined_at,
            profiles:user_id (
              id,
              name,
              profile_image
            )
          `)
          .eq("organization_id", id);
          
        if (error) throw error;
        
        setMembers(data || []);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    
    fetchMembers();
  }, [id]);

  // Check if current user is owner or member
  useEffect(() => {
    if (user && organization) {
      setIsOwner(user.id === organization.ownerId);
      
      const checkMembership = async () => {
        try {
          const { data, error } = await supabase
            .from("organization_members")
            .select("id")
            .eq("organization_id", id)
            .eq("user_id", user.id)
            .maybeSingle();
            
          if (error) throw error;
          
          setIsMember(!!data);
        } catch (error) {
          console.error("Error checking membership:", error);
        }
      };
      
      checkMembership();
    }
  }, [user, organization, id]);

  const handleJoinRequest = async () => {
    if (!user || !organization) return;
    
    try {
      // Check if already requested - use organization_join_requests table instead
      const { data: existingRequest, error: checkError } = await supabase
        .from("organization_join_requests")
        .select("id, status")
        .eq("organization_id", organization.id)
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingRequest) {
        if (existingRequest.status === "pending") {
          toast({
            title: "Request already sent",
            description: "You have already requested to join this organization.",
          });
          return;
        } else if (existingRequest.status === "rejected") {
          toast({
            title: "Request previously rejected",
            description: "Your previous request was rejected. Please contact the organization directly.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Send join request
      const { error } = await supabase
        .from("organization_join_requests")
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          status: "pending",
          message: `I would like to join ${organization.name}.`
        });
        
      if (error) throw error;
      
      toast({
        title: "Request sent",
        description: `Your request to join ${organization.name} has been sent.`,
      });
    } catch (error) {
      console.error("Error sending join request:", error);
      toast({
        title: "Error",
        description: "Failed to send join request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrganization = async () => {
    if (!organization || !isOwner) return;
    
    try {
      setDeleteLoading(true);
      
      // Check if organization has active projects
      const { data: activeProjects, error: projectsError } = await supabase
        .from("projects")
        .select("id")
        .eq("organization_id", organization.id)
        .eq("status", "published");
        
      if (projectsError) throw projectsError;
      
      if (activeProjects && activeProjects.length > 0) {
        toast({
          title: "Cannot delete organization",
          description: "This organization has active projects. Please archive or delete them first.",
          variant: "destructive"
        });
        setDeleteDialogOpen(false);
        setDeleteLoading(false);
        return;
      }
      
      // Delete organization
      const { error } = await supabase
        .from("organizations")
        .delete()
        .eq("id", organization.id);
        
      if (error) throw error;
      
      toast({
        title: "Organization deleted",
        description: "The organization has been successfully deleted.",
      });
      
      navigate("/organizations");
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast({
        title: "Error",
        description: "Failed to delete organization. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <p>Loading organization details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !organization) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex flex-col justify-center items-center min-h-[60vh]">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Organization Not Found</h2>
            <p className="text-muted-foreground mb-6">{error || "The organization you're looking for doesn't exist or has been removed."}</p>
            <Button asChild>
              <Link to="/browse/organizations">Browse Organizations</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {/* Organization Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {organization.logo ? (
              <img 
                src={organization.logo} 
                alt={organization.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Building className="h-12 w-12 text-primary/60" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold">{organization.name}</h1>
              <div className="flex gap-2">
                {isOwner && (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/organizations/${organization.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </>
                )}
                {!isOwner && !isMember && user && (
                  <Button size="sm" onClick={handleJoinRequest}>
                    <Users className="h-4 w-4 mr-1" /> Request to Join
                  </Button>
                )}
                {isMember && !isOwner && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Member
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {organization.industry && (
                <Badge variant="outline">{organization.industry}</Badge>
              )}
              {organization.size && (
                <Badge variant="outline">{organization.size}</Badge>
              )}
              {organization.foundedYear && (
                <Badge variant="outline">Founded {organization.foundedYear}</Badge>
              )}
            </div>
            
            <p className="text-muted-foreground mb-4">{organization.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organization.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{organization.location}</span>
                </div>
              )}
              {organization.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {organization.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(organization.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="projects" className="mt-8">
          <TabsList className="mb-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Projects</h2>
              {(isOwner || isMember) && (
                <Button asChild>
                  <Link to="/projects/new">Create Project</Link>
                </Button>
              )}
            </div>
            
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No projects found for this organization.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="members">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Members</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Owner */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {organization.name?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        <Link to={`/users/${organization.ownerId}`} className="hover:text-primary">
                          Organization Owner
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        <Badge variant="secondary">Owner</Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              
              {/* Members */}
              {members.map((member) => (
                <Card key={member.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.profiles?.profile_image} />
                        <AvatarFallback>
                          {member.profiles?.name?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          <Link to={`/users/${member.profiles?.id}`} className="hover:text-primary">
                            {member.profiles?.name || "Member"}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          <Badge variant="outline" className="capitalize">{member.role || "Member"}</Badge>
                          <span className="text-xs ml-2 text-muted-foreground">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
            
            {members.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No additional members in this organization.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="about">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">About {organization.name}</h2>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <p>{organization.description}</p>
                  
                  {organization.foundedYear && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">Founded</h3>
                      <p>{organization.foundedYear}</p>
                    </div>
                  )}
                  
                  {organization.industry && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">Industry</h3>
                      <p>{organization.industry}</p>
                    </div>
                  )}
                  
                  {organization.size && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">Size</h3>
                      <p>{organization.size}</p>
                    </div>
                  )}
                  
                  {organization.location && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">Location</h3>
                      <p>{organization.location}</p>
                    </div>
                  )}
                  
                  {organization.website && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">Website</h3>
                      <p>
                        <a 
                          href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {organization.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this organization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-yellow-50 p-4 rounded-md text-yellow-800 text-sm mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Warning</p>
                <p>Deleting this organization will remove all associated data, including membership records.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteOrganization}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
