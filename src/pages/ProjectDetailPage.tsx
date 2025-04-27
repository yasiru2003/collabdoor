import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Project, Organization } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users, Building } from "lucide-react";
import { mapProjectData, mapOrganizationsData } from "@/utils/data-mappers";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [relatedOrganizations, setRelatedOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Map the raw data to our Project type
        if (data) {
          const mappedProject = mapProjectData(data);
          setProject(mappedProject);
        } else {
          setProject(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project details.');
        setLoading(false);
      }
    };

    const loadRelatedOrganizations = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .limit(3);
          
        if (error) throw error;
        
        if (data) {
          // Map the raw data to our Organization type
          const mappedOrganizations = mapOrganizationsData(data);
          setRelatedOrganizations(mappedOrganizations);
        }
      } catch (error) {
        console.error('Error loading related organizations:', error);
      }
    };

    fetchProject();
    loadRelatedOrganizations();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <p>Loading project details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex flex-col justify-center items-center min-h-[60vh]">
            <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-6">{error || "The project you're looking for doesn't exist or has been removed."}</p>
            <Button asChild>
              <Link to="/browse/projects">Browse Projects</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-1/3">
            <div className="rounded-lg overflow-hidden">
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-muted">
                  <span className="text-lg font-semibold text-muted-foreground">No Image</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
            <p className="text-muted-foreground mb-6">{project.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{project.timeline?.start} - {project.timeline?.end}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{project.partners?.length || 0} Partners</span>
              </div>
            </div>

            <Button asChild>
              <Link to="/apply">Apply Now</Link>
            </Button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Related Organizations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedOrganizations.map((org) => (
            <Card key={org.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={org.logo} alt={org.name} />
                    <AvatarFallback>{org.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{org.name}</CardTitle>
                    <CardDescription>{org.industry}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{org.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
