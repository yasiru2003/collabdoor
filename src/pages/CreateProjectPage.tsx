
import { Layout } from "@/components/layout";
import { ProjectForm } from "@/components/project/ProjectForm";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function CreateProjectPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a project",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/projects/new" } });
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
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
          <ProjectForm />
        </div>
      </div>
    </Layout>
  );
}
