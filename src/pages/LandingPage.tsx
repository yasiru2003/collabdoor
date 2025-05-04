
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { Header } from "@/components/header";
import { ArrowRight, Building, CheckCircle2, MessageSquare, Trophy, Calendar, Clock, Rocket, Handshake, Users } from "lucide-react";
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
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Set deadline to 10 days from today for the competition
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 10);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();
      
      if (difference <= 0) {
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

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
                to build meaningful collaborations that drive positive change in Sri Lanka and beyond.
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

      {/* Competition Section */}
      <section className="py-16 px-4 md:py-20 bg-gradient-to-br from-accent/10 to-primary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/20 text-primary rounded-full mb-3">Limited Time</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Best Project Competition 2025</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Showcase your innovation and win up to LKR 50,000/- in prizes!
            </p>
          </div>

          {/* Competition Countdown & Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="bg-background rounded-xl shadow-md p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Application Deadline
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold">{timeLeft.days}</div>
                    <div className="text-xs text-muted-foreground">Days</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold">{timeLeft.hours}</div>
                    <div className="text-xs text-muted-foreground">Hours</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold">{timeLeft.minutes}</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold">{timeLeft.seconds}</div>
                    <div className="text-xs text-muted-foreground">Seconds</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <p>Final Presentations: June 15, 2025</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <p>Prizes: LKR 50,000 (1st), LKR 30,000 (2nd), LKR 15,000 (3rd)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="font-medium text-center">Ready to compete?</p>
              <Button size="lg" className="w-full" asChild>
                <Link to="/competition">
                  Competition Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link to="/signup">Sign Up to Apply</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* About CollabDoor Section */}
      <section className="py-16 px-4 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/20 text-primary rounded-full mb-3">About Us</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-lg mb-6 text-muted-foreground">
                Founded in 2025 in Sri Lanka, CollabDoor was created to address the gap between project creators and potential collaborators in our thriving innovation ecosystem.
              </p>
              <p className="text-lg mb-6 text-muted-foreground">
                Our platform helps connect organizations, startups, and individuals with complementary skills and resources to create meaningful impact through collaboration.
              </p>
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Handshake className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">150+ Partnerships</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Rocket className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">200+ Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">500+ Users</span>
                </div>
              </div>
              <Button asChild>
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </div>
            <div className="relative">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 -right-4 w-72 h-72 bg-accent/5 rounded-full blur-3xl"></div>
              <div className="relative z-10 bg-white border p-6 rounded-lg shadow-xl">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/10 rounded-lg flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-3xl font-bold mb-3">Our Mission</h3>
                    <p className="text-muted-foreground">
                      To empower Sri Lankan innovators by creating a collaborative ecosystem where ideas thrive and projects succeed through meaningful partnerships.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 md:py-24 bg-muted/20">
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
      {featuredProjects.length > 0 && (
        <section className="py-16 px-4 md:py-24 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Projects</h2>
                <p className="text-lg text-muted-foreground">Discover exciting collaboration opportunities</p>
              </div>
              <Button variant="outline" className="mt-4 md:mt-0" asChild>
                <Link to="/projects">View All Projects</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              
              {isLoading && (
                <>
                  <div className="border rounded-lg p-6 space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-1/2 mt-6" />
                  </div>
                  <div className="border rounded-lg p-6 space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-1/2 mt-6" />
                  </div>
                  <div className="border rounded-lg p-6 space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-1/2 mt-6" />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Organizations Section */}
      {featuredOrgs.length > 0 && (
        <section className="py-16 px-4 md:py-24 bg-muted/20">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Organizations</h2>
                <p className="text-lg text-muted-foreground">Connect with potential partners</p>
              </div>
              <Button variant="outline" className="mt-4 md:mt-0" asChild>
                <Link to="/organizations">View All Partners</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredOrgs.map((org) => (
                <div key={org.id} className="border bg-card rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gradient-to-r from-primary/30 to-accent/20 flex items-center justify-center">
                    {org.logo ? (
                      <img src={org.logo} alt={org.name} className="h-16 w-auto object-contain" />
                    ) : (
                      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">{org.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">{org.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{org.description}</p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/organizations/${org.id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoadingOrgs && (
                <>
                  <div className="border rounded-lg p-6 space-y-4">
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-1/3 mt-6 ml-auto" />
                  </div>
                  <div className="border rounded-lg p-6 space-y-4">
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-1/3 mt-6 ml-auto" />
                  </div>
                  <div className="border rounded-lg p-6 space-y-4">
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-1/3 mt-6 ml-auto" />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}
      
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
                <li><Link to="/competition" className="text-muted-foreground hover:text-foreground">Competition</Link></li>
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
