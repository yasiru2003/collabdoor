
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useSystemSetting } from "@/hooks/use-system-settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ProjectSubmissionForm } from "@/components/project/ProjectSubmissionForm";

export default function CreateProjectPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: requireProjectApproval } = useSystemSetting("require_project_approval");
  
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
        
        {requireProjectApproval?.value && (
          <Alert className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Project Approval Required</AlertTitle>
            <AlertDescription>
              Projects submitted for publishing will require admin approval before they become visible to the public.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="max-w-3xl mx-auto">
          <ProjectSubmissionForm />
        </div>
      </div>
    </Layout>
  );
}
