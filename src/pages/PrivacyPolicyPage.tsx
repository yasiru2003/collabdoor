
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-16 px-4 md:py-24 bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              How we collect, use, and protect your information
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 px-4 md:py-24 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2>Introduction</h2>
            <p>
              CollabDoor ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how 
              we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p>
              We respect your privacy and are committed to protecting it through our compliance with this policy. 
              Please read this policy carefully to understand our practices regarding your information.
            </p>
            
            <h2>Information We Collect</h2>
            <p>We collect several types of information from and about users of our platform, including:</p>
            <h3>Personal Information</h3>
            <ul>
              <li>Contact information (email address, phone number, postal address)</li>
              <li>Profile information (name, organization, professional background)</li>
              <li>Account credentials</li>
              <li>Profile photos and images</li>
              <li>Communications sent through our platform</li>
            </ul>
            
            <h3>Non-Personal Information</h3>
            <ul>
              <li>Browser and device information</li>
              <li>Usage data and activity on our platform</li>
              <li>IP address and location data</li>
              <li>Cookies and similar technologies</li>
            </ul>
            
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect about you for various purposes, including to:</p>
            <ul>
              <li>Provide, maintain, and improve our platform</li>
              <li>Process and manage your account registration</li>
              <li>Connect you with potential project partners</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our platform</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              <li>Personalize and improve your experience on our platform</li>
            </ul>
            
            <h2>Information Sharing and Disclosure</h2>
            <p>We may share your information in the following situations:</p>
            <ul>
              <li>With other users as part of the collaboration process</li>
              <li>With third-party service providers who perform services on our behalf</li>
              <li>To comply with applicable laws and regulations</li>
              <li>If we believe disclosure is necessary to protect our rights, protect your safety or the safety of others</li>
              <li>In connection with a business transaction such as a merger, acquisition, or sale of assets</li>
            </ul>
            
            <h2>Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the 
              security of any personal information we process. However, despite our safeguards, no security system is 
              impenetrable, and we cannot guarantee the security of our systems 100%.
            </p>
            
            <h2>Your Data Protection Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, such as:
            </p>
            <ul>
              <li>The right to access personal information we hold about you</li>
              <li>The right to request the correction of inaccurate personal information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to withdraw consent</li>
              <li>The right to data portability</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the contact information provided below.
            </p>
            
            <h2>Cookies and Similar Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and hold certain 
              information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            
            <h2>Children's Privacy</h2>
            <p>
              Our platform is not intended for children under the age of 18. We do not knowingly collect personal 
              information from children under 18. If you are a parent or guardian and you are aware that your child 
              has provided us with personal information, please contact us.
            </p>
            
            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last Updated" date.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy 
              Policy are effective when they are posted on this page.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@collabdoor.com</li>
              <li>Address: 123 Collaboration Avenue, Colombo 03, Sri Lanka</li>
            </ul>
            
            <p className="text-sm text-muted-foreground mt-8">Last Updated: May 1, 2025</p>
          </div>

          <div className="mt-12 text-center">
            <Button asChild>
              <Link to="/">Return to Home</Link>
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
