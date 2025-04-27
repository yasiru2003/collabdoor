import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocations } from "@/hooks/use-locations-query";
import { usePartnershipTypes } from "@/hooks/use-partnership-types-query";

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPartnershipType, setSelectedPartnershipType] = useState("");
  const { locations } = useLocations();
  const { partnershipTypes } = usePartnershipTypes();

  useEffect(() => {
    fetchProjects();
  }, [selectedLocation, selectedPartnershipType, searchQuery]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("projects")
        .select("*")
        .eq("status", "published");

      if (selectedLocation) {
        query = query.eq("location", selectedLocation);
      }

      if (selectedPartnershipType) {
        query = query.contains("partnership_types", [selectedPartnershipType]);
      }

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        // Ensure that the data is properly cast to the Project type
        setProjects(data as Project[]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">
          Explore Collaboration Projects
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Locations</SelectItem>
              {locations?.map((location) => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedPartnershipType}>
            <SelectTrigger>
              <SelectValue placeholder="Select partnership type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Partnership Types</SelectItem>
              {partnershipTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p>Loading projects...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {user && (
          <div className="mt-8 text-center">
            <Button asChild>
              <Link to="/projects/new">Create a Project</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
