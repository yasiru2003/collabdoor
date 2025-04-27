
import React from "react";
import { Layout } from "@/components/layout";
import { ProjectCard } from "@/components/project/ProjectCard";
import { useProjects } from "@/hooks/use-projects-query";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const projectsResult = useProjects();
  const projects = projectsResult.data || [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredProjects = projects?.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (projectsResult.isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (projectsResult.error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Error: {projectsResult.error.message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Projects</h1>

        <Input
          type="text"
          placeholder="Search projects..."
          className="mb-4"
          value={searchQuery}
          onChange={handleSearch}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
