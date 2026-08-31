import type { Request, Response } from "express";
import { fail, id, ok, required } from "../http.ts"
import { store } from "../mongodb.ts"
import { neo4jRelations, numberValue } from "../neo4j.ts"
import type { FollowRelationRequest, User } from "../types.ts";
import { Router } from "express";
import { requireSession, sessionUserId } from "../session.ts";
import { decodeCursor, nextCursor } from "../cursor.ts";

export async function getUser(req: Request, res: Response) {
  const user = await store.user(id(req));
  return user ? ok(res, user) : fail(res, 404, "User not found.");
}
export async function updateUser(req: Request, res: Response) {
  const userId = sessionUserId(req);
  if (id(req) !== userId) return fail(res, 403, "Only the account owner may edit it.");
  const user = await store.user(userId);
  if (!user) return fail(res, 404, "User not found.");
  if (req.body.pinned_posts && req.body.pinned_posts.length > 4)
    return fail(res, 400, "A user may pin at most four posts.");
  const updated = await store.updateUser(userId, req.body as Partial<User>);
  if (updated && Array.isArray(req.body.interests)) await neo4jRelations.interestIn(userId, updated.interests);
  return updated ? ok(res, updated) : fail(res, 404, "User not found.");
}
export async function deleteUser(req: Request, res: Response) {
  const userId = sessionUserId(req);
  if (id(req) !== userId) return fail(res, 403, "Only the account owner may delete it.");
  if (!(await store.deleteUser(userId)))
    return fail(res, 404, "User not found.");
  await neo4jRelations.deleteUserNode(userId);
  return ok(res, null, "User deleted successfully.");
}
export async function searchUsers(req: Request, res: Response) {
  const users = await store.searchUsers(String(req.query.q ?? ""));
  console.log(`[http] user search: ${users.length ? `found ${users.length}` : "not found"}`);
  return ok(res, users);
}
export async function recommendations(req: Request, res: Response) {
  if (!(await store.user(id(req)))) return fail(res, 404, "User not found.");
  const groups = await Promise.all([
    neo4jRelations.userRecommendationsByInterests(id(req)),
    neo4jRelations.userRecommendationsByCommunities(id(req)),
    neo4jRelations.userRecommendationsByFollowNetwork(id(req)),
  ]);
  const ranked = groups.flat().reduce((result, item) => {
    result.set(item.id, (result.get(item.id) ?? 0) + item.score);
    return result;
  }, new Map<string, number>());
  const ids = [...ranked.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([userId]) => userId);
  return ok(res, await store.usersByIds(ids));
}
export async function listRelatedUsers(req: Request, res: Response) {
  const user = await store.user(id(req));
  if (!user) return fail(res, 404, "User not found.");
  const direction = (req.params.relation ?? (req.path.endsWith("/followers") ? "followers" : "following")) as "followers" | "following";
  try {
    const filters = { user_id: id(req), relation: direction };
    const page = decodeCursor(typeof req.query.cursor === "string" ? req.query.cursor : undefined, filters);
    const userIds = await neo4jRelations.relatedUserIds(id(req), direction, page.offset, 11);
    const users = await store.usersByIds(userIds.slice(0, 10));
    return ok(res, users, "Operation completed successfully.", 200, nextCursor(page.offset, userIds.length, 10, filters));
  } catch {
    return fail(res, 400, "Malformed cursor.");
  }
}
export async function follow(req: Request, res: Response): Promise<Response> {
  const body = req.body as Partial<FollowRelationRequest>;
  const followerId = sessionUserId(req);
  const missing = required(body, ["followed_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (followerId === body.followed_id)
    return fail(res, 400, "A user cannot follow or unfollow themselves.");
  if (!(await store.user(followerId)))
    return fail(res, 404, "Follower user not found.");
  if (!(await store.user(body.followed_id!)))
    return fail(res, 404, "Followed user not found.");
  const enabled = req.method === "POST";
  const changed = numberValue(
    await neo4jRelations.follow(followerId, body.followed_id!, enabled),
  );
  if (changed)
    await store.updateFollowCounts(
      followerId,
      body.followed_id!,
      enabled ? 1 : -1,
    );
  if (!enabled && !changed)
    return fail(res, 409, "The follower was not following this user.");
  return ok(res, { active: enabled, changed: Boolean(changed) });
}

const router = Router();
router.get("/search", searchUsers);
router.get("/:id/recommendations", recommendations);
router.get("/:id/followers", listRelatedUsers);
router.get("/:id/following", listRelatedUsers);
router.get("/:id", getUser);
router.put("/:id", requireSession, updateUser);
router.delete("/:id", requireSession, deleteUser);
router.post("/follows", requireSession, follow);
router.delete("/follows", requireSession, follow);
export default router;
