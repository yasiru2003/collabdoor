
export interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  organization_id?: string;
  location?: string;
  image_url?: string;
  tagged_organizations?: string[];
  organizations?: Organization;
  profiles: Profile;
  feed_likes: FeedLike[];
  feed_comments: FeedComment[];
}

export interface FeedLike {
  id: string;
  user_id: string;
  post_id: string;
}

export interface FeedComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id?: string;
  profiles: Profile;
}

export interface Profile {
  id?: string;
  name?: string;
  profile_image?: string;
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
}
