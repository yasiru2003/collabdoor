
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Building, Users, MapPin, Mail } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 md:py-24 bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              About <span className="text-primary">CollabDoor</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connecting project organizers with partners to create meaningful impact since 2025
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 px-4 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-6">
                CollabDoor was founded in 2025 in Colombo, Sri Lanka with a simple but powerful vision: 
                to create a platform where projects that drive positive change can easily connect with 
                partners who have the resources to help them succeed.
              </p>
              <p className="text-lg text-muted-foreground">
                What started as a small initiative to connect local nonprofits with businesses has grown into 
                a global platform facilitating collaborations across industries and sectors. Our journey has 
                been about breaking down barriers to effective partnership and creating a space where impact-driven 
                collaborations can thrive.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-secondary/20 rounded-lg transform rotate-3"></div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-primary/20 rounded-lg transform -rotate-6"></div>
              <div className="relative z-10 bg-card border p-6 rounded-lg shadow-md">
                <div className="w-full h-72 bg-gradient-to-r from-primary/30 to-accent/20 rounded-lg flex items-center justify-center">
                  <Building className="w-20 h-20 text-primary opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Mission Section */}
      <section className="py-16 px-4 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              To enable seamless collaboration that drives meaningful social, environmental, and economic impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border p-8 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Connect</h3>
              <p className="text-muted-foreground text-center">
                We connect project organizers with partners who have the resources, knowledge, and networks to help them succeed.
              </p>
            </div>
            
            <div className="bg-card border p-8 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Facilitate</h3>
              <p className="text-muted-foreground text-center">
                We provide the tools and platform needed to make collaboration efficient, transparent and impactful.
              </p>
            </div>
            
            <div className="bg-card border p-8 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Amplify</h3>
              <p className="text-muted-foreground text-center">
                We amplify the impact of projects through strategic partnerships and resource mobilization.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Team Section */}
      <section className="py-16 px-4 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the passionate individuals behind CollabDoor
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="aspect-square bg-muted/50 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="h-24 w-24 text-muted-foreground/20" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Nimal Perera</h3>
                <p className="text-primary mb-3">Founder & CEO</p>
                <p className="text-muted-foreground text-sm">
                  With over 15 years of experience in social entrepreneurship, Nimal leads our vision and strategy.
                </p>
              </div>
            </div>
            
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="aspect-square bg-muted/50 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="h-24 w-24 text-muted-foreground/20" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Amaya Silva</h3>
                <p className="text-primary mb-3">Chief Operations Officer</p>
                <p className="text-muted-foreground text-sm">
                  Amaya ensures our platform runs smoothly and partnerships are nurtured effectively.
                </p>
              </div>
            </div>
            
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="aspect-square bg-muted/50 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="h-24 w-24 text-muted-foreground/20" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Raj Fernando</h3>
                <p className="text-primary mb-3">CTO</p>
                <p className="text-muted-foreground text-sm">
                  Raj leads our technical team, building innovative solutions to make collaborations seamless.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Based in Sri Lanka Section */}
      <section className="py-16 px-4 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-48 h-48 bg-primary/20 rounded-lg"></div>
                <div className="relative z-10 bg-card border p-4 rounded-lg shadow-md">
                  <div className="w-full h-64 bg-gradient-to-r from-secondary/30 to-accent/20 rounded-lg flex flex-col items-center justify-center p-6">
                    <MapPin className="w-12 h-12 text-primary mb-4" />
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">Colombo, Sri Lanka</h3>
                      <p className="text-sm text-muted-foreground">
                        Our global headquarters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">Based in Sri Lanka</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Founded and headquartered in the vibrant city of Colombo, Sri Lanka, 
                CollabDoor is proud of its Sri Lankan heritage. Our location at the crossroads 
                of South Asia gives us a unique perspective on collaboration across diverse cultures 
                and economies.
              </p>
              <p className="text-lg text-muted-foreground">
                While our roots are in Sri Lanka, our impact extends globally through our 
                digital platform, connecting projects and partners across continents, cultures, 
                and sectors.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Journey</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Whether you're organizing a project or looking to partner with one, you can be part of our mission to create impact.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">Sign Up Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent" asChild>
              <Link to="/contact">Contact Us</Link>
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
                <li><Link to="/organizations" className="text-muted-foreground hover:text-foreground">Find Partners</Link></li>
                <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
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
    </div>
  );
}
