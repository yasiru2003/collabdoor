import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-16 px-4 md:py-24 bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              About <span className="text-primary">Us</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn more about CollabDoor and our mission
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-8">
                CollabDoor was founded with a vision to connect project organizers with potential partners,
                fostering meaningful collaborations that drive positive change. We believe that by bringing
                together diverse skills, resources, and perspectives, we can unlock innovation and create
                impactful solutions to global challenges.
              </p>
              <p className="text-lg text-muted-foreground">
                Our platform is designed to streamline the collaboration process, making it easy for
                individuals and organizations to find and manage partnerships. Whether you're seeking
                funding, expertise, or simply a shared vision, CollabDoor is here to help you build
                meaningful connections and achieve your goals.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="About Us"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              To empower project organizers and potential partners to connect, collaborate, and create
              impactful solutions that address global challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <h3 className="text-xl font-bold mb-2">Connect</h3>
              <p className="text-muted-foreground">
                We connect project organizers with potential partners, fostering meaningful collaborations
                that drive positive change.
              </p>
            </div>

            <div className="text-center p-6">
              <h3 className="text-xl font-bold mb-2">Collaborate</h3>
              <p className="text-muted-foreground">
                Our platform streamlines the collaboration process, making it easy for individuals and
                organizations to find and manage partnerships.
              </p>
            </div>

            <div className="text-center p-6">
              <h3 className="text-xl font-bold mb-2">Create Impact</h3>
              <p className="text-muted-foreground">
                We believe that by bringing together diverse skills, resources, and perspectives, we can
                unlock innovation and create impactful solutions to global challenges.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 px-4 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We are a team of passionate individuals dedicated to making a difference in the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <img
                src="https://images.unsplash.com/photo-1535713875002-ce1ef28d04e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="Team Member"
                className="rounded-full w-32 h-32 mx-auto mb-4"
              />
              <h3 className="text-xl font-bold mb-2">John Doe</h3>
              <p className="text-muted-foreground">CEO</p>
            </div>

            <div className="text-center p-6">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1061&q=80"
                alt="Team Member"
                className="rounded-full w-32 h-32 mx-auto mb-4"
              />
              <h3 className="text-xl font-bold mb-2">Jane Smith</h3>
              <p className="text-muted-foreground">CTO</p>
            </div>

            <div className="text-center p-6">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="Team Member"
                className="rounded-full w-32 h-32 mx-auto mb-4"
              />
              <h3 className="text-xl font-bold mb-2">Emily Johnson</h3>
              <p className="text-muted-foreground">CMO</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Timeline Section */}
      <section className="py-16 px-4 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A brief timeline of our key milestones and achievements
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-muted"></div>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="w-1/2 text-right pr-4">
                  <h3 className="text-xl font-bold mb-1">2020: Founding</h3>
                  <p className="text-muted-foreground">CollabDoor was founded with a vision to connect project organizers with potential partners.</p>
                </div>
                <div className="w-1/2 pl-4">
                  <div className="w-3 h-3 bg-primary rounded-full relative"></div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-1/2 text-right pr-4">
                  <h3 className="text-xl font-bold mb-1">2021: Platform Launch</h3>
                  <p className="text-muted-foreground">We launched our platform, providing a space for individuals and organizations to find and manage partnerships.</p>
                </div>
                <div className="w-1/2 pl-4">
                  <div className="w-3 h-3 bg-primary rounded-full relative"></div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-1/2 text-right pr-4">
                  <h3 className="text-xl font-bold mb-1">2022: 10,000+ Users</h3>
                  <p className="text-muted-foreground">Our platform reached 10,000+ users, connecting project organizers with potential partners.</p>
                </div>
                <div className="w-1/2 pl-4">
                  <div className="w-3 h-3 bg-primary rounded-full relative"></div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-1/2 text-right pr-4">
                  <h3 className="text-xl font-bold mb-1">2023: Global Expansion</h3>
                  <p className="text-muted-foreground">We expanded our platform globally, connecting project organizers with potential partners from around the world.</p>
                </div>
                <div className="w-1/2 pl-4">
                  <div className="w-3 h-3 bg-primary rounded-full relative"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join Us?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join CollabDoor today and become part of a community of passionate individuals and organizations
            dedicated to making a difference in the world.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
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
    </div>
  );
}
