
import { Layout } from "@/components/layout";
import { Info } from "lucide-react";

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          <Info className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">About Us</h1>
        </div>
        
        <div className="prose prose-sm md:prose-base">
          <p className="text-muted-foreground mb-4">
            CollabDoor is a platform dedicated to fostering meaningful collaborations between organizations, project organizers, and partners.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-6">
            To create a seamless environment where impactful projects can find the right partners, and organizations can connect with opportunities that align with their goals and values.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Our Vision</h2>
          <p className="text-muted-foreground mb-6">
            We envision a world where collaboration knows no bounds, where every project has access to the resources it needs, and where partnerships drive positive change in communities worldwide.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Core Values</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Transparency in all partnerships</li>
            <li>Commitment to meaningful impact</li>
            <li>Innovation through collaboration</li>
            <li>Inclusivity and accessibility</li>
            <li>Excellence in project execution</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
