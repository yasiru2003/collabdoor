
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { OrganizationForm } from "@/components/profile/OrganizationForm";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EditOrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState({
    name: "",
    description: "",
    industry: "",
    location: "",
    website: "",
    size: "",
    foundedYear: "",
    logo: ""
  });

  // Fetch organization data
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) throw error;
        
        // Check if user is the owner
        if (data.owner_id !== user.id) {
          toast({
            title: "Access denied",
            description: "You can only edit organizations you own",
            variant: "destructive",
          });
          navigate(`/organizations/${id}`);
          return;
        }
        
        setOrganization({
          name: data.name || "",
          description: data.description || "",
          industry: data.industry || "",
          location: data.location || "",
          website: data.website || "",
          size: data.size || "",
          foundedYear: data.founded_year ? data.founded_year.toString() : "",
          logo: data.logo || ""
        });
      } catch (error: any) {
        console.error("Error fetching organization:", error);
        toast({
          title: "Error",
          description: "Failed to load organization details",
          variant: "destructive",
        });
        navigate("/organizations");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganization();
  }, [id, user, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please login to edit an organization",
        variant: "destructive",
      });
      navigate("/login", { state: { from: `/organizations/${id}/edit` } });
    }
  }, [user, authLoading, navigate, id]);

  const handleOrganizationChange = (field: string, value: string) => {
    setOrganization(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !id) return;
    
    if (!organization.name.trim()) {
      toast({
        title: "Missing information",
        description: "Organization name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from("organizations")
        .update({
          name: organization.name,
          description: organization.description || null,
          industry: organization.industry || null,
          location: organization.location || null,
          website: organization.website || null,
          size: organization.size || null,
          founded_year: organization.foundedYear ? parseInt(organization.foundedYear) : null,
          logo: organization.logo || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("owner_id", user.id);

      if (error) throw error;

      toast({
        title: "Organization updated",
        description: "Your organization has been successfully updated"
      });
      
      navigate(`/organizations/${id}`);
    } catch (error: any) {
      console.error("Error updating organization:", error);
      toast({
        title: "Failed to update organization",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!user || !id) return;
    
    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from("organizations")
        .delete()
        .eq("id", id)
        .eq("owner_id", user.id);

      if (error) throw error;

      toast({
        title: "Organization deleted",
        description: "Your organization has been successfully deleted"
      });
      
      navigate("/organizations");
    } catch (error: any) {
      console.error("Error deleting organization:", error);
      toast({
        title: "Failed to delete organization",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };
  
  if (authLoading || loading) {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Organization</h1>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Organization"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  organization and all its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <OrganizationForm
            organization={organization}
            loading={submitting}
            onOrganizationChange={handleOrganizationChange}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </Layout>
  );
}
