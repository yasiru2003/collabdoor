import { Layout } from "@/components/layout";
import { OrganizationForm } from "@/components/organization/OrganizationForm";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function CreateOrganizationPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please login to create an organization",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/organizations/new" } });
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
        <h1 className="text-3xl font-bold mb-6">Create New Organization</h1>
        <div className="max-w-3xl mx-auto">
          <OrganizationForm />
        </div>
      </div>
    </Layout>
  );
}
