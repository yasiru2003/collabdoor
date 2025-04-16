
import { useState } from "react";
import { Layout } from "@/components/layout";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List, Plus, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useProjects, useUserProjects } from "@/hooks/use-supabase-query";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [partnershipFilter, setPartnershipFilter] = useState("all");
  
  const { user } = useAuth();
  const { data: allProjects, isLoading: isLoadingProjects } = useProjects();
  const { data: userProjects, isLoading: isLoadingUserProjects } = useUserProjects(user?.id);
  const navigate = useNavigate();

  // Filter and search projects
  const filterProjects = (projects = []) => {
    return projects.filter(project => {
      // Search filter
      const matchesSearch = 
        !searchQuery || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = 
        categoryFilter === "all" || 
        project.category === categoryFilter;
      
      // Partnership type filter
      const matchesPartnershipType = 
        partnershipFilter === "all" || 
        (project.partnership_types && project.partnership_types.includes(partnershipFilter));
      
      return matchesSearch && matchesCategory && matchesPartnershipType;
    });
  };

  const filteredProjects = filterProjects(allProjects);
  const filteredUserProjects = filterProjects(userProjects);

  // Add a function to handle tab navigation
  const navigateToTab = (tabValue: string) => {
    const tabElement = document.querySelector(`[data-value="${tabValue}"]`);
    if (tabElement) {
      // Use dispatch event instead of click()
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      tabElement.dispatchEvent(clickEvent);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Explore collaboration opportunities or manage your projects</p>
        </div>
        <Button className="gap-1 self-start" onClick={() => navigate("/projects/new")}>
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </div>

      <Tabs defaultValue="explore" className="mb-6">
        <TabsList>
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col md:flex-row gap-4 my-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Environmental">Environmental</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
            <Select value={partnershipFilter} onValueChange={setPartnershipFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Partnership Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="monetary">Monetary</SelectItem>
                <SelectItem value="knowledge">Knowledge</SelectItem>
                <SelectItem value="skilled">Skilled</SelectItem>
                <SelectItem value="volunteering">Volunteering</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode("grid")}
                className={cn("rounded-none", viewMode === "grid" ? "bg-muted" : "")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode("list")}
                className={cn("rounded-none", viewMode === "list" ? "bg-muted" : "")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="explore" className="mt-0">
          {isLoadingProjects ? (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects found matching your filters.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-projects" className="mt-0">
          {isLoadingUserProjects ? (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredUserProjects?.length > 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredUserProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You haven't created any projects yet.</p>
              <Button className="mt-4" onClick={() => navigate("/projects/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="applied" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">You haven't applied to any projects yet.</p>
            <Button className="mt-4" variant="outline" onClick={() => navigateToTab("explore")}>
              Browse Projects
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">You haven't saved any projects yet.</p>
            <Button className="mt-4" variant="outline" onClick={() => navigateToTab("explore")}>
              Browse Projects
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
