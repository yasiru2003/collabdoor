import { Layout } from "@/components/layout";
import { OrganizationForm } from "@/components/organization/OrganizationForm";
import { useOrganization } from "@/hooks/use-organization-query";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function EditOrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const { organization, isLoading, error } = useOrganization(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to edit an organization",
        variant: "destructive",
      });
      navigate("/login", { state: { from: `/organizations/${id}/edit` } });
    }

    if (id && organization && user && organization.owner_id !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You are not authorized to edit this organization.",
        variant: "destructive",
      });
      navigate("/organizations");
    }
  }, [user, organization, id, navigate, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Error: {error.message}</p>
        </div>
      </Layout>
    );
  }

  if (!organization) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Organization not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Organization</h1>
        <div className="max-w-3xl mx-auto">
          <OrganizationForm organization={organization} />
        </div>
      </div>
    </Layout>
  );
}
