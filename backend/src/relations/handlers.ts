import type { Request, Response } from "express";
import { fail, ok, required } from "../http.ts";
import { queueFavoriteEvent } from "../services/favorites.ts";
import { store } from "../store.ts";
import { neo4jRelations, numberValue } from "./neo4j.ts";
import type {
  CommentLikeRelationRequest,
  FollowRelationRequest,
  MembershipRelationRequest,
  ModeratorRelationRequest,
  PostLikeRelationRequest,
  SaveRelationRequest,
} from "./types.ts";

export async function follow(req: Request, res: Response): Promise<Response> {
  const body = req.body as Partial<FollowRelationRequest>;
  const missing = required(body, ["follower_id", "followed_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (body.follower_id === body.followed_id)
    return fail(res, 400, "Users cannot follow themselves.");
  if (
    !(await store.user(body.follower_id!)) ||
    !(await store.user(body.followed_id!))
  )
    return fail(res, 404, "User not found.");
  const enabled = req.method === "POST";
  const changed = numberValue(
    await neo4jRelations.follow(body.follower_id!, body.followed_id!, enabled),
  );
  if (changed)
    await store.updateFollowCounts(
      body.follower_id!,
      body.followed_id!,
      enabled ? 1 : -1,
    );
  return ok(res, { active: enabled, changed: Boolean(changed) });
}
export async function postLike(req: Request, res: Response): Promise<Response> {
  const body = req.body as Partial<PostLikeRelationRequest>;
  const missing = required(body, ["user_id", "post_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (!(await store.user(body.user_id!)) || !(await store.post(body.post_id!)))
    return fail(res, 404, "User or post not found.");
  const enabled = req.method === "POST";
  queueFavoriteEvent({
    target: "post",
    targetId: body.post_id!,
    userId: body.user_id!,
    favorited: enabled,
  });
  return ok(res, { favorited: enabled, queued: true });
}
export async function commentLike(
  req: Request,
  res: Response,
): Promise<Response> {
  const body = req.body as Partial<CommentLikeRelationRequest>;
  const missing = required(body, ["user_id", "post_id", "comment_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  const comment = await store.comment(body.comment_id!);
  if (
    !(await store.user(body.user_id!)) ||
    !(await store.post(body.post_id!)) ||
    !comment ||
    comment.post_id !== body.post_id
  )
    return fail(res, 404, "User, post, or comment not found.");
  const enabled = req.method === "POST";
  queueFavoriteEvent({
    target: "comment",
    targetId: body.comment_id!,
    userId: body.user_id!,
    favorited: enabled,
  });
  return ok(res, { favorited: enabled, queued: true });
}
export async function save(req: Request, res: Response): Promise<Response> {
  const body = req.body as Partial<SaveRelationRequest>;
  const missing = required(body, ["user_id", "post_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (!(await store.user(body.user_id!)) || !(await store.post(body.post_id!)))
    return fail(res, 404, "User or post not found.");
  const enabled = req.method === "POST";
  const changed = numberValue(
    await neo4jRelations.save(body.user_id!, body.post_id!, enabled),
  );
  return ok(res, { saved: enabled, changed: Boolean(changed) });
}
export async function moderate(req: Request, res: Response): Promise<Response> {
  const body = req.body as Partial<ModeratorRelationRequest>;
  const missing = required(body, ["admin_id", "user_id", "community_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  const community = await store.community(body.community_id!);
  if (
    !(await store.user(body.admin_id!)) ||
    !(await store.user(body.user_id!)) ||
    !community
  )
    return fail(res, 404, "User or community not found.");
  if (community.admin_id !== body.admin_id)
    return fail(res, 403, "Only the community admin may manage moderators.");
  const enabled = req.method === "POST";
  const authorization = body.authorization ?? "MODERATOR";
  const changed = numberValue(
    await neo4jRelations.moderate(
      {
        adminId: body.admin_id!,
        userId: body.user_id!,
        communityId: body.community_id!,
        authorization,
      },
      enabled,
    ),
  );
  return ok(res, { active: enabled, authorization, changed: Boolean(changed) });
}
export async function membership(
  req: Request,
  res: Response,
): Promise<Response> {
  const body = req.body as Partial<MembershipRelationRequest>;
  const missing = required(body, ["user_id", "community_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (
    !(await store.user(body.user_id!)) ||
    !(await store.community(body.community_id!))
  )
    return fail(res, 404, "User or community not found.");
  const enabled = req.method === "POST";
  const changed = numberValue(
    await neo4jRelations.membership(body.user_id!, body.community_id!, enabled),
  );
  if (changed)
    await store.incrementCommunityPopulation(
      body.community_id!,
      enabled ? 1 : -1,
    );
  return ok(res, { active: enabled, changed: Boolean(changed) });
}
