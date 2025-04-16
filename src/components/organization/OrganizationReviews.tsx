
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReviews, Review } from "@/hooks/use-reviews";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationReviewsProps {
  organizationId: string;
  ownerId: string;
}

export function OrganizationReviews({ organizationId, ownerId }: OrganizationReviewsProps) {
  const { getUserReviews } = useReviews();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get projects from this organization
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id')
          .eq('organization_id', organizationId);
          
        if (error) throw error;
        if (data) {
          setProjectIds(data.map(p => p.id));
        }
      } catch (error) {
        console.error('Error fetching organization projects:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjects();
  }, [organizationId]);
  
  // Get reviews for the organization owner
  useEffect(() => {
    async function fetchReviews() {
      try {
        if (!ownerId) return;
        const ownerReviews = await getUserReviews(ownerId);
        setReviews(ownerReviews as Review[]);
      } catch (error) {
        console.error('Error fetching organization reviews:', error);
      }
    }
    
    if (!loading && ownerId) {
      fetchReviews();
    }
  }, [ownerId, loading, getUserReviews]);
  
  return (
    <Tabs defaultValue="reviews">
      <TabsList>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
      </TabsList>
      
      <TabsContent value="reviews" className="mt-4">
        <ReviewsList
          reviews={reviews}
          title="Organization Reviews"
          description="Reviews from partners who have worked with this organization"
          emptyMessage="This organization has no reviews yet"
          showProject={true}
        />
      </TabsContent>
      
      <TabsContent value="projects" className="mt-4">
        {/* Project list would go here */}
        <div className="text-center py-8 text-muted-foreground">
          This organization has {projectIds.length} projects
        </div>
      </TabsContent>
    </Tabs>
  );
}
