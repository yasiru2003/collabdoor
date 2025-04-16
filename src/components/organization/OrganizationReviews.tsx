
import { useEffect, useState } from "react";
import { useReviews, Review } from "@/hooks/use-reviews";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OrganizationReviewsProps {
  organizationId: string;
  ownerId: string;
}

export function OrganizationReviews({ organizationId, ownerId }: OrganizationReviewsProps) {
  const { getUserReviews } = useReviews();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get reviews for the organization owner
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        if (!ownerId) return;
        const ownerReviews = await getUserReviews(ownerId);
        setReviews(ownerReviews as Review[]);
      } catch (error) {
        console.error('Error fetching organization reviews:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReviews();
  }, [ownerId, getUserReviews]);
  
  if (loading) {
    return <p>Loading reviews...</p>;
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
