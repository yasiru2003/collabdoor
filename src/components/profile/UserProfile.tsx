
import { ProfileHeader } from "./ProfileHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { ProjectCard } from "@/components/project-card";
import { useProjects } from "@/hooks/use-supabase-query";
import { Mail, Linkedin, Github, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReviews } from "@/hooks/use-reviews";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types";
import { mapSupabaseOrgToOrganization } from "@/utils/data-mappers";
import { Link } from "react-router-dom";

interface UserProfileProps {
  profile: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    profile_image?: string;
    skills?: string[];
  };
}

export function UserProfile({ profile }: UserProfileProps) {
  const { data: projects } = useProjects();
  const userProjects = projects?.filter(p => p.organizerId === profile.id) || [];
  const { getUserReviews } = useReviews();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const isMobile = useIsMobile();
  
  // Fetch user reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const userReviews = await getUserReviews(profile.id);
        setReviews(userReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [profile.id, getUserReviews]);

  // Fetch user's organizations
  useEffect(() => {
    const fetchUserOrganizations = async () => {
      try {
        setLoadingOrgs(true);
        const { data, error } = await supabase
          .from("organization_members")
          .select(`
            organization_id,
            role,
            organizations:organization_id(*)
          `)
          .eq("user_id", profile.id);

        if (error) throw error;
        
        if (data && data.length > 0) {
          const orgs = data.map(item => mapSupabaseOrgToOrganization(item.organizations));
          setUserOrganizations(orgs);
        }
      } catch (error) {
        console.error("Error fetching user organizations:", error);
      } finally {
        setLoadingOrgs(false);
      }
    };
    
    if (profile.id) {
      fetchUserOrganizations();
    }
  }, [profile.id]);

  // Determine current user (to avoid showing contact option for own profile)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Try to get user ID from session (supabase)
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data }) => {
        setCurrentUserId(data?.user?.id ?? null);
      });
    });
  }, []);

  // If not yourself, show contact button
  const isSelf = profile.id === currentUserId;
  const handleContact = () => {
    window.location.href = `/messages?participantId=${profile.id}&participantName=${encodeURIComponent(profile.name || "User")}`;
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <ProfileHeader
          title={profile.name || "User"}
          description={profile.bio || "No bio provided"}
          image={profile.profile_image}
        />
        {/* Contact Button */}
        {!isSelf && (
          <Button
            size="sm"
            variant="outline"
            className="gap-2 mt-2"
            onClick={handleContact}
            data-testid="contact-user-profile"
          >
            <Mail className="h-4 w-4" />
            Contact
          </Button>
        )}
      </div>

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="w-full flex overflow-x-auto">
          <TabsTrigger value="about" className="flex-1 whitespace-nowrap">About</TabsTrigger>
          <TabsTrigger value="organizations" className="flex-1 whitespace-nowrap">Organizations</TabsTrigger>
          <TabsTrigger value="projects" className="flex-1 whitespace-nowrap">Projects</TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1 whitespace-nowrap">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Contact</h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.email && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => window.location.href = `mailto:${profile.email}`}
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Github className="h-4 w-4" />
                      Github
                    </Button>
                  </div>
                </div>

                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="organizations">
          {loadingOrgs ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse space-y-4 w-full max-w-2xl">
                <div className="h-12 bg-muted rounded-md"></div>
                <div className="h-12 bg-muted rounded-md"></div>
                <div className="h-12 bg-muted rounded-md"></div>
              </div>
            </div>
          ) : userOrganizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userOrganizations.map((org) => (
                <Card key={org.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          <Link to={`/organizations/${org.id}`} className="hover:underline">
                            {org.name}
                          </Link>
                        </h3>
                        {org.industry && (
                          <p className="text-sm text-muted-foreground">{org.industry}</p>
                        )}
                        {org.location && (
                          <p className="text-sm text-muted-foreground">{org.location}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
              <h3 className="mt-4 text-lg font-semibold">No Organizations</h3>
              <p className="mt-2 text-muted-foreground">
                This user isn't a member of any organizations yet.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {userProjects.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-8">
                No projects found
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsList 
            reviews={reviews} 
            title={`Reviews for ${profile.name || "User"}`}
            description="See what others have said about working with this user"
            emptyMessage="This user hasn't received any reviews yet" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
