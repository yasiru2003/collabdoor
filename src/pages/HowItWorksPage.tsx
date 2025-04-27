
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { 
  Search, 
  UserPlus, 
  Handshake, 
  CheckCircle, 
  Briefcase, 
  Users 
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/5">
        {/* Hero Section */}
        <section className="py-16 px-4 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-center">
              How <span className="text-primary">CollabDoor</span> Works
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
              Our platform makes it simple to find the right partners and bring your ideas to life
            </p>
          </div>
        </section>
        
        {/* Steps */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Your Journey to Successful Collaboration</h2>
            
            <div className="space-y-16">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2 order-2 md:order-1">
                  <div className="bg-primary/10 text-primary inline-flex p-3 rounded-full mb-4">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">1. Create an Account</h3>
                  <p className="text-muted-foreground mb-4">
                    Sign up as an individual or organization. Complete your profile with relevant skills, 
                    interests, and capabilities to help others find you.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/signup">Sign Up Now</Link>
                  </Button>
                </div>
                <div className="md:w-1/2 bg-muted/20 rounded-xl p-6 order-1 md:order-2">
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <UserPlus className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <Briefcase className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="bg-primary/10 text-primary inline-flex p-3 rounded-full mb-4">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">2. Create or Find a Project</h3>
                  <p className="text-muted-foreground mb-4">
                    Initiate your own project and specify the types of partnerships you need, or browse 
                    existing projects that align with your interests and capabilities.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/browse/projects">Browse Projects</Link>
                  </Button>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2 order-2 md:order-1">
                  <div className="bg-primary/10 text-primary inline-flex p-3 rounded-full mb-4">
                    <Handshake className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">3. Connect and Collaborate</h3>
                  <p className="text-muted-foreground mb-4">
                    Apply to join projects or approve partnership applications. Connect through our 
                    messaging system to discuss details and formalize your collaboration.
                  </p>
                </div>
                <div className="md:w-1/2 bg-muted/20 rounded-xl p-6 order-1 md:order-2">
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <Handshake className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <CheckCircle className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="bg-primary/10 text-primary inline-flex p-3 rounded-full mb-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">4. Manage Your Collaboration</h3>
                  <p className="text-muted-foreground mb-4">
                    Track progress, share updates, and coordinate activities with your partners through 
                    our collaboration tools. Update project phases and celebrate milestones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Partnership Types */}
        <section className="py-16 px-4 bg-muted/10">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Types of Partnerships</h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              CollabDoor supports various types of collaborations to meet the diverse needs of projects
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center mb-4">
                  <span className="text-xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Monetary Partnership</h3>
                <p className="text-muted-foreground">
                  Financial support for projects, ranging from full funding to smaller contributions 
                  for specific project components.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                  <span className="text-xl">📚</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Knowledge Partnership</h3>
                <p className="text-muted-foreground">
                  Sharing expertise, research, insights, or educational resources to support 
                  project development and execution.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
                  <span className="text-xl">🧠</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Skilled Partnership</h3>
                <p className="text-muted-foreground">
                  Contributing professional skills such as design, development, legal advice, 
                  marketing expertise, or other specialized capabilities.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <span className="text-xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Volunteering Partnership</h3>
                <p className="text-muted-foreground">
                  Providing hands-on support through volunteer time and effort to help 
                  implement project activities.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border md:col-span-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <span className="text-xl">✨</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Partnership Types</h3>
                <p className="text-muted-foreground">
                  Project organizers can define custom partnership types specific to their project needs, 
                  allowing for unique collaboration opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* For Different Users */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">For Every Type of User</h2>
            
            <div className="space-y-12">
              <div className="bg-muted/10 p-8 rounded-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold">Project Creators</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Create and publish projects with detailed partnership needs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Review and approve partnership applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Track project progress and manage collaborations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Create custom partnership types specific to your needs</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-muted/10 p-8 rounded-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold">Organizations</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Create an organizational profile to showcase capabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Find projects aligned with your CSR and impact goals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Manage multiple partnerships and team members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Build a reputation and network through successful collaborations</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-muted/10 p-8 rounded-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold">Individual Partners</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Create a profile highlighting your skills and interests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Apply to join projects that match your capabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Build your portfolio through meaningful collaborations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span>Connect with other professionals and organizations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join CollabDoor today and start connecting with partners who share your vision.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/signup">Create an Account</Link>
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
