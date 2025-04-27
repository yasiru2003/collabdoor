
import { Layout } from "@/components/layout";
import { ProjectForm } from "@/components/project/ProjectForm";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/integrations/supabase/client";

export default function CreateProjectPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a project",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/projects/new" } });
    }
  }, [user, loading, navigate]);
  
  const handleSubmit = async (data: any) => {
    try {
      // Format the project data
      const projectData = {
        title: data.title,
        description: data.description,
        category: data.category || null,
        location: data.location || null,
        image: data.image || null,
        proposal_file_path: data.proposalFilePath || null,
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        partnership_types: data.partnershipTypes || [],
        applications_enabled: data.applicationsEnabled,
        status: data.status,
        organizer_id: user?.id,
      };
      
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
      
      navigate(`/projects/${newProject.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
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
        <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
        <div className="max-w-3xl mx-auto">
          <ProjectForm onSubmit={handleSubmit} />
        </div>
      </div>
    </Layout>
  );
}
