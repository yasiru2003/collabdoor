import { ProfileHeader } from "./ProfileHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { ProjectCard } from "@/components/project-card";
import { useProjects } from "@/hooks/use-supabase-query";
import { Mail, Linkedin, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReviews } from "@/hooks/use-reviews";
import { useState, useEffect } from "react";

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
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Contact</h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.email && (
                      <Button variant="outline" size="sm" className="gap-2">
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
