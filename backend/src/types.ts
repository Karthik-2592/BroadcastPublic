export type Id = string;

export interface User {
  id: Id;
  username: string;
  email: string;
  password: string;
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
  user_id: Id;
  content: string;
  user_summary: unknown;
  tags: string[];
  media: unknown[];
  visibility: string | null;
  favorite_count: number;
  comment_count: number;
  created_at: string;
}
export interface Comment {
  id: Id;
  post_id: Id;
  user_id: Id | null;
  type: boolean;
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
export type Relation = "follow" | "favorite" | "save" | "member" | "moderator";
