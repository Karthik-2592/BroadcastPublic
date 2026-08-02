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
