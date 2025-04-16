
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { Review } from "@/hooks/use-reviews";
import { Badge } from "@/components/ui/badge";

interface ReviewsListProps {
  reviews: Review[];
  title: string;
  description?: string;
  emptyMessage?: string;
  showProject?: boolean;
}

export function ReviewsList({
  reviews,
  title,
  description,
  emptyMessage = "No reviews yet",
  showProject = false
}: ReviewsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.reviewer?.profile_image} alt={review.reviewer?.name || "Reviewer"} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {review.reviewer?.name?.substring(0, 2).toUpperCase() || "UK"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{review.reviewer?.name || "Unknown User"}</p>
                        {showProject && review.project && (
                          <p className="text-xs text-muted-foreground">For project: {review.project.title}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={review.is_organizer_review ? "default" : "outline"}>
                      {review.is_organizer_review ? "Organizer" : "Partner"}
                    </Badge>
                  </div>
                  
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-4 w-4 ${review.rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  
                  {review.comment ? (
                    <p className="text-sm">{review.comment}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No comment provided</p>
                  )}
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
