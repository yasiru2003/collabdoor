
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ProjectCard } from "@/components/project-card";
import { Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Project } from "@/types";

interface OrganizationProjectsProps {
  organizationId: string;
  organizationName: string;
  isOwner: boolean;
}

export function OrganizationProjects({ organizationId, organizationName, isOwner }: OrganizationProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        // Fetch projects based on organization_id or organization_name
        const { data, error } = await supabase
          .from('projects')
          .select('*, profiles(name)')
          .or(`organization_id.eq.${organizationId},organization_name.eq.${organizationName}`)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Map database results to Project type
        const mappedProjects = (data || []).map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          organizerId: project.organizer_id,
          organizerName: project.profiles?.name || "Unknown",
          organizationId: project.organization_id,
          organizationName: project.organization_name,
          partnershipTypes: project.partnership_types || [],
          timeline: {
            start: project.start_date,
            end: project.end_date,
          },
          status: project.status as "draft" | "published" | "in-progress" | "completed",
          category: project.category,
          image: project.image,
          requiredSkills: project.required_skills,
          location: project.location,
          partners: [],
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          completedAt: project.completed_at,
          applicationsEnabled: project.applications_enabled
        })) as Project[];
        
        setProjects(mappedProjects);
      } catch (error) {
        console.error('Error fetching organization projects:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjects();
  }, [organizationId, organizationName]);
  
  if (loading) {
    return <p>Loading projects...</p>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          Projects associated with this organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(project => (
              <ProjectCard 
                key={project.id}
                project={project}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              This organization doesn't have any projects yet.
            </p>
            {isOwner && (
              <Button onClick={() => navigate("/projects/new")}>
                Create a Project
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
