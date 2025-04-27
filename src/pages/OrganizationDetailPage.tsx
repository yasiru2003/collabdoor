import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Organization } from "@/types";
import { useOrganization } from "@/hooks/use-organization-query";
import { EditOrganizationDialog } from "@/components/organization/EditOrganizationDialog";
import { useAuth } from "@/hooks/use-auth";

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: organization, isLoading, error, refetch } = useOrganization(id);
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
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded mb-4"></div>
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-6"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
        </div>
      </Layout>
    );
  }

  if (error || !organization) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Organization Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The organization you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/organizations">Browse Organizations</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const isOwner = user && organization && user.id === organization.owner_id;

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground">
              Founded: {organization.founded_year || "N/A"}
            </p>
          </div>
          {isOwner && (
            <Button onClick={() => setEditDialogOpen(true)}>Edit Organization</Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{organization.description || "No description provided."}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <div className="space-y-2">
              <div>
                <strong>Industry:</strong> {organization.industry || "N/A"}
              </div>
              <div>
                <strong>Location:</strong> {organization.location || "N/A"}
              </div>
              <div>
                <strong>Size:</strong> {organization.size || "N/A"}
              </div>
              <div>
                <strong>Website:</strong>{" "}
                {organization.website ? (
                  <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {organization.website}
                  </a>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </div>
        </div>

        {organization && (
          <EditOrganizationDialog
            organization={organization}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onOrganizationUpdated={refetch}
          />
        )}
      </div>
    </Layout>
  );
}
