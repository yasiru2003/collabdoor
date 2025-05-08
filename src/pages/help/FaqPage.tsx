
import { Layout } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function FaqPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get("tab") || "general";

  const handleTabChange = (value: string) => {
    navigate(`/help/faq?tab=${value}`);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground mb-6">
          Find answers to the most common questions about our platform
        </p>

        <Tabs defaultValue={defaultTab} onValueChange={handleTabChange}>
          <div className="w-full overflow-auto">
            <TabsList className="mb-6 w-full max-w-3xl">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              <TabsTrigger value="profiles">User Profiles</TabsTrigger>
              <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Questions</CardTitle>
                <CardDescription>
                  Basic information about our platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is this platform about?</AccordionTrigger>
                    <AccordionContent>
                      Our platform connects organizations with partners for collaborative projects. 
                      Whether you're looking to sponsor, volunteer, mentor, or invest in projects, 
                      our platform helps you find the right opportunities and partners.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I get started?</AccordionTrigger>
                    <AccordionContent>
                      Start by creating an account and completing your profile. From there, 
                      you can create an organization, browse existing projects, or create your own project.
                      The dashboard provides easy access to all features.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is the platform free to use?</AccordionTrigger>
                    <AccordionContent>
                      The basic features of the platform are free to use. Organizations and individuals 
                      can create profiles, post projects, and connect with potential partners at no cost.
                      Premium features may be available for additional functionality.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>
                  Learn how to create and manage projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="project-1">
                    <AccordionTrigger>How do I create a new project?</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Navigate to the Projects section from the dashboard.</li>
                        <li>Click on the "Create New Project" button.</li>
                        <li>Fill out the project details form including title, description, category, and partnership types.</li>
                        <li>Upload an optional cover image and project proposal document.</li>
                        <li>Save your project. You can choose to publish it immediately or keep it as a draft.</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="project-2">
                    <AccordionTrigger>How do I edit my project details?</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Navigate to your project's detail page.</li>
                        <li>Click the "Edit" button near the project title (visible only if you're the project owner).</li>
                        <li>In the edit dialog, you can modify:
                          <ul className="list-disc pl-5 mt-2">
                            <li>Project title and description</li>
                            <li>Cover image</li>
                            <li>Project proposal document</li>
                            <li>Category and location</li>
                            <li>Partnership types</li>
                            <li>Required skills</li>
                          </ul>
                        </li>
                        <li>Click "Save Changes" when you're finished.</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="project-3">
                    <AccordionTrigger>What is the phase tracker?</AccordionTrigger>
                    <AccordionContent>
                      <p>The phase tracker is a project management tool that helps you track progress through defined stages:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Each project can be divided into multiple phases with specific goals</li>
                        <li>Phases have statuses: Not Started, In Progress, and Completed</li>
                        <li>Project owners and approved partners can update phase progress</li>
                        <li>You can add progress notes to document important updates</li>
                        <li>The phase tracker provides a visual timeline of your project's evolution</li>
                      </ul>
                      <p className="mt-2">This feature helps keep all stakeholders informed about the project's current status and progress.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="project-4">
                    <AccordionTrigger>How do I manage project applications?</AccordionTrigger>
                    <AccordionContent>
                      <p>As a project owner, you can manage applications from the "Applications" tab on your project page:</p>
                      <ol className="list-decimal pl-5 space-y-2 mt-2">
                        <li>Review applications with their partnership type and message</li>
                        <li>Approve or reject each application</li>
                        <li>Message applicants directly for more information</li>
                        <li>Once approved, the applicant becomes an official project partner</li>
                        <li>Approved partners can contribute to the project's phase updates</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Organization Management</CardTitle>
                <CardDescription>
                  Learn how to create and manage organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="org-1">
                    <AccordionTrigger>How do I create a new organization?</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Navigate to the Organizations section from the dashboard.</li>
                        <li>Click on the "Create New Organization" button.</li>
                        <li>Fill out the organization details form including:
                          <ul className="list-disc pl-5 mt-2">
                            <li>Organization name</li>
                            <li>Description</li>
                            <li>Industry type</li>
                            <li>Location and size</li>
                            <li>Optional logo and website</li>
                          </ul>
                        </li>
                        <li>Submit the form to create your organization.</li>
                        <li>You will automatically become the owner of this organization.</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="org-2">
                    <AccordionTrigger>How do I edit organization details?</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Navigate to your organization's detail page.</li>
                        <li>Click the "Edit Organization" button (visible only if you're an owner or admin).</li>
                        <li>Update any details including name, description, logo, industry, location, etc.</li>
                        <li>Save your changes.</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="org-3">
                    <AccordionTrigger>How do I invite members to my organization?</AccordionTrigger>
                    <AccordionContent>
                      <p>You can add members to your organization through the Members tab:</p>
                      <ol className="list-decimal pl-5 space-y-2 mt-2">
                        <li>Navigate to your organization's detail page.</li>
                        <li>Select the "Members" tab.</li>
                        <li>Click "Invite Member" button.</li>
                        <li>Enter the user's email address and select their role.</li>
                        <li>Send the invitation.</li>
                      </ol>
                      <p className="mt-2">Alternatively, users can request to join your organization, and you can approve these requests from the Requests tab.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Profile Management</CardTitle>
                <CardDescription>
                  Learn how to manage your personal profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="profile-1">
                    <AccordionTrigger>How do I edit my profile information?</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Navigate to your Profile page by clicking your avatar in the top right.</li>
                        <li>Click the "Edit Profile" button.</li>
                        <li>Update your information including:
                          <ul className="list-disc pl-5 mt-2">
                            <li>Profile picture</li>
                            <li>Display name</li>
                            <li>Bio/About me</li>
                            <li>Skills</li>
                            <li>Contact information</li>
                          </ul>
                        </li>
                        <li>Save your changes.</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="profile-2">
                    <AccordionTrigger>How do I change my account settings?</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Go to the Settings page from the main navigation.</li>
                        <li>Under "Account Settings," you can:
                          <ul className="list-disc pl-5 mt-2">
                            <li>Change your email address</li>
                            <li>Update your password</li>
                            <li>Manage notification preferences</li>
                          </ul>
                        </li>
                        <li>Save any changes you make.</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partnerships" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Partnerships & Applications</CardTitle>
                <CardDescription>
                  Learn about forming partnerships and applying to projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="partner-1">
                    <AccordionTrigger>How do I apply to a project?</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Browse projects or search for specific ones of interest.</li>
                        <li>Navigate to the project detail page.</li>
                        <li>Click the "Apply" button near the top of the page.</li>
                        <li>Select your partnership type from the available options.</li>
                        <li>Choose which organization you're applying on behalf of (if applicable).</li>
                        <li>Write a message explaining why you'd be a good partner.</li>
                        <li>Submit your application.</li>
                        <li>The project owner will review your application and approve or reject it.</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="partner-2">
                    <AccordionTrigger>What are the different partnership types?</AccordionTrigger>
                    <AccordionContent>
                      <p>Our platform supports various partnership types:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Sponsor</strong> - Provides financial support for the project</li>
                        <li><strong>Volunteer</strong> - Contributes time and effort without financial compensation</li>
                        <li><strong>Partner</strong> - Collaborates on equal footing with mutual benefits</li>
                        <li><strong>Mentor</strong> - Provides guidance and expertise to the project team</li>
                        <li><strong>Advisor</strong> - Offers specialized knowledge but with less involvement than a mentor</li>
                        <li><strong>Investor</strong> - Provides funding in exchange for potential returns</li>
                      </ul>
                      <p className="mt-2">Project creators specify which partnership types they're seeking for each project.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="partner-3">
                    <AccordionTrigger>How do I track my applications?</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Navigate to the Partners section from the dashboard.</li>
                        <li>View the "My Applications" tab to see all projects you've applied to.</li>
                        <li>Each application shows its current status:
                          <ul className="list-disc pl-5 mt-2">
                            <li>Pending - Waiting for review</li>
                            <li>Approved - You're now a partner on the project</li>
                            <li>Rejected - Your application wasn't accepted</li>
                          </ul>
                        </li>
                        <li>For approved applications, you can access the project and contribute to its progress.</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
