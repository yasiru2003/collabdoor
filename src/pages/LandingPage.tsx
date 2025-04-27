
import { Layout } from "@/components/layout";
import { ProjectCard } from "@/components/project-card";
import { PartnerCard } from "@/components/partner-card";
import { Button } from "@/components/ui/button";
import { Organization, Project } from "@/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { mapProjectsData, mapOrganizationsData } from "@/utils/data-mappers";
import { CheckCircle, Users, Briefcase, Star, ArrowRight } from "lucide-react";

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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/20 to-secondary/20 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Connect, Collaborate, Create Impact
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            CollabDoor connects organizations with skilled partners to bring impactful projects to life.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/browse/projects">Find Projects</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/signup">Join CollabDoor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">Why Choose CollabDoor?</h2>
          <p className="text-lg text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
            Our platform offers everything you need to find partners and manage successful collaborations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verified Partners</h3>
              <p className="text-muted-foreground">
                All organizations and partners on our platform go through a verification process.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Network</h3>
              <p className="text-muted-foreground">
                Connect with a diverse community of professionals and organizations.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
              <Briefcase className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Project Management</h3>
              <p className="text-muted-foreground">
                Comprehensive tools to manage projects from start to completion.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
              <Star className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Success Stories</h3>
              <p className="text-muted-foreground">
                Browse through successful collaborations and learn from the best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Projects</h2>
              <p className="text-muted-foreground">Discover the latest opportunities for collaboration</p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex items-center">
              <Link to="/browse/projects">
                View All Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length > 0 ? (
              projects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              [...Array(3)].map((_, index) => (
                <div key={index} className="h-[300px] bg-muted rounded-lg animate-pulse" />
              ))
            )}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Button asChild>
              <Link to="/browse/projects">View All Projects</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Organizations Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Organizations</h2>
              <p className="text-muted-foreground">Connect with leading organizations in your field</p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex items-center">
              <Link to="/browse/organizations">
                View All Organizations <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.length > 0 ? (
              partners.map((organization) => (
                <PartnerCard key={organization.id} organization={organization} />
              ))
            ) : (
              [...Array(3)].map((_, index) => (
                <div key={index} className="h-[250px] bg-muted rounded-lg animate-pulse" />
              ))
            )}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Button asChild>
              <Link to="/browse/organizations">View All Organizations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Collaborating?</h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join CollabDoor today and connect with the perfect partners for your next project.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/signup">Create an Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/how-it-works">Learn How It Works</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
