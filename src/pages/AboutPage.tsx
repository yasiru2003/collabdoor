
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/5">
        {/* Hero Section */}
        <section className="py-16 px-4 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-center">
              About <span className="text-primary">CollabDoor</span>
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
              Connecting innovators, organizations, and individuals to create impactful collaborations.
            </p>
          </div>
        </section>
        
        {/* Our Story */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p>
                CollabDoor was founded in 2024 with a simple mission: to break down barriers between those with ideas and those with resources.
                We believe that meaningful change happens when diverse partners come together to solve problems.
              </p>
              <p>
                Our platform emerged from observing the challenges that project creators face in finding the right partners,
                and the difficulties that potential collaborators encounter in discovering worthwhile initiatives.
              </p>
              <p>
                Today, CollabDoor serves as a bridge connecting organizations of all sizes, skilled professionals, 
                volunteers, and funders with projects that align with their interests and capabilities.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Mission */}
        <section className="py-16 px-4 bg-muted/10">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <div className="prose prose-lg max-w-none">
              <p>
                At CollabDoor, we're committed to creating a world where great ideas don't fail due to lack of resources or connections.
                We envision a collaborative ecosystem where:
              </p>
              <ul>
                <li>Project creators can easily find the perfect partners to bring their visions to life</li>
                <li>Organizations can discover meaningful initiatives that align with their values and capabilities</li>
                <li>Individuals can contribute their skills to projects they believe in</li>
                <li>Connections formed lead to lasting partnerships that extend beyond single projects</li>
              </ul>
              <p>
                We measure our success not just by the number of connections made, but by the real-world 
                impact of the collaborations we facilitate.
              </p>
            </div>
          </div>
        </section>
        
        {/* Team */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">Our Team</h2>
            <p className="text-lg text-muted-foreground mb-8">
              CollabDoor is powered by a diverse team of professionals passionate about connecting people and ideas.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">JD</span>
                </div>
                <h3 className="font-semibold text-xl">Jane Doe</h3>
                <p className="text-muted-foreground">Founder & CEO</p>
              </div>
              
              {/* Team Member 2 */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">JS</span>
                </div>
                <h3 className="font-semibold text-xl">John Smith</h3>
                <p className="text-muted-foreground">CTO</p>
              </div>
              
              {/* Team Member 3 */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">AJ</span>
                </div>
                <h3 className="font-semibold text-xl">Alex Johnson</h3>
                <p className="text-muted-foreground">Head of Partnerships</p>
              </div>
            </div>
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
          <p className="text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} CollabDoor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
