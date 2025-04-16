
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { ProjectCard } from "@/components/project-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, SearchX, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects, useActiveProjects, useUserProjects } from "@/hooks/use-projects-query";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { data: projects, isLoading } = useProjects();
  const { user } = useAuth();
  
  // For the explore tab, use the activeProjects hook instead
  const { data: activeProjects, isLoading: isLoadingActive } = useActiveProjects();
  
  // For the my projects tab, use the userProjects hook
  const { data: myProjects, isLoading: isLoadingMyProjects } = useUserProjects(user?.id);

  // Extract unique categories, locations, and skills for filters
  const categories = [...new Set(projects?.map(p => p.category).filter(Boolean))];
  const locations = [...new Set(projects?.map(p => p.location).filter(Boolean))];
  
  // Flatten the skills array from all projects and get unique values
  const allSkills = projects?.reduce((acc, project) => {
    if (project.requiredSkills && Array.isArray(project.requiredSkills)) {
      return [...acc, ...project.requiredSkills];
    }
    return acc;
  }, []);
  const skills = [...new Set(allSkills)];

  // Apply filters to projects
  const applyFilters = (projectsList) => {
    if (!projectsList) return [];
    
    return projectsList.filter(project => {
      // Search query filter
      const matchesSearch = !searchQuery || 
        project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = !categoryFilter || project.category === categoryFilter;
      
      // Location filter
      const matchesLocation = !locationFilter || project.location === locationFilter;
      
      // Skills filter
      const matchesSkill = !skillFilter || 
        (project.requiredSkills && project.requiredSkills.includes(skillFilter));
      
      return matchesSearch && matchesCategory && matchesLocation && matchesSkill;
    });
  };

  const filteredProjects = applyFilters(projects);
  const filteredActiveProjects = applyFilters(activeProjects);
  const filteredMyProjects = applyFilters(myProjects);

  const resetFilters = () => {
    setCategoryFilter("");
    setLocationFilter("");
    setSkillFilter("");
    setSearchQuery("");
  };

  const activeFiltersCount = [categoryFilter, locationFilter, skillFilter].filter(Boolean).length;

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

      <div className="flex gap-2 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Projects</h4>
              <Separator />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Required Skill</label>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Skills</SelectItem>
                    {skills.map(skill => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
                <Button size="sm" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="explore" className="mt-8 space-y-4">
        <TabsList>
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          {user && <TabsTrigger value="my-projects">My Projects</TabsTrigger>}
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
              {filteredActiveProjects && filteredActiveProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActiveProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="No active projects found"
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
        
        {user && (
          <TabsContent value="my-projects">
            {isLoadingMyProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-[360px] rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {filteredMyProjects && filteredMyProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMyProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={SearchX}
                    title="You haven't created any projects yet"
                    description={
                      <div className="mt-4">
                        <Button asChild>
                          <Link to="/projects/create">Create Your First Project</Link>
                        </Button>
                      </div>
                    }
                  />
                )}
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </Layout>
  );
};

export default ProjectsPage;
