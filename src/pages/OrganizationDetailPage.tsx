import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building, Edit, Globe, MapPin, Users, Mail } from "lucide-react";
import { Organization, PartnershipType } from "@/types";
import { OrganizationReviews } from "@/components/organization/OrganizationReviews";
import { OrganizationProjects } from "@/components/organization/OrganizationProjects";
import { OrganizationJoinRequest } from "@/components/organization/OrganizationJoinRequest";
import { OrganizationRequestsTab } from "@/components/organization/OrganizationRequestsTab";
import { PartnershipInterestsTab } from "@/components/organization/PartnershipInterestsTab";
import { PartnershipApplicationsTab } from "@/components/organization/PartnershipApplicationsTab";

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get the tab from URL or default to "projects"
  const defaultTab = searchParams.get("tab") || "projects";
  const queryClient = useQueryClient();
  
  // Track join request status
  const [joinRequestStatus, setJoinRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  
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
  
  // Check if user has already requested to join
  const { data: joinRequest } = useQuery({
    queryKey: ["organization-join-request", id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      const { data, error } = await supabase
        .from("organization_join_requests")
        .select("*")
        .eq("organization_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setJoinRequestStatus(data.status as 'pending' | 'approved' | 'rejected');
      }
      
      return data;
    },
    enabled: !!id && !!user
  });
  
  // Check if user is already a member
  const { data: isMember, refetch: refetchMembership } = useQuery({
    queryKey: ["organization-membership", id, user?.id],
    queryFn: async () => {
      if (!id || !user) return false;
      
      const { data, error } = await supabase
        .from("organization_members")
        .select("*")
        .eq("organization_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (error) throw error;
      return !!data;
    },
    enabled: !!id && !!user
  });
  
  // Effect to refetch membership when join request status changes to approved
  useEffect(() => {
    if (joinRequestStatus === 'approved') {
      refetchMembership();
    }
  }, [joinRequestStatus, refetchMembership]);
  
  const {
    data: members,
    isLoading: isLoadingMembers,
    refetch: refetchMembers
  } = useQuery({
    queryKey: ["organization-members", id],
    queryFn: async () => {
      if (!id) return [];
      
      // First fetch the members
      const { data: membersData, error: membersError } = await supabase
        .from("organization_members")
        .select("*")
        .eq("organization_id", id);
        
      if (membersError) throw membersError;
      
      if (membersData && membersData.length > 0) {
        // Get all user IDs
        const userIds = membersData.map(member => member.user_id);
        
        // Fetch profiles separately
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, email, profile_image")
          .in("id", userIds);
          
        if (profilesError) throw profilesError;
        
        // Merge the data
        const membersWithProfiles = membersData.map(member => {
          // Find the matching profile
          const profile = profilesData?.find(profile => profile.id === member.user_id);
          return {
            ...member,
            profiles: profile || null
          };
        });
        
        return membersWithProfiles;
      }
      
      return membersData || [];
    },
    enabled: !!id && !!organization
  });
  
  // Effect to refetch members when membership status changes
  useEffect(() => {
    if (isMember !== undefined) {
      refetchMembers();
    }
  }, [isMember, refetchMembers]);
  
  const isOwner = user && organization && user.id === organization.owner_id;

  // Add: determine if current user can contact owner (non-owner, logged in)
  const canContactOwner =
    user &&
    organization &&
    user.id !== organization.owner_id;

  // Function to message org owner
  const handleContactOwner = () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/organizations/${id}` } });
      return;
    }
    navigate('/messages', {
      state: {
        participantId: organization.owner_id,
        participantName: organization.name, // Will resolve user name in chat UI
      },
    });
  };
  
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
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarImage src={organization.logo || ""} alt={organization.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {organization.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold truncate">{organization.name}</h1>
              {organization.industry && (
                <Badge variant="outline" className="mt-1">
                  {organization.industry}
                </Badge>
              )}
              {canContactOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-2 w-full md:w-auto"
                  onClick={handleContactOwner}
                >
                  <Mail className="h-4 w-4" />
                  Contact
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {isOwner ? (
              <Button 
                onClick={() => navigate(`/organizations/${id}/edit`)}
                className="w-full md:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Organization
              </Button>
            ) : (
              !isMember && !isOwner && (
                <div className="w-full md:w-auto">
                  <OrganizationJoinRequest 
                    organizationId={id || ''}
                    organizationName={organization.name}
                    ownerId={organization.owner_id}
                    status={joinRequestStatus}
                    onStatusChange={status => setJoinRequestStatus(status)}
                  />
                </div>
              )
            )}
          </div>
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
            
            <Tabs defaultValue={defaultTab} className="mt-6">
              <TabsList>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="partnership-interests">Partnership Interests</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                {isOwner && (
                  <>
                    <TabsTrigger value="requests">Join Requests</TabsTrigger>
                    <TabsTrigger value="partnership-applications">Partnership Applications</TabsTrigger>
                  </>
                )}
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
                              <AvatarImage src={member.profiles?.profile_image || ""} />
                              <AvatarFallback>
                                {(member.profiles?.name || member.profiles?.email || "U").substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              {/* Make user name/email a link to user profile */}
                              <p className="font-medium">
                                {member.profiles?.id ? (
                                  <a
                                    href={`/users/${member.profiles.id}`}
                                    className="hover:text-primary underline underline-offset-2 transition-colors"
                                  >
                                    {member.profiles?.name || member.profiles?.email || "Unknown User"}
                                  </a>
                                ) : (
                                  member.profiles?.name || member.profiles?.email || "Unknown User"
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.profiles?.email}
                              </p>
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
              
              <TabsContent value="partnership-interests" className="mt-4">
                <PartnershipInterestsTab 
                  organizationId={id || ''}
                  isOwner={isOwner}
                  isMember={!!isMember}
                />
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <OrganizationReviews 
                  organizationId={id || ''}
                  ownerId={organization.owner_id}
                />
              </TabsContent>
              
              {isOwner && (
                <>
                  <TabsContent value="requests" className="mt-4">
                    <OrganizationRequestsTab
                      organizationId={id || ''}
                      organizationName={organization.name}
                      isOwner={isOwner}
                    />
                  </TabsContent>
                  
                  <TabsContent value="partnership-applications" className="mt-4">
                    <PartnershipApplicationsTab
                      organizationId={id || ''}
                      organizationName={organization.name}
                      isOwner={isOwner}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            {/* Sidebar content */}
          </div>
        </div>
      </div>
    </Layout>
  );
}
