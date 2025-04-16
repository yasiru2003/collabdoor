
import { useState, useEffect } from "react";
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
      // Use generic query to avoid type errors with the reviews table
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id (
            name,
            profile_image
          ),
          project:project_id (
            title
          )
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false }) as { data: Review[] | null, error: any };

      if (error) throw error;
      return data || [];
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
      // Use generic query to avoid type errors
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id (
            name,
            profile_image
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }) as { data: Review[] | null, error: any };

      if (error) throw error;
      return data || [];
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

      // Use generic query to avoid type errors
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
        .select() as { data: any, error: any };

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
