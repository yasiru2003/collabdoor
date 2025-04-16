import { useState } from "react";
import { Layout } from "@/components/layout";
import { ProjectCard } from "@/components/project-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects, useActiveProjects } from "@/hooks/use-projects-query";
import { EmptyState } from "@/components/empty-state";

const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: projects, isLoading } = useProjects();
  
  // For the explore tab, use the activeProjects hook instead
  const { data: activeProjects, isLoading: isLoadingActive } = useActiveProjects();

  const filteredProjects = projects?.filter((project) => {
    if (!searchQuery) return true;
    const searchTerm = searchQuery.toLowerCase();
    return project.title.toLowerCase().includes(searchTerm) ||
           project.description?.toLowerCase().includes(searchTerm) ||
           project.category?.toLowerCase().includes(searchTerm) ||
           project.location?.toLowerCase().includes(searchTerm);
  });

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Explore opportunities and find projects to contribute to.
          </p>
        </div>
        <Button asChild>
          <Link to="/projects/create">Create Project</Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search projects..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="explore" className="mt-8 space-y-4">
        <TabsList>
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="all">All Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="explore">
          {isLoadingActive ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[360px] rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {activeProjects && activeProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="No projects found"
                  description="Try adjusting your search or filters."
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="all">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[360px] rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {filteredProjects && filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="No projects found"
                  description="Try adjusting your search or filters."
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ProjectsPage;
