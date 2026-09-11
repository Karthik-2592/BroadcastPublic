// Frontend API types aligned with backend/src/types.ts.

export type Id = string;

export interface MediaMetadata {
  media_id: number;
  media_url: string;
  mime_type: string;
}

// ── Inlined author/commenter summary embedded in Post and Comment responses ──
export interface UserSummary {
  id: Id;
  username: string;
  profile_name?: string;
  /** URL to the profile picture; null / undefined means no picture uploaded. */
  profile_picture?: string | null;
  avatarColor?: string;
  post_count?: number;
  community_count?: number;
  joined_at?: string;
}


// ── Core entity types ─────────────────────────────────────────────────────────

export interface User {
  id: Id;
  username: string;
  email: string;
  interests: string[];
  profile_name?: string;
  profile_picture?: MediaMetadata | null;
  profile_description?: string;
  follower_count: number;
  following_count: number;
  avatarColor?: string;
  post_count?: number;
  community_count?: number;
  joined_at?: string;
}

export interface Post {
  id: Id;
  user_id: Id | null;
  community_id?: Id | null;
  title: string;
  content: string;
  /** Resolved author summary embedded by the backend in list/detail responses. */
  user_summary: UserSummary | null;
  tags: string[];
  /** Array of media metadata objects. Empty array means no media attached. */
  media: MediaMetadata[];
  popularity_score: number;
  favorite_count: number;
  comment_count: number;
  time_created: string;
  last_edited_at?: string | null;
  mediaPlaceholder?: string;
  recommendationReason?: string;
}


export interface Comment {
  id: Id;
  post_id: Id;
  user_id: Id | null;
  /** ID of the parent comment this is a reply to; null for top-level comments. */
  root: Id | null;
  content: string;
  user_summary?: UserSummary | null;
  favorite_count: number;
  reply_count: number;
  timestamp: string;
  last_edited_at?: string | null;
  /**
   * UI-only: lazily populated when the user expands replies.
   * The backend returns only top-level comments; replies are fetched on demand.
   */
  replies?: Comment[];
  isLiked?: boolean;
}

export interface Community {
  id: Id;
  community_name: string;
  community_desc: string;
  admin_id: Id | null;
  tags: string[];
  community_guidelines?: string;
  /** URL to the community banner image; null / undefined means no banner uploaded. */
  community_banner?: MediaMetadata | null;
  isMember: boolean;
  /**
   * UI-only: CSS gradient string shown as a fallback when community_banner is absent.
   * Communities keep this field since branded gradients are part of their visual identity.
   */
  bannerGradient?: string;
  /** Total number of members. */
  population: number;
  post_count: number;
  timestamp: string;
  /** UI-only explore-page badge. */
  badge?: 'Trending' | 'New';
  /** UI-only explore-page join state. */
  joinState?: 'join' | 'joined';
  recommendationReason?: string;
}

export interface Notification {
  id: Id;
  target_id: Id;
  event_type: string;
  event_id: Id;
  read: boolean;
  timestamp: string;
  user_summary?: UserSummary | null;
}

// ── Generic API envelope ──────────────────────────────────────────────────────

export interface ApiResult<T> {
  success: boolean;
  message: string;
  data?: T;
}

export type RelationStatusMap = Record<string, boolean>;

// ── Auth request types ────────────────────────────────────────────────────────

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

// ── Mutation request types ────────────────────────────────────────────────────

export interface PostCreateRequest {
  user_id: Id;
  community_id?: Id | null;
  title: string;
  content: string;
  tags?: string[];
  media?: MediaMetadata[];
}

export interface CommentCreateRequest {
  user_id: Id;
  content: string;
  root?: Id | null;
}

export interface CommunityCreateRequest {
  user_id: Id;
  community_name: string;
  community_desc: string;
  community_guidelines: string;
  tags?: string[];
  community_banner?: MediaMetadata | null;
}

// ── Relation request types ────────────────────────────────────────────────────

export type RelationAuthorization = 'MODERATOR' | 'ADMIN' | (string & {});

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

// ── Shared enum ───────────────────────────────────────────────────────────────

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

// ── Formatting utilities ──────────────────────────────────────────────────────

/**
 * Formats a large number with a k / m suffix for display in the UI.
 * Examples: 8900 → "8.9k", 1_200_000 → "1.2m"
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/**
 * Returns the display name for a UserSummary, preferring profile_name.
 */
export function displayName(user: UserSummary | null | undefined): string {
  if (!user) return 'Unknown';
  return user.profile_name ?? user.username;
}

/**
 * Returns the @handle string for a UserSummary.
 */
export function userHandle(user: UserSummary | null | undefined): string {
  if (!user) return '@unknown';
  return `@${user.username}`;
}
