
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { File, FileText, HelpCircle, Info } from "lucide-react";

export default function HelpCenter() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers, guides, and resources to help you make the most of our platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions about our platform
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 mb-6">
                <li>• How to create and manage projects</li>
                <li>• Organization setup and administration</li>
                <li>• User profiles and account settings</li>
                <li>• Partnership applications and management</li>
              </ul>
              <Link to="/help/faq" className="mt-auto block">
                <Button className="w-full">View FAQs</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <File className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>How-To Guides</CardTitle>
              <CardDescription>
                Step-by-step instructions for platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 mb-6">
                <li>• Creating and editing projects</li>
                <li>• Setting up organizations</li>
                <li>• Using the phase tracker effectively</li>
                <li>• Managing project applications</li>
              </ul>
              <Link to="/help/guides" className="mt-auto block">
                <Button className="w-full">View Guides</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Support</CardTitle>
              <CardDescription>
                Get in touch with our support team for assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Our support team is here to help
                with any questions or issues you might have.
              </p>
              <Link to="/contact" className="mt-auto block">
                <Button className="w-full">Contact Support</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Popular Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Getting Started
              </h3>
              <p className="mb-3">New to our platform? Check out these resources:</p>
              <ul className="space-y-2 list-disc pl-5 mb-4">
                <li><Link to="/help/guides" className="text-primary hover:underline">Creating your first project</Link></li>
                <li><Link to="/help/guides" className="text-primary hover:underline">Setting up your organization profile</Link></li>
                <li><Link to="/help/guides" className="text-primary hover:underline">Understanding partnership types</Link></li>
                <li><Link to="/help/faq" className="text-primary hover:underline">Platform basics FAQ</Link></li>
              </ul>
            </div>
            
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Advanced Features
              </h3>
              <p className="mb-3">Ready to get more from the platform? Explore:</p>
              <ul className="space-y-2 list-disc pl-5 mb-4">
                <li><Link to="/help/guides" className="text-primary hover:underline">Using the project phase tracker</Link></li>
                <li><Link to="/help/guides" className="text-primary hover:underline">Managing multiple organizations</Link></li>
                <li><Link to="/help/faq" className="text-primary hover:underline">Partnership application strategies</Link></li>
                <li><Link to="/help/guides" className="text-primary hover:underline">Project completion and reviews</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
