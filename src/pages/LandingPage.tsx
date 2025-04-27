import { Layout } from "@/components/layout";
import { ProjectCard } from "@/components/project-card";
import { PartnerCard } from "@/components/partner-card";
import { Button } from "@/components/ui/button";
import { Organization, Project } from "@/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { mapProjectsData, mapOrganizationsData } from "@/utils/data-mappers";

export default function LandingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [partners, setPartners] = useState<Organization[]>([]);
  
  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(6);
          
        if (error) throw error;
        
        if (data) {
          // Use the data mapper to transform the DB format to our app format
          const mappedProjects = mapProjectsData(data);
          setProjects(mappedProjects);
        }
      } catch (error) {
        console.error('Error fetching featured projects:', error);
      }
    };
    
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .limit(3);
          
        if (error) throw error;
        
        if (data) {
          // Use the data mapper to transform the DB format to our app format
          const mappedOrganizations = mapOrganizationsData(data);
          setPartners(mappedOrganizations);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
      }
    };
    
    fetchFeaturedProjects();
    fetchPartners();
  }, []);

  return (
    <Layout>
      <section className="bg-primary/10 py-24">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Connect and Collaborate for Impact
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find projects and organizations that align with your skills and
            interests.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/browse/projects">Explore Projects</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/browse/organizations">Find Organizations</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild>
              <Link to="/browse/projects">View All Projects</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Featured Organizations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((organization) => (
              <PartnerCard key={organization.id} organization={organization} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild>
              <Link to="/browse/organizations">View All Organizations</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our community and start making a difference today.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/signup">Sign Up</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
