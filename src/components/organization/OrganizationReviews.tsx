
import { useEffect, useState } from "react";
import { useReviews, Review } from "@/hooks/use-reviews";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface OrganizationReviewsProps {
  organizationId: string;
  ownerId: string;
}

export function OrganizationReviews({ organizationId, ownerId }: OrganizationReviewsProps) {
  const { getUserReviews } = useReviews();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get reviews for the organization owner
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      setError(null);
      try {
        if (!ownerId) {
          setError("Owner ID is missing");
          return;
        }
        const ownerReviews = await getUserReviews(ownerId);
        setReviews(ownerReviews as Review[]);
      } catch (err) {
        console.error('Error fetching organization reviews:', err);
        setError("Unable to load reviews at this time");
      } finally {
        setLoading(false);
      }
    }
    
    fetchReviews();
  }, [ownerId, getUserReviews]);
  
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
