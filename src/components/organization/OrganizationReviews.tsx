
import { useEffect, useState } from "react";
import { useReviews, Review } from "@/hooks/use-reviews";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationReviewsProps {
  organizationId: string;
  ownerId: string;
}

export function OrganizationReviews({ organizationId, ownerId }: OrganizationReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch reviews directly for better control
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      setError(null);
      try {
        if (!ownerId) {
          setError("Owner ID is missing");
          return;
        }
        
        // First fetch reviews for the organization owner
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('reviewee_id', ownerId)
          .order('created_at', { ascending: false });
          
        if (reviewsError) throw reviewsError;
        
        if (!reviewsData || reviewsData.length === 0) {
          setReviews([]);
          setLoading(false);
          return;
        }
        
        // Get all reviewer IDs
        const reviewerIds = reviewsData.map(review => review.reviewer_id);
        
        // Fetch reviewer profiles
        const { data: reviewersData, error: reviewersError } = await supabase
          .from('profiles')
          .select('id, name, profile_image')
          .in('id', reviewerIds);
          
        if (reviewersError) throw reviewersError;
        
        // Get all project IDs
        const projectIds = reviewsData.map(review => review.project_id);
        
        // Fetch project titles
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, title')
          .in('id', projectIds);
          
        if (projectsError) throw projectsError;
        
        // Combine the data
        const enrichedReviews = reviewsData.map(review => {
          const reviewer = reviewersData?.find(r => r.id === review.reviewer_id);
          const project = projectsData?.find(p => p.id === review.project_id);
          
          return {
            ...review,
            reviewer: reviewer ? {
              name: reviewer.name,
              profile_image: reviewer.profile_image
            } : undefined,
            project: project ? {
              title: project.title
            } : undefined
          };
        });
        
        setReviews(enrichedReviews as Review[]);
      } catch (err) {
        console.error('Error fetching organization reviews:', err);
        setError("Unable to load reviews at this time");
      } finally {
        setLoading(false);
      }
    }
    
    fetchReviews();
  }, [ownerId]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>
            Reviews from partners who have worked with this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>
            Reviews from partners who have worked with this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Error Loading Reviews</h3>
            <p className="text-muted-foreground max-w-md">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
        <CardDescription>
          Reviews from partners who have worked with this organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReviewsList
          reviews={reviews}
          title=""
          description=""
          emptyMessage="This organization has no reviews yet"
          showProject={true}
        />
      </CardContent>
    </Card>
  );
}
