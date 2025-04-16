
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useReviews } from "@/hooks/use-reviews";
import { Star } from "lucide-react";

interface ProjectReviewFormProps {
  projectId: string;
  revieweeId: string;
  revieweeName: string;
  isOrganizerReview: boolean;
  onSubmitSuccess: () => void;
  onSkip: () => void;
}

export function ProjectReviewForm({
  projectId,
  revieweeId,
  revieweeName,
  isOrganizerReview,
  onSubmitSuccess,
  onSkip
}: ProjectReviewFormProps) {
  const { createReview } = useReviews();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await createReview(
        projectId,
        revieweeId,
        rating,
        comment,
        isOrganizerReview
      );
      
      if (success) {
        onSubmitSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          How would you rate your experience with {revieweeName}?
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star 
                className={`h-8 w-8 ${rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
              />
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Your comments (optional)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Share your experience working with ${revieweeName}...`}
          rows={4}
        />
      </div>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSkip}
          disabled={loading}
        >
          Skip
        </Button>
        <Button 
          type="submit"
          disabled={loading || rating < 1}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}
