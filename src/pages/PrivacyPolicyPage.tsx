
import { Layout } from "@/components/layout";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-sm md:prose-base">
          <p className="text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <p className="text-muted-foreground mb-4">
            We collect information that you provide directly to us, including when you create an account, update your profile, or communicate with other users.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Information Sharing</h2>
          <p className="text-muted-foreground mb-4">
            We do not share your personal information except as described in this Privacy Policy.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Security</h2>
          <p className="text-muted-foreground mb-4">
            We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.
          </p>
        </div>
      </div>
    </Layout>
  );
}
