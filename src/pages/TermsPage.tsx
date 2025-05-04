
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-16 px-4 md:py-24 bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Terms and <span className="text-primary">Conditions</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Please read these terms carefully before using CollabDoor
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 px-4 md:py-24 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the CollabDoor platform, you agree to be bound by these Terms and Conditions. 
              If you disagree with any part of these terms, you may not access the service.
            </p>
            
            <h2>2. Description of Service</h2>
            <p>
              CollabDoor provides a platform for project organizers to connect with potential partners for 
              collaboration opportunities. Our services include but are not limited to project listings, 
              partnership matching, messaging services, and collaboration tools.
            </p>
            
            <h2>3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
              Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the service and for any activities 
              or actions under your password. You agree not to disclose your password to any third party.
            </p>
            
            <h2>4. User Content</h2>
            <p>
              Our service allows you to post, link, store, share and otherwise make available certain information, text, 
              graphics, videos, or other material. You are responsible for the content that you post to the service, 
              including its legality, reliability, and appropriateness.
            </p>
            <p>
              By posting content to the service, you grant us the right to use, modify, publicly perform, publicly 
              display, reproduce, and distribute such content on and through the service.
            </p>
            
            <h2>5. Prohibited Activities</h2>
            <p>You may not:</p>
            <ul>
              <li>Use the service for any illegal purpose or in violation of any local, state, national, or international law</li>
              <li>Violate or encourage others to violate the rights of third parties, including intellectual property rights</li>
              <li>Post or transmit harmful code or malware designed to interrupt, damage, or limit the functionality of any software or hardware</li>
              <li>Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity</li>
              <li>Interfere with or disrupt the service or servers or networks connected to the service</li>
            </ul>
            
            <h2>6. Intellectual Property</h2>
            <p>
              The service and its original content (excluding content provided by users), features, and functionality 
              are and will remain the exclusive property of CollabDoor and its licensors. The service is protected by 
              copyright, trademark, and other laws.
            </p>
            
            <h2>7. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
              whatsoever, including without limitation if you breach the Terms.
            </p>
            <p>
              Upon termination, your right to use the service will immediately cease. If you wish to terminate your 
              account, you may simply discontinue using the service or contact us to request account deletion.
            </p>
            
            <h2>8. Limitation of Liability</h2>
            <p>
              In no event shall CollabDoor, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access 
              to or use of or inability to access or use the service.
            </p>
            
            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing 
              to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
            
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at legal@collabdoor.com.
            </p>
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
