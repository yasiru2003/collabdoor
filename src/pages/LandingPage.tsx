import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { supabase } from "@/integrations/supabase/client";
import { Project, Organization } from "@/types";
import { ProjectCard } from "@/components/project-card";
import { ArrowRight, CheckCircle, Users, Briefcase } from "lucide-react";
import { mapOrganizationsData, mapProjectsData } from "@/utils/data-mappers";

export default function LandingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    const fetchFeaturedOrganizations = async () => {
      try {
        const { data: orgData, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;
        setOrganizations(mapOrganizationsData(orgData || []));
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    const fetchFeaturedProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            profiles!projects_organizer_id_fkey(name, avatar_url),
            organizations!projects_organization_id_fkey(name, logo)
          `)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;

        // Transform data to match Project type
        const formattedProjects = data.map((project: any) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          category: project.category,
          location: project.location,
          image: project.image,
          status: project.status,
          timeline: {
            start: project.start_date,
            end: project.end_date,
          },
          partnershipTypes: project.partnership_types || [],
          organizerId: project.organizer_id,
          organizerName: project.profiles?.name,
          organizerImage: project.profiles?.avatar_url,
          organizationId: project.organization_id,
          organizationName: project.organizations?.name,
          organizationImage: project.organizations?.logo,
          applicationsEnabled: project.applications_enabled,
        }));

        setProjects(formattedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    
    fetchFeaturedOrganizations();
    fetchFeaturedProjects();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Connect, Collaborate, Create Impact
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                  CollabDoor brings together project creators and partners to build meaningful collaborations that make a difference.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/browse/projects">Explore Projects</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full"></div>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-accent/10 rounded-full"></div>
                  <div className="relative z-10 bg-card border rounded-xl shadow-lg p-6">
                    <div className="aspect-video bg-muted rounded-md mb-4"></div>
                    <div className="h-4 bg-muted/60 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-muted/60 rounded mb-4 w-1/2"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-16 bg-primary/20 rounded"></div>
                      <div className="h-8 w-16 bg-accent/20 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How CollabDoor Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform makes it simple to find the right partners and bring your ideas to life
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-muted/10 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create a Project</h3>
                <p className="text-muted-foreground">
                  Share your vision and specify what kind of partnerships you're looking for
                </p>
              </div>
              
              <div className="bg-muted/10 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Find Partners</h3>
                <p className="text-muted-foreground">
                  Connect with organizations and individuals who can help bring your project to life
                </p>
              </div>
              
              <div className="bg-muted/10 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
                <p className="text-muted-foreground">
                  Work together through our platform to achieve your shared goals
                </p>
              </div>
            </div>
            
            <div className="text-center mt-10">
              <Button variant="outline" asChild>
                <Link to="/how-it-works" className="flex items-center">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Featured Projects */}
        <section className="py-16 px-4 bg-muted/5">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Projects</h2>
              <Button variant="ghost" asChild>
                <Link to="/browse/projects" className="flex items-center">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Featured Organizations */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Organizations</h2>
              <Button variant="ghost" asChild>
                <Link to="/browse/organizations" className="flex items-center">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {organizations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {organizations.map((org) => (
                  <Link 
                    key={org.id} 
                    to={`/organizations/${org.id}`}
                    className="bg-muted/5 border rounded-lg p-4 flex flex-col items-center text-center hover:border-primary/20 transition-colors"
                  >
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-3">
                      {org.logo ? (
                        <img 
                          src={org.logo} 
                          alt={org.name} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-primary/70">
                          {org.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">{org.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{org.industry}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Loading organizations...</p>
              </div>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Collaborating?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join CollabDoor today and connect with partners who can help bring your projects to life.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/signup">Sign Up Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent" asChild>
                <Link to="/browse/projects">Explore Projects</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-muted/50 border-t">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Platform</h3>
              <ul className="space-y-2">
                <li><Link to="/browse/projects" className="text-sm text-muted-foreground hover:text-primary">Projects</Link></li>
                <li><Link to="/browse/organizations" className="text-sm text-muted-foreground hover:text-primary">Organizations</Link></li>
                <li><Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-primary">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link to="/careers" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Twitter</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">LinkedIn</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-muted">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CollabDoor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
