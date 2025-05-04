
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Trophy, Award, Link as LinkIcon, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { useAuth } from "@/hooks/use-auth";

export default function CompetitionPage() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Set deadline to 10 days from today
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 10);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();
      
      if (difference <= 0) {
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 md:py-24 bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Best Project <span className="text-primary">Competition 2025</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Showcase your innovation and win up to LKR 50,000/- in prizes
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              {user ? (
                <Button size="lg" asChild>
                  <Link to="/projects/new">Apply Now</Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link to="/login">Login to Apply</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/signup">Create Account</Link>
                  </Button>
                </>
              )}
            </div>
            
            {/* Countdown Timer */}
            <div className="bg-background rounded-xl shadow-md p-6 max-w-3xl mx-auto">
              <h3 className="text-lg font-medium mb-4 flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                Application Deadline
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{timeLeft.days}</div>
                  <div className="text-xs text-muted-foreground">Days</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{timeLeft.hours}</div>
                  <div className="text-xs text-muted-foreground">Hours</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{timeLeft.minutes}</div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{timeLeft.seconds}</div>
                  <div className="text-xs text-muted-foreground">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Competition Details */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Competition Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Prizes</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>🥇 1st Place: LKR 50,000/-</li>
                      <li>🥈 2nd Place: LKR 30,000/-</li>
                      <li>🥉 3rd Place: LKR 15,000/-</li>
                      <li>🏅 Honorable mentions: LKR 5,000/-</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <CalendarCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Key Dates</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li><strong>Application Deadline:</strong> {deadline.toLocaleDateString()}</li>
                      <li><strong>Shortlist Announcement:</strong> 30th May, 2025</li>
                      <li><strong>Final Presentations:</strong> 15th June, 2025</li>
                      <li><strong>Winners Announcement:</strong> 20th June, 2025</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Eligibility</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>Open to individual developers and teams up to 5 members</li>
                      <li>Participants must be based in Sri Lanka</li>
                      <li>Projects must be original work</li>
                      <li>Both completed and in-progress projects are eligible</li>
                      <li>All participants must create an account on CollabDoor</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <LinkIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Resources</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>All participants will receive mentorship opportunities</li>
                      <li>Access to exclusive workshops during the competition period</li>
                      <li>Networking opportunities with industry professionals</li>
                      <li>Technical support for project implementation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              {user ? (
                <Link to="/projects/new">Submit Your Project</Link>
              ) : (
                <Link to="/signup">Register Now</Link>
              )}
            </Button>
          </div>
        </div>
      </section>
      
      {/* Rules & Guidelines */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Rules & Guidelines</h2>
          
          <div className="prose prose-lg max-w-none">
            <h3>Project Requirements</h3>
            <p>Projects submitted to the competition must meet the following criteria:</p>
            <ul>
              <li>Projects must address a real-world problem or need</li>
              <li>Solutions must be innovative and demonstrate originality</li>
              <li>Technical implementation must be of high quality</li>
              <li>Projects should have clear potential for impact</li>
            </ul>
            
            <h3>Submission Process</h3>
            <p>To submit your project, follow these steps:</p>
            <ol>
              <li>Create an account on CollabDoor (if you don't have one already)</li>
              <li>Navigate to the "New Project" section</li>
              <li>Fill out all required project details</li>
              <li>Upload any supporting materials</li>
              <li>Check the "Submit for Competition" option</li>
              <li>Submit your application before the deadline</li>
            </ol>
            
            <h3>Judging Criteria</h3>
            <p>Projects will be evaluated based on:</p>
            <ul>
              <li><strong>Innovation (30%):</strong> Originality and creativity of the solution</li>
              <li><strong>Technical Implementation (25%):</strong> Quality of code and execution</li>
              <li><strong>Impact Potential (25%):</strong> Ability to solve real problems</li>
              <li><strong>Presentation (10%):</strong> Clear explanation of the project</li>
              <li><strong>User Experience (10%):</strong> Usability and interface design</li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-bold mb-2">Can I submit more than one project?</h3>
              <p className="text-muted-foreground">Yes, participants are allowed to submit up to 3 different projects to increase their chances of winning.</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-bold mb-2">Is there an entry fee?</h3>
              <p className="text-muted-foreground">No, participation in the competition is completely free.</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-bold mb-2">Can international participants join?</h3>
              <p className="text-muted-foreground">The competition is primarily for participants based in Sri Lanka. International participants can join with a Sri Lankan team lead.</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-bold mb-2">What type of projects are eligible?</h3>
              <p className="text-muted-foreground">We accept software projects, hardware prototypes, mobile applications, web applications, AI solutions, and innovative tech solutions across any industry.</p>
            </div>
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
