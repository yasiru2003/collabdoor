
import { Layout } from "@/components/layout";
import { FileText } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
        
        <div className="prose prose-sm md:prose-base">
          <p className="text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Terms</h2>
          <p className="text-muted-foreground mb-4">
            By accessing our website, you agree to be bound by these Terms of Service and agree that you are responsible for compliance with any applicable local laws.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Use License</h2>
          <p className="text-muted-foreground mb-4">
            Permission is granted to temporarily access the materials on CollabDoor's website for personal, non-commercial transitory viewing only.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. Disclaimer</h2>
          <p className="text-muted-foreground mb-4">
            The materials on CollabDoor's website are provided on an 'as is' basis. CollabDoor makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Limitations</h2>
          <p className="text-muted-foreground mb-4">
            In no event shall CollabDoor or its suppliers be liable for any damages arising out of the use or inability to use the materials on CollabDoor's website.
          </p>
        </div>
      </div>
    </Layout>
  );
}
