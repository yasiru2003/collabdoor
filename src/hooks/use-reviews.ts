
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

export interface Review {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  is_organizer_review: boolean;
  created_at: string;
  reviewer?: {
    name?: string;
    profile_image?: string;
  };
  project?: {
    title: string;
  };
}

export function useReviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Get reviews for a specific user
  const getUserReviews = async (userId: string) => {
    try {
      setLoading(true);
      
      // First, fetch all reviews for the user
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      
      // If there are no reviews, return an empty array
      if (!reviewsData || reviewsData.length === 0) {
        return [];
      }
      
      // Get all reviewer IDs to fetch their profiles
      const reviewerIds = [...new Set(reviewsData.map(review => review.reviewer_id))];
      
      // Fetch reviewer profiles
      const { data: reviewersData, error: reviewersError } = await supabase
        .from('profiles')
        .select('id, name, profile_image')
        .in('id', reviewerIds);
        
      if (reviewersError) throw reviewersError;
      
      // Get all project IDs to fetch project titles
      const projectIds = [...new Set(reviewsData.map(review => review.project_id))];
      
      // Fetch project titles
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, title')
        .in('id', projectIds);
        
      if (projectsError) throw projectsError;
      
      // Map the reviewers and projects to their respective reviews
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
      
      return enrichedReviews;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get reviews for a specific project
  const getProjectReviews = async (projectId: string) => {
    try {
      setLoading(true);
      
      // First, fetch all reviews for the project
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      
      // If there are no reviews, return an empty array
      if (!reviewsData || reviewsData.length === 0) {
        return [];
      }
      
      // Get all reviewer IDs to fetch their profiles
      const reviewerIds = [...new Set(reviewsData.map(review => review.reviewer_id))];
      
      // Fetch reviewer profiles
      const { data: reviewersData, error: reviewersError } = await supabase
        .from('profiles')
        .select('id, name, profile_image')
        .in('id', reviewerIds);
        
      if (reviewersError) throw reviewersError;
      
      // Map the reviewers to their respective reviews
      const enrichedReviews = reviewsData.map(review => {
        const reviewer = reviewersData?.find(r => r.id === review.reviewer_id);
        
        return {
          ...review,
          reviewer: reviewer ? {
            name: reviewer.name,
            profile_image: reviewer.profile_image
          } : undefined
        };
      });
      
      return enrichedReviews;
    } catch (error) {
      console.error('Error fetching project reviews:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new review
  const createReview = async (
    projectId: string,
    revieweeId: string,
    rating: number,
    comment: string,
    isOrganizerReview: boolean
  ) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to leave a review",
          variant: "destructive"
        });
        return false;
      }

      // Use any type to avoid TypeScript errors
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          project_id: projectId,
          reviewer_id: user.id,
          reviewee_id: revieweeId,
          rating,
          comment,
          is_organizer_review: isOrganizerReview
        })
        .select() as any;

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: "Error submitting review",
        description: "There was a problem submitting your review",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    loading,
    getUserReviews,
    getProjectReviews,
    createReview
  };
}
