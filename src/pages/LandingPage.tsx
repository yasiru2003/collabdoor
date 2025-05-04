import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { Header } from "@/components/header";
import { ArrowRight, Building, CheckCircle2, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project, Organization } from "@/types";
import { useState, useEffect } from "react";
import { mapSupabaseProjectToProject, mapSupabaseOrgToOrganization } from "@/utils/data-mappers";
import { Skeleton } from "@/components/ui/skeleton";
export default function LandingPage() {
  const {
    user
  } = useAuth();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [featuredOrgs, setFeaturedOrgs] = useState<Organization[]>([]);

  // Fetch featured projects - move this before any potential return statements
  const {
    data: projects,
    isLoading
  } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("projects").select("*").eq("status", "published").order("created_at", {
        ascending: false
      }).limit(3);
      if (error) throw error;
      return (data || []).map(project => mapSupabaseProjectToProject(project));
    }
  });

  // Query for featured organizations
  const {
    data: organizations,
    isLoading: isLoadingOrgs
  } = useQuery({
    queryKey: ["featured-organizations"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("organizations").select("*").limit(3).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return (data || []).map(org => mapSupabaseOrgToOrganization(org));
    }
  });
  useEffect(() => {
    if (projects) {
      setFeaturedProjects(projects);
    }
    if (organizations) {
      setFeaturedOrgs(organizations);
    }
  }, [projects, organizations]);

  // If user is logged in, redirect to dashboard
  // This needs to be AFTER all hooks are called
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Connect, Collaborate, <span className="text-primary">Create Impact</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                CollabDoor brings project organizers and potential partners together 
                to build meaningful collaborations that drive positive change.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/projects">Explore Projects</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-64 h-64 bg-secondary/20 rounded-lg transform rotate-3"></div>
                <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-primary/20 rounded-lg transform -rotate-6"></div>
                <div className="relative z-10 bg-white border p-6 rounded-lg shadow-xl">
                  <div className="w-72 h-72 bg-gradient-to-r from-primary/30 to-accent/20 rounded-lg flex items-center justify-center">
                    <div className="text-center p-6">
                      <Building className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-bold mb-2">Project Collaboration</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with partners, track progress, and achieve goals together
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How CollabDoor Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform streamlines the collaboration process, making it easy to find and manage partnerships.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Create Projects</h3>
              <p className="text-muted-foreground">
                Organizers publish projects and specify partnership needs, from funding to knowledge sharing.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Find Partners</h3>
              <p className="text-muted-foreground">
                Partners browse projects and apply with resources they can contribute to make projects succeed.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Collaborate</h3>
              <p className="text-muted-foreground">
                Connect through messaging, track project progress, and build long-term partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Projects Section */}
      

      {/* Featured Organizations Section */}
      
      
      {/* CTA Section */}
      <section className="py-16 px-4 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Collaborating?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join CollabDoor today and connect with partners who can help bring your projects to life.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">Sign Up Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent" asChild>
              <Link to="/projects">Explore Projects</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="font-bold text-xl bg-primary text-primary-foreground px-2 py-1 rounded">
                  CD
                </div>
                <span className="font-bold text-xl">CollabDoor</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Connecting project organizers with potential partners for meaningful collaboration.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link to="/projects" className="text-muted-foreground hover:text-foreground">Browse Projects</Link></li>
                <li><Link to="/partners" className="text-muted-foreground hover:text-foreground">Find Partners</Link></li>
                <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="mailto:info@collabdoor.com" className="text-muted-foreground hover:text-foreground">Email</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">LinkedIn</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Twitter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-muted text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} CollabDoor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
}