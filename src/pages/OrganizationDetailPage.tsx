import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building, Edit, Globe, MapPin, Users } from "lucide-react";
import { Organization } from "@/types";
import { OrganizationReviews } from "@/components/organization/OrganizationReviews";
import { OrganizationProjects } from "@/components/organization/OrganizationProjects";

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const {
    data: organization,
    isLoading,
    error
  } = useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      if (!id) throw new Error("No organization ID provided");
      
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      return data as Organization;
    },
    enabled: !!id
  });
  
  const {
    data: members,
    isLoading: isLoadingMembers
  } = useQuery({
    queryKey: ["organization-members", id],
    queryFn: async () => {
      if (!id) return [];
      
      // This is just a placeholder - you would need to implement a proper members table
      // and relationship in Supabase for a real implementation
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", organization?.owner_id)
        .limit(10);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!id && !!organization
  });
  
  const isOwner = user && organization && user.id === organization.owner_id;
  
  if (isLoading || authLoading) {
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
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>Failed to load organization details.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/organizations")}
            className="mt-4"
          >
            Back to Organizations
          </Button>
        </div>
      </Layout>
    );
  }
  
  if (!organization) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-4">Organization Not Found</h1>
          <p>The organization you're looking for doesn't exist or has been removed.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/organizations")}
            className="mt-4"
          >
            Back to Organizations
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={organization.logo || ""} alt={organization.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {organization.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{organization.name}</h1>
              {organization.industry && (
                <Badge variant="outline" className="mt-1">
                  {organization.industry}
                </Badge>
              )}
            </div>
          </div>
          
          {isOwner && (
            <Button onClick={() => navigate(`/organizations/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Organization
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {organization.description || "No description provided."}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {organization.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{organization.location}</span>
                    </div>
                  )}
                  
                  {organization.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {organization.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  
                  {organization.size && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span>{organization.size} employees</span>
                    </div>
                  )}
                  
                  {organization.foundedYear && (
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <span>Founded in {organization.foundedYear}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="projects" className="mt-6">
              <TabsList>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="projects" className="mt-4">
                <OrganizationProjects 
                  organizationId={id || ''}
                  organizationName={organization.name}
                  isOwner={isOwner}
                />
              </TabsContent>
              
              <TabsContent value="members" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Members</CardTitle>
                    <CardDescription>
                      People who are part of this organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMembers ? (
                      <p>Loading members...</p>
                    ) : members && members.length > 0 ? (
                      <div className="space-y-4">
                        {members.map((member: any) => (
                          <div key={member.id} className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.profile_image || ""} />
                              <AvatarFallback>
                                {member.name?.substring(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name || "Unknown User"}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-medium mb-2">No Members Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md">
                          This organization doesn't have any members other than the owner yet.
                        </p>
                        {isOwner && (
                          <Button>Invite Members</Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <OrganizationReviews 
                  organizationId={id || ''}
                  ownerId={organization.owner_id}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Contact Organization</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
