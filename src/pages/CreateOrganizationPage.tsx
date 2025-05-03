
import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { OrganizationForm } from "@/components/profile/OrganizationForm";
import { supabase } from "@/integrations/supabase/client";

export default function CreateOrganizationPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
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

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please login to create an organization",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/organizations/new" } });
    }
  }, [user, loading, navigate]);

  const handleOrganizationChange = (field: string, value: string) => {
    setOrganization(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
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
      
      const { error } = await supabase.from("organizations").insert({
        name: organization.name,
        description: organization.description || null,
        industry: organization.industry || null,
        location: organization.location || null,
        website: organization.website || null,
        size: organization.size || null,
        founded_year: organization.foundedYear ? parseInt(organization.foundedYear) : null,
        logo: organization.logo || null,
        owner_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Organization created",
        description: "Your organization has been successfully created"
      });
      
      navigate("/organizations");
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast({
        title: "Failed to create organization",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
        <h1 className="text-3xl font-bold mb-6">Create Organization</h1>
        
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
