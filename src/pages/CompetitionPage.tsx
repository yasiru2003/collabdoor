
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Trophy, Award, Link as LinkIcon, Clock, Building, Users, School, Flag } from "lucide-react";
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
              Project Partnership <span className="text-primary">Competition 2025</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Showcase your organization's project and win up to LKR 50,000/- in sponsorship
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
                    <h3 className="text-lg font-bold mb-2">Sponsorship Prize</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>🥇 Monthly Winner: Up to LKR 50,000/- in sponsorship</li>
                      <li>🏅 Recognition on the CollabDoor platform</li>
                      <li>🌐 Promotional support for your project</li>
                      <li>🤝 Networking opportunities with potential partners</li>
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
                      <li><strong>Shortlist Announcement:</strong> Every 25th of the month</li>
                      <li><strong>Winner Announcement:</strong> Last day of each month</li>
                      <li><strong>Sponsorship Distribution:</strong> Within 10 days of announcement</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Who Can Apply</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li><strong>University Clubs & Societies</strong></li>
                      <li><strong>NGOs & Non-profits</strong></li>
                      <li><strong>Volunteer Organizations</strong></li>
                      <li><strong>School Clubs & Societies</strong></li>
                      <li><strong>Community Service Organizations</strong></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Flag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Winner Requirements</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>Display CollabDoor logo in promotional materials</li>
                      <li>Provide verification of organization status</li>
                      <li>Submit a post-event report with photos</li>
                      <li>Allow CollabDoor to showcase your success story</li>
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
      
      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-10 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="font-bold text-primary text-xl">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-center">Register & Submit</h3>
              <p className="text-center text-muted-foreground">
                Create an organization profile and submit your project on CollabDoor
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="font-bold text-primary text-xl">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-center">Find Partners</h3>
              <p className="text-center text-muted-foreground">
                Connect with partners through our platform to strengthen your project
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="font-bold text-primary text-xl">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-center">Get Sponsorship</h3>
              <p className="text-center text-muted-foreground">
                Win the monthly competition and receive up to LKR 50,000/- in sponsorship
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Rules & Guidelines */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Rules & Guidelines</h2>
          
          <div className="prose prose-lg max-w-none">
            <h3>Project Requirements</h3>
            <p>Projects submitted to the competition must meet the following criteria:</p>
            <ul>
              <li>The project must be organized by a university club, society, NGO, volunteer group, or school organization</li>
              <li>The organization must be verifiable with proper documentation</li>
              <li>Projects should demonstrate community impact and innovation</li>
              <li>Projects must be seeking partnerships through the CollabDoor platform</li>
              <li>Projects can be upcoming or currently in progress, but not completed</li>
            </ul>
            
            <h3>Submission Process</h3>
            <p>To submit your project, follow these steps:</p>
            <ol>
              <li>Create an organization profile on CollabDoor</li>
              <li>Navigate to the "New Project" section</li>
              <li>Fill out all required project details, including partnership needs</li>
              <li>Upload supporting materials (organization verification, project plan)</li>
              <li>Check the "Submit for Competition" option</li>
              <li>Submit your application before the deadline</li>
            </ol>
            
            <h3>Judging Criteria</h3>
            <p>Projects will be evaluated by our panel based on:</p>
            <ul>
              <li><strong>Community Impact (30%):</strong> Potential to create positive change</li>
              <li><strong>Partnership Strategy (25%):</strong> How effectively the project utilizes partnerships</li>
              <li><strong>Innovation (20%):</strong> Originality and creativity of the project</li>
              <li><strong>Feasibility (15%):</strong> Realistic goals and implementation plan</li>
              <li><strong>Organization Credibility (10%):</strong> Track record and verification</li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-2">Can we submit more than one project?</h3>
              <p className="text-muted-foreground">Yes, organizations are allowed to submit multiple projects, but only one project per organization can win in a given month.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-2">How do we verify our organization?</h3>
              <p className="text-muted-foreground">You'll need to upload documentation proving your organization's status, such as registration certificates, university affiliation letters, or official letterheads.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-2">How is the sponsorship money distributed?</h3>
              <p className="text-muted-foreground">Sponsorship funds are transferred directly to the winning organization's bank account within 10 days of the announcement, after verification of details.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-2">What kind of projects are eligible?</h3>
              <p className="text-muted-foreground">We welcome a wide range of projects including educational initiatives, community development, environmental conservation, cultural events, sports competitions, and technological innovation.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-2">What does "displaying the CollabDoor logo" entail?</h3>
              <p className="text-muted-foreground">Winners must include the CollabDoor logo in event banners, digital promotions, printed materials, and mention CollabDoor as a sponsor in public communications about the project.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-10 text-center">Success Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-muted/10 p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <School className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">University of Colombo Tech Club</h3>
                  <p className="text-sm text-muted-foreground">Innovation Summit 2024</p>
                </div>
              </div>
              <p className="italic mb-4">
                "With CollabDoor's sponsorship, we were able to host a much larger innovation summit than we initially planned. The platform also helped us connect with industry mentors who provided valuable guidance to our student participants."
              </p>
              <div className="text-sm text-muted-foreground">March 2025 Winner</div>
            </div>
            
            <div className="bg-muted/10 p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Green Earth NGO</h3>
                  <p className="text-sm text-muted-foreground">Coastal Cleanup Initiative</p>
                </div>
              </div>
              <p className="italic mb-4">
                "The sponsorship from CollabDoor not only helped us fund our coastal cleanup project but also connected us with recycling partners through their platform. We've now established a sustainable monthly cleanup program."
              </p>
              <div className="text-sm text-muted-foreground">April 2025 Winner</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Win Sponsorship for Your Project?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Don't miss this opportunity to showcase your organization's project and win up to LKR 50,000/- in sponsorship!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              {user ? (
                <Link to="/projects/new">Submit Your Project</Link>
              ) : (
                <Link to="/signup">Register Now</Link>
              )}
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" asChild>
              <Link to="/organizations">Browse Partners</Link>
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
