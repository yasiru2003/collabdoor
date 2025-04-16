
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { PartnerCard } from "@/components/partner-card";
import { mockProjects, mockOrganizations } from "@/data/mockData";
import { Plus } from "lucide-react";
import { UserRole } from "@/types";

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>("partner");
  
  // In a real app, this would come from authentication context
  useEffect(() => {
    // Simulate role change for demo
    const timer = setTimeout(() => {
      setRole("partner");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your collaborations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Projects</CardTitle>
            <CardDescription>
              {role === "organizer" ? "Your active projects" : "Projects you're involved in"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{role === "organizer" ? 2 : 3}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Partners</CardTitle>
            <CardDescription>
              {role === "organizer" ? "Organizations partnering with you" : "Your partnership applications"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{role === "organizer" ? 5 : 4}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Messages</CardTitle>
            <CardDescription>Unread messages requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={role === "organizer" ? "my-projects" : "recommended"} className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            {role === "organizer" ? (
              <>
                <TabsTrigger value="my-projects">My Projects</TabsTrigger>
                <TabsTrigger value="interested-partners">Interested Partners</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="applied">Applied Projects</TabsTrigger>
              </>
            )}
          </TabsList>

          {role === "organizer" && (
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Button>
          )}
        </div>

        {role === "organizer" ? (
          <>
            <TabsContent value="my-projects" className="mt-0">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockProjects.slice(0, 3).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="interested-partners" className="mt-0">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockOrganizations.slice(0, 4).map((org) => (
                  <PartnerCard 
                    key={org.id} 
                    organization={org} 
                    skills={["Business Development", "Marketing", "Fundraising"]} 
                  />
                ))}
              </div>
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="recommended" className="mt-0">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockProjects.slice(1, 5).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="applied" className="mt-0">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockProjects.slice(0, 2).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div>
                  <p className="text-sm"><span className="font-medium">Tech Innovators</span> applied to your <span className="font-medium">Clean Water Initiative</span> project</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div>
                  <p className="text-sm"><span className="font-medium">Sarah Johnson</span> sent you a message about <span className="font-medium">EdTech for All</span></p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div>
                  <p className="text-sm">Your application to <span className="font-medium">Health Data Analytics Platform</span> was viewed</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
