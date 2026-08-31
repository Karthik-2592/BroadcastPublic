export type Id = string;

export interface MediaMetadata {
  media_id: number;
  media_url: string;
  mime_type: string;
}

export interface User {
  id: Id;
  username: string;
  email: string;
  interests: string[];
  profile_name?: string;
  profile_picture: MediaMetadata | null;
  profile_description?: string;
  pinned_posts: Id[];
  follower_count: number;
  following_count: number;
}
export interface Post {
  id: Id;
  user_id: Id | null;
  community_id?: Id | null;
  title: string;
  content: string;
  user_summary: unknown;
  tags: string[];
  media: MediaMetadata[];
  popularity_score: number;
  favorite_count: number;
  comment_count: number;
  time_created: string;
  last_edited_at?: string | null;
}
export interface Comment {
  id: Id;
  post_id: Id;
  user_id: Id | null;
  root: Id | null;
  content: string;
  user_summary?: unknown;
  favorite_count: number;
  reply_count: number;
  timestamp: string;
  last_edited_at?: string | null;
}
export interface Community {
  id: Id;
  community_name: string;
  community_desc: string;
  admin_id: Id | null;
  tags: string[];
  community_guidelines: string;
  community_banner: MediaMetadata | null;
  population: number;
  post_count: number;
  timestamp: string;
}
export interface Notification {
  id: Id;
  user_id: Id;
  event_type: string;
  event_id: Id;
  read: boolean;
  timestamp: string;
}

export interface ApiResult<T> {
  success: boolean;
  message: string;
  data?: T;
}
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  interests?: string[];
  profile_name?: string;
  profile_picture?: MediaMetadata | null;
  profile_description?: string;
}
export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}
export interface PostCreateRequest {
  user_id: Id;
  community_id?: Id | null;
  community_name?: string | null;
  title: string;
  content: string;
  user_summary: unknown;
  tags?: string[];
  media?: MediaMetadata[];
}
export interface CommentCreateRequest {
  user_id: Id;
  content: string;
  root?: Id | null;
  user_summary?: unknown;
}
export interface CommunityCreateRequest {
  user_id: Id;
  community_name: string;
  community_desc: string;
  community_guidelines: string;
  tags?: string[];
  community_banner?: MediaMetadata | null;
}

// Relation request types
export type RelationAuthorization = "MODERATOR" | "ADMIN" | (string & {});

export interface FollowRelationRequest {
  follower_id: string;
  followed_id: string;
}
export interface PostLikeRelationRequest {
  user_id: string;
  post_id: string;
}
export interface CommentLikeRelationRequest {
  user_id: string;
  post_id: string;
  comment_id: string;
}
export interface SaveRelationRequest {
  user_id: string;
  post_id: string;
}
export interface ModeratorRelationRequest {
  admin_id: string;
  user_id: string;
  community_id: string;
  authorization?: RelationAuthorization;
}
export interface MembershipRelationRequest {
  user_id: string;
  community_id: string;
}

export type Tag =
  | "Art"
  | "Business & Finance"
  | "Fashion & Beauty"
  | "Travelling"
  | "Sports"
  | "Food"
  | "Technology"
  | "Books"
  | "Health"
  | "Games"
  | "Films & TV"
  | "Nature"
  | "News & Politics"
  | "Science"
  | "Pop Culture"
  | "Lifestyle";