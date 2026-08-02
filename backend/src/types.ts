export type Id = string;

export interface User {
  id: Id;
  username: string;
  email: string;
  interests: string[];
  profile_name?: string;
  profile_picture?: unknown;
  profile_description?: string;
  pinned_posts: Id[];
  follower_count: number;
  following_count: number;
}
export interface Post {
  id: Id;
  user_id: Id | null;
  content: string;
  user_summary: unknown;
  tags: string[];
  media: unknown[];
  visibility: string | null;
  popularity_score: number;
  favorite_count: number;
  comment_count: number;
  created_at: string;
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
}
export interface Community {
  id: Id;
  community_name: string;
  community_desc: string;
  admin_id: Id | null;
  tags: string[];
  community_banner?: unknown;
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
  profile_picture?: unknown;
  profile_description?: string;
}
export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}
export interface PostCreateRequest {
  user_id: Id;
  content: string;
  user_summary: unknown;
  tags?: string[];
  media?: unknown[];
  visibility?: string | null;
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
  tags?: string[];
  community_banner?: unknown;
}
