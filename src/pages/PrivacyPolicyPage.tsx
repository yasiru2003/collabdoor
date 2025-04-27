
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/5">
        <section className="py-12 px-4 md:py-16 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-center">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-center mb-0">
              Last Updated: April 27, 2025
            </p>
          </div>
        </section>
        
        <section className="py-12 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <h2>1. Introduction</h2>
              <p>
                CollabDoor ("we," "our," or "us") is committed to protecting the privacy of our users. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website and use our collaboration platform.
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing and using the CollabDoor platform, 
                you acknowledge that you have read and understand this Privacy Policy.
              </p>
              
              <h2>2. Information We Collect</h2>
              <p>We collect several types of information from and about users of our platform:</p>
              
              <h3>Personal Information</h3>
              <ul>
                <li>Contact information (such as name, email address, and phone number)</li>
                <li>Profile information (such as biography, professional background, skills, and profile picture)</li>
                <li>Login credentials</li>
                <li>Communication preferences</li>
              </ul>
              
              <h3>Organization Information</h3>
              <ul>
                <li>Organization name, description, and logo</li>
                <li>Industry, location, and size</li>
                <li>Contact information for organizational representatives</li>
              </ul>
              
              <h3>Project Information</h3>
              <ul>
                <li>Project details, descriptions, and requirements</li>
                <li>Partnership types and needs</li>
                <li>Project updates and communications</li>
              </ul>
              
              <h3>Usage Information</h3>
              <ul>
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and features used</li>
                <li>Time spent on the platform</li>
                <li>Referring websites</li>
              </ul>
              
              <h2>3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our platform</li>
                <li>Create and manage your account</li>
                <li>Process and facilitate collaborations between users</li>
                <li>Communicate with you about platform updates, features, and support</li>
                <li>Respond to your inquiries and requests</li>
                <li>Monitor and analyze platform usage and trends</li>
                <li>Detect, prevent, and address technical issues and security risks</li>
                <li>Comply with legal obligations</li>
              </ul>
              
              <h2>4. Information Sharing and Disclosure</h2>
              <p>We may share your information with:</p>
              <ul>
                <li>Other platform users as necessary to facilitate collaborations</li>
                <li>Service providers who perform services on our behalf</li>
                <li>Legal authorities when required by law or to protect our rights</li>
                <li>Potential buyers in the event of a business transaction (e.g., merger or acquisition)</li>
              </ul>
              
              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information. 
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee its absolute security.
              </p>
              
              <h2>6. Your Rights and Choices</h2>
              <p>Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul>
                <li>Access and view the personal information we hold about you</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your personal information in certain circumstances</li>
                <li>Restrict or object to certain processing of your information</li>
                <li>Request portability of your information</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
              
              <h2>7. Cookies and Similar Technologies</h2>
              <p>
                We use cookies and similar technologies to enhance your experience on our platform. 
                You can manage your cookie preferences through your browser settings. However, 
                disabling certain cookies may limit your ability to use some features of our platform.
              </p>
              
              <h2>8. Children's Privacy</h2>
              <p>
                Our platform is not intended for children under 16 years of age. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a child, 
                please contact us immediately.
              </p>
              
              <h2>9. International Data Transfers</h2>
              <p>
                Your information may be transferred to, stored, and processed in countries other than your country 
                of residence. We ensure appropriate safeguards are in place to protect your information when transferred internationally.
              </p>
              
              <h2>10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. The updated version will be indicated by an 
                updated "Last Updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
              
              <h2>11. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our privacy practices, 
                please contact us at:
              </p>
              <p>
                Email: privacy@collabdoor.com<br />
                Address: 123 Collaboration Avenue, Suite 456, Innovation City, IN 78901
              </p>
            </div>
            
            <div className="mt-12 flex justify-center">
              <Button asChild variant="outline">
                <Link to="/contact">Contact Us</Link>
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
