
import { Layout } from "@/components/layout";
import { HelpCircle } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">How It Works</h1>
        </div>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">For Project Organizers</h2>
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">1. Create Your Project</h3>
                <p className="text-muted-foreground">Define your project's goals, requirements, and the types of partnerships you're seeking.</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">2. Connect with Partners</h3>
                <p className="text-muted-foreground">Review applications from potential partners and choose the best fit for your project.</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">3. Manage Collaboration</h3>
                <p className="text-muted-foreground">Use our tools to track progress, communicate with partners, and ensure project success.</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">For Partners</h2>
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">1. Browse Projects</h3>
                <p className="text-muted-foreground">Explore projects that match your expertise, resources, and interests.</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">2. Apply to Projects</h3>
                <p className="text-muted-foreground">Submit applications highlighting what you can contribute to projects.</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">3. Collaborate</h3>
                <p className="text-muted-foreground">Work together with project organizers to achieve shared goals.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
