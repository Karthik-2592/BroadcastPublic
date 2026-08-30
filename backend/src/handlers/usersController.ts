import type { Request, Response } from "express";
import { fail, id, ok, required } from "../http.ts"
import { store } from "../mongodb.ts"
import { neo4jRelations, numberValue } from "../neo4j.ts"
import type { FollowRelationRequest, User } from "../types.ts";
import { Router } from "express";
import { requireSession, sessionUserId } from "../session.ts";

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
  return updated ? ok(res, updated) : fail(res, 404, "User not found.");
}
export async function deleteUser(req: Request, res: Response) {
  const userId = sessionUserId(req);
  if (id(req) !== userId) return fail(res, 403, "Only the account owner may delete it.");
  if (!(await store.deleteUser(userId)))
    return fail(res, 404, "User not found.");
  return ok(res, null, "User deleted successfully.");
}
export async function searchUsers(req: Request, res: Response) {
  const users = await store.searchUsers(String(req.query.q ?? ""));
  console.log(`[http] user search: ${users.length ? `found ${users.length}` : "not found"}`);
  return ok(res, users);
}
export async function recommendations(req: Request, res: Response) {
  const users = await store.recommendations(id(req));
  return users ? ok(res, users) : fail(res, 404, "User not found.");
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
router.get("/:id", getUser);
router.put("/:id", requireSession, updateUser);
router.delete("/:id", requireSession, deleteUser);
router.post("/follows", requireSession, follow);
router.delete("/follows", requireSession, follow);
export default router;
