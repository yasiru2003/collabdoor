
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/hooks/use-organization-query";
import { EditOrganizationDialog } from "@/components/organization/EditOrganizationDialog";
import { useAuth } from "@/hooks/use-auth";

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization, isLoading, error, refetch } = useOrganization(id);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (id === "create") {
      navigate("/organizations/new");
      return;
    }
  }, [id, navigate]);

  if (id === "create") {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error || !organization) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>
            {error ? `Error: ${error.message}` : "Organization not found"}
          </p>
        </div>
      </Layout>
    );
  }

  const isOwner = user && organization && user.id === organization.owner_id;
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground">{organization.description}</p>
          </div>
          {isOwner && (
            <Button onClick={() => setEditDialogOpen(true)}>Edit Organization</Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <ul>
              <li>
                <strong>Industry:</strong> {organization.industry}
              </li>
              <li>
                <strong>Location:</strong> {organization.location}
              </li>
              <li>
                <strong>Website:</strong>{" "}
                <Link
                  to={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {organization.website}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
            <ul>
              <li>
                <strong>Contact Email:</strong> {/* Remove email property access */}N/A
              </li>
              <li>
                <strong>Contact Phone:</strong> {/* Remove phone property access */}N/A
              </li>
            </ul>
          </div>
        </div>
      </div>
      <EditOrganizationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        organization={organization}
        onOrganizationUpdated={() => {
          refetch();
          setEditDialogOpen(false);
        }}
      />
    </Layout>
  );
}
