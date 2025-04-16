
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { mockProjects } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Building,
  ChevronLeft, 
  Clock, 
  Bookmark,
  Share
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const partnershipTypeColors = {
  monetary: "bg-green-100 text-green-800 border-green-200",
  knowledge: "bg-blue-100 text-blue-800 border-blue-200",
  skilled: "bg-purple-100 text-purple-800 border-purple-200",
  volunteering: "bg-amber-100 text-amber-800 border-amber-200",
};

const partnershipTypeLabels = {
  monetary: "💰 Monetary",
  knowledge: "📚 Knowledge",
  skilled: "🧠 Skilled",
  volunteering: "🤝 Volunteering",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const project = mockProjects.find(p => p.id === id) || mockProjects[0];

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap justify-between gap-4">
        <Button variant="ghost" className="gap-1" asChild>
          <a href="/projects">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </a>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Bookmark className="h-4 w-4" />
            <span>Save</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden mb-6">
            {project.image ? (
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/10">
                <span className="text-4xl font-bold text-primary/60">{project.title.substring(0, 2).toUpperCase()}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{project.category}</Badge>
            {project.partnershipTypes.map((type) => (
              <Badge key={type} variant="outline" className={partnershipTypeColors[type]}>
                {partnershipTypeLabels[type]}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
          
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">
                {project.organizerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              Organized by <span className="font-semibold">{project.organizerName}</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">About This Project</h2>
            <p className="mb-4">{project.description}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam, 
              nunc nisl aliquet nunc, vitae aliquam nisl nunc eu nisl. Nullam euismod, nisl eget ultricies aliquam, 
              nunc nisl aliquet nunc, vitae aliquam nisl nunc eu nisl.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">What We're Looking For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.partnershipTypes.includes("monetary") && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">💰 Monetary Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Financial contributions to help purchase equipment, hire specialized staff, and cover operational costs.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {project.partnershipTypes.includes("knowledge") && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">📚 Knowledge Sharing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Industry expertise, research data, and strategic advice to guide project development and implementation.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {project.partnershipTypes.includes("skilled") && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">🧠 Skilled Contribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Technical talent in areas such as engineering, design, or project management to help execute project deliverables.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {project.partnershipTypes.includes("volunteering") && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">🤝 Volunteering</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Hands-on support through volunteer hours to assist with community engagement, events, and general operations.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {project.requiredSkills && project.requiredSkills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Apply for Partnership</Button>
              
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Timeline</p>
                    <p className="text-muted-foreground">
                      {new Date(project.timeline.start).toLocaleDateString()} - {new Date(project.timeline.end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {project.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{project.location}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Organization</p>
                    <p className="text-muted-foreground">{project.organizerName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Partners</p>
                    <p className="text-muted-foreground">{project.partners?.length || 0} confirmed partners</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Posted</p>
                    <p className="text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="updates">
        <TabsList>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
        </TabsList>
        <TabsContent value="updates" className="space-y-4 py-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>
                    {project.organizerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{project.organizerName}</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                  <p className="text-sm mb-2">
                    We're excited to announce that we've secured initial funding for Phase 1 of the project! 
                    We're now looking for technical partners to help with implementation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>
                    {project.organizerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{project.organizerName}</span>
                    <span className="text-xs text-muted-foreground">1 week ago</span>
                  </div>
                  <p className="text-sm mb-2">
                    Project kickoff meeting scheduled for next month. We'll be reaching out to confirmed partners with details soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
