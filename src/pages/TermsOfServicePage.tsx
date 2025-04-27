
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/5">
        <section className="py-12 px-4 md:py-16 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-center">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-center mb-0">
              Last Updated: April 27, 2025
            </p>
          </div>
        </section>
        
        <section className="py-12 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                Welcome to CollabDoor. By accessing and using the CollabDoor platform, you agree to be bound by these 
                Terms of Service ("Terms"), our Privacy Policy, and any other policies or guidelines referenced herein. 
                If you do not agree to these Terms, please do not use our platform.
              </p>
              
              <h2>2. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Any changes will be effective immediately 
                upon posting the updated Terms on our platform. Your continued use of CollabDoor after such changes 
                constitutes your acceptance of the new Terms.
              </p>
              
              <h2>3. Account Registration and Security</h2>
              <p>
                To use certain features of our platform, you may be required to create an account. You are responsible for:
              </p>
              <ul>
                <li>Providing accurate and complete information during registration</li>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason 
                at our sole discretion.
              </p>
              
              <h2>4. User Conduct</h2>
              <p>
                When using CollabDoor, you agree not to:
              </p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others, including intellectual property rights</li>
                <li>Post false, misleading, or fraudulent content</li>
                <li>Harass, threaten, or intimidate other users</li>
                <li>Distribute spam, malware, or other harmful content</li>
                <li>Attempt to gain unauthorized access to the platform or other users' accounts</li>
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Interfere with the proper functioning of the platform</li>
              </ul>
              
              <h2>5. User Content</h2>
              <p>
                You retain ownership of any content you post on CollabDoor, including project descriptions, 
                messages, and profile information ("User Content"). By posting User Content, you grant us a 
                non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, 
                and display such content for the purpose of operating and improving our platform.
              </p>
              <p>
                You are solely responsible for your User Content and its accuracy. We reserve the right to 
                remove any User Content that violates these Terms or that we find objectionable for any reason.
              </p>
              
              <h2>6. Collaborations and Partnerships</h2>
              <p>
                CollabDoor facilitates connections between project organizers and potential collaborators. However:
              </p>
              <ul>
                <li>We do not guarantee the success or outcome of any collaboration</li>
                <li>We are not a party to any agreement between users</li>
                <li>We are not responsible for the conduct of any users or the quality of their contributions</li>
                <li>We do not endorse any project, organization, or individual on our platform</li>
              </ul>
              <p>
                Users are solely responsible for negotiating and formalizing their collaboration agreements, 
                including scope, deliverables, timelines, and compensation.
              </p>
              
              <h2>7. Intellectual Property Rights</h2>
              <p>
                CollabDoor and its content, features, and functionality are owned by us and are protected by copyright, 
                trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create 
                derivative works of, publicly display, or use any content from our platform without our prior written consent.
              </p>
              
              <h2>8. Disclaimer of Warranties</h2>
              <p>
                THE COLLABDOOR PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, 
                INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT ANY 
                DEFECTS WILL BE CORRECTED.
              </p>
              
              <h2>9. Limitation of Liability</h2>
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL COLLABDOOR, ITS OFFICERS, DIRECTORS, 
                EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
                OR EXEMPLARY DAMAGES, INCLUDING DAMAGES FOR LOSS OF PROFITS, GOODWILL, DATA, OR OTHER INTANGIBLE LOSSES, 
                ARISING OUT OF OR RELATING TO YOUR USE OF THE PLATFORM.
              </p>
              
              <h2>10. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless CollabDoor and its officers, directors, employees, 
                and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable 
                attorneys' fees, arising out of or in any way connected with your access to or use of the platform, 
                your violation of these Terms, or your violation of any third-party rights.
              </p>
              
              <h2>11. Governing Law and Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], 
                without regard to its conflict of law provisions. Any dispute arising from or relating to these 
                Terms or your use of the platform shall be resolved through binding arbitration in accordance with 
                the rules of [Arbitration Association], except that each party retains the right to seek injunctive 
                or other equitable relief in a court of competent jurisdiction.
              </p>
              
              <h2>12. Severability</h2>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions 
                shall remain in full force and effect.
              </p>
              
              <h2>13. Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy and any other policies or guidelines referenced herein, 
                constitute the entire agreement between you and CollabDoor regarding your use of the platform.
              </p>
              
              <h2>14. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                Email: legal@collabdoor.com<br />
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
