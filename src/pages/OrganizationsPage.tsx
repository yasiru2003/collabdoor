
import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building, Filter, Plus, Search, UsersRound } from "lucide-react";

// Sample organization data for display
const sampleOrganizations = [
  {
    id: "1",
    name: "Eco Solutions",
    description: "A nonprofit focused on environmental sustainability projects",
    logo: "",
    industry: "nonprofit",
    location: "San Francisco, CA",
    website: "https://ecosolutions.org",
    size: "11-50",
    foundedYear: "2015",
    memberCount: 24,
    projectCount: 8
  },
  {
    id: "2",
    name: "Tech for Good",
    description: "Using technology to solve social challenges",
    logo: "",
    industry: "technology",
    location: "Boston, MA",
    website: "https://techforgood.org",
    size: "1-10",
    foundedYear: "2018",
    memberCount: 12,
    projectCount: 5
  },
  {
    id: "3",
    name: "Community Builders",
    description: "Building stronger communities through volunteer initiatives",
    logo: "",
    industry: "nonprofit",
    location: "Austin, TX",
    website: "https://communitybuilders.org",
    size: "51-200",
    foundedYear: "2010",
    memberCount: 67,
    projectCount: 15
  }
];

function OrganizationCard({ organization }: { organization: any }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={organization.logo} alt={organization.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {organization.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{organization.name}</CardTitle>
            <CardDescription>{organization.location}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground mb-3">{organization.description}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{organization.industry}</Badge>
          <Badge variant="outline">{organization.size} employees</Badge>
          <Badge variant="outline">Founded {organization.foundedYear}</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <UsersRound className="h-4 w-4" />
            <span>{organization.memberCount} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span>{organization.projectCount} projects</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm">View Details</Button>
        <Button size="sm">Join Organization</Button>
      </CardFooter>
    </Card>
  );
}

export default function OrganizationsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please login to view organizations",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/organizations" } });
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Organizations</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                className="pl-8 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/organizations/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Organization
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-organizations">My Organizations</TabsTrigger>
            <TabsTrigger value="joined">Joined</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleOrganizations.map((org) => (
                <OrganizationCard key={org.id} organization={org} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="my-organizations">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Organizations Created Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create your first organization to start collaborating with others on projects
              </p>
              <Button onClick={() => navigate("/organizations/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="joined">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersRound className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">You Haven't Joined Any Organizations</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Join organizations to collaborate on projects and connect with other members
              </p>
              <Button onClick={() => navigate("/organizations")}>
                Discover Organizations
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
