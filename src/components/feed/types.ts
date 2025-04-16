
export interface FeedProfile {
  id: string;
  name?: string;
  profile_image?: string;
}

export interface FeedComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: FeedProfile;
}

export interface FeedLike {
  id: string;
  user_id: string;
}

export interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  location?: string;
  organization_id?: string;
  image_url?: string;
  tagged_organizations?: string[];
  organizations?: {
    name: string;
    logo?: string;
  };
  feed_likes?: FeedLike[];
  feed_comments?: FeedComment[];
  profiles?: FeedProfile;
}
