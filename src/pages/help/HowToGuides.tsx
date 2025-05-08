import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export default function HowToGuides() {
  const guides = [
    {
      id: 'create-project',
      title: 'How to Create a Project',
      description: 'Learn how to create and publish a new project on our platform.',
      image: '/placeholder.svg',
      content: (
        <>
          <h2 className="text-xl font-semibold mb-3">Creating a New Project</h2>
          <p className="mb-4">Follow these steps to create a new project:</p>
          <ol className="list-decimal pl-5 space-y-4 mb-6">
            <li>
              <strong>Navigate to Projects:</strong> From your dashboard, click on the "Projects" link in the main navigation menu.
            </li>
            <li>
              <strong>Create New Project:</strong> Click the "Create New Project" button located at the top of the Projects page.
            </li>
            <li>
              <strong>Fill out the project form:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Add a descriptive title for your project</li>
                <li>Write a detailed description of your project's goals, scope, and significance</li>
                <li>Select a relevant category for your project</li>
                <li>Specify your project's location (if applicable)</li>
                <li>Upload a cover image to make your project visually appealing</li>
                <li>Attach a project proposal document with more detailed information (optional)</li>
                <li>Select the types of partnerships you're seeking</li>
                <li>List any specific skills required for the project</li>
                <li>Set your project timeline with start and end dates</li>
              </ul>
            </li>
            <li>
              <strong>Review and publish:</strong> Review all the information you've entered, then click "Create Project" to publish it or save it as a draft.
            </li>
          </ol>
          
          <div className="bg-muted p-4 rounded-md mb-6">
            <h3 className="font-semibold mb-2">Pro Tips:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Include detailed, specific information to attract the right partners</li>
              <li>Upload a high-quality cover image (recommended size: 1200x630px)</li>
              <li>Be clear about the types of partnerships you're seeking</li>
              <li>Include realistic timelines for your project phases</li>
            </ul>
          </div>
          
          <h2 className="text-xl font-semibold mb-3">Managing Your Project</h2>
          <p className="mb-4">After creating your project, you can:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Edit project details using the "Edit" option on your project page</li>
            <li>Set up project phases to track progress</li>
            <li>Review and manage applications from potential partners</li>
            <li>Update project status as it progresses</li>
            <li>Mark the project as completed when all objectives are achieved</li>
          </ul>
        </>
      )
    },
    {
      id: 'create-organization',
      title: 'How to Create an Organization',
      description: 'Create an organization profile to collaborate on projects.',
      image: '/placeholder.svg',
      content: (
        <>
          <h2 className="text-xl font-semibold mb-3">Creating an Organization</h2>
          <p className="mb-4">Follow these steps to create a new organization:</p>
          <ol className="list-decimal pl-5 space-y-4 mb-6">
            <li>
              <strong>Navigate to Organizations:</strong> From your dashboard, click on the "Organizations" link in the main navigation.
            </li>
            <li>
              <strong>Create New Organization:</strong> Click the "Create New Organization" button.
            </li>
            <li>
              <strong>Complete the organization profile:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Enter your organization's name</li>
                <li>Write a comprehensive description about your organization</li>
                <li>Select your organization's industry</li>
                <li>Add your organization's location</li>
                <li>Specify the size of your organization</li>
                <li>Upload a logo (recommended: square format, at least 200x200px)</li>
                <li>Add your organization's website URL</li>
                <li>Include the founding year</li>
              </ul>
            </li>
            <li>
              <strong>Submit:</strong> Click "Create Organization" to complete the process.
            </li>
          </ol>
          
          <h2 className="text-xl font-semibold mb-3">Managing Your Organization</h2>
          <p className="mb-4">As an organization owner, you can:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Edit organization details</li>
            <li>Invite members and assign roles</li>
            <li>Create projects associated with your organization</li>
            <li>Review and respond to partnership requests</li>
            <li>Set up partnership interests to attract collaborators</li>
          </ul>
        </>
      )
    },
    {
      id: 'phase-tracker',
      title: 'Understanding the Phase Tracker',
      description: 'Learn how to use the project phase tracker effectively.',
      image: '/placeholder.svg',
      content: (
        <>
          <h2 className="text-xl font-semibold mb-3">What is the Phase Tracker?</h2>
          <p className="mb-4">
            The Phase Tracker is a tool designed to help you break down your project into manageable 
            stages and track progress through each phase. This creates transparency for all stakeholders
            and helps maintain project momentum.
          </p>
          
          <h2 className="text-xl font-semibold mb-3">How to Set Up Project Phases</h2>
          <ol className="list-decimal pl-5 space-y-3 mb-6">
            <li>
              <strong>Navigate to your project:</strong> Open the project you want to manage.
            </li>
            <li>
              <strong>Access the Progress Tracker tab:</strong> Click on the "Progress Tracker" tab.
            </li>
            <li>
              <strong>Add phases:</strong> Click "Add Phase" to create a new project phase.
            </li>
            <li>
              <strong>Define each phase:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Give the phase a clear, descriptive title</li>
                <li>Add a detailed description of what this phase entails</li>
                <li>Set a due date for phase completion</li>
                <li>Arrange phases in logical order</li>
              </ul>
            </li>
          </ol>
          
          <h2 className="text-xl font-semibold mb-3">Updating Phase Progress</h2>
          <p className="mb-4">As your project advances, you can update phase statuses:</p>
          <ol className="list-decimal pl-5 space-y-2 mb-6">
            <li>
              <strong>Change phase status:</strong> Click on a phase to update its status:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Not Started: Phase has not begun yet</li>
                <li>In Progress: Work is currently being done on this phase</li>
                <li>Completed: All work for this phase has been finished</li>
              </ul>
            </li>
            <li>
              <strong>Add progress notes:</strong> Click "Add Note" to document important updates, milestones, or challenges.
            </li>
            <li>
              <strong>Track completion dates:</strong> When marking a phase as complete, the system will automatically record the completion date.
            </li>
          </ol>
          
          <div className="bg-muted p-4 rounded-md mb-6">
            <h3 className="font-semibold mb-2">Who can update phases?</h3>
            <p>Phase updates can be made by:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Project owners</li>
              <li>Approved project partners</li>
            </ul>
            <p className="mt-2">This ensures that only authorized stakeholders can provide official progress updates.</p>
          </div>
          
          <h2 className="text-xl font-semibold mb-3">Best Practices for Phase Tracking</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Create clear, achievable phases with specific outcomes</li>
            <li>Set realistic timeframes for each phase</li>
            <li>Update progress regularly to keep all stakeholders informed</li>
            <li>Document challenges and solutions in progress notes</li>
            <li>Celebrate phase completions to maintain team motivation</li>
          </ul>
        </>
      )
    }
  ];

  const [activeGuide, setActiveGuide] = useState(guides[0].id);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">How-To Guides</h1>
        <p className="text-muted-foreground mb-6">
          Detailed instructions for using key features of our platform
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Topics</CardTitle>
                <CardDescription>Choose a guide to read</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  {guides.map(guide => (
                    <Button
                      key={guide.id}
                      variant={activeGuide === guide.id ? "default" : "ghost"}
                      className="justify-start rounded-none"
                      onClick={() => setActiveGuide(guide.id)}
                    >
                      {guide.title}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Guide Content */}
          <div className="w-full md:w-3/4">
            <Card>
              {guides.map(guide => (
                <div key={guide.id} className={activeGuide === guide.id ? "block" : "hidden"}>
                  <CardHeader>
                    <CardTitle>{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {guide.content}
                  </CardContent>
                </div>
              ))}
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Find answers to commonly asked questions about our platform and features.
                </p>
                <Link to="/help/faq">
                  <Button>View FAQs</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Need more help? Our support team is available to assist you.
                </p>
                <Link to="/contact">
                  <Button>Contact Us</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Watch step-by-step videos on how to use various platform features.
                </p>
                <Link to="/help/tutorials">
                  <Button>View Tutorials</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
