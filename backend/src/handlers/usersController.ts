import type { Request, Response } from "express";
import { fail, id, ok, required } from "../http.ts"
import { store } from "../mongodb.ts"
import { neo4jRelations, numberValue } from "../neo4j.ts"
import type { FollowRelationRequest, User } from "../types.ts";
import { Router } from "express";
import { requireSession, sessionUserId } from "../session.ts";
import { decodeCursor, createNextCursor } from "../cursor.ts";
import { mediaUrl, saveMedia, type UploadedFile } from "../media.ts";
import { sendEvent } from "../services/events.ts";

export async function getUser(req: Request, res: Response) {
  const user = await store.user(id(req));
  return user ? ok(res, user) : fail(res, 404, "User not found.");
}
export async function updateUser(req: Request, res: Response) {
  const userId = sessionUserId(req);
  if (id(req) !== userId) return fail(res, 403, "Only the account owner may edit it.");
  const user = await store.user(userId);
  if (!user) return fail(res, 404, "User not found.");

  const updated = await store.updateUser(userId, req.body as Partial<User>);
  if (updated && Array.isArray(req.body.interests)) await neo4jRelations.interestIn(userId, updated.interests);
  if (updated) {
    sendEvent({
      content_id: userId,
      content_type: "user",
      action: "post",
      target_id: null,
      timestamp: new Date().toISOString(),
    });
  }

  return updated ? ok(res, updated) : fail(res, 404, "User not found.");
}
export async function uploadProfilePicture(req: Request, res: Response) {
  const userId = id(req);
  if (userId !== sessionUserId(req)) return fail(res, 403, "Only the account owner may upload a profile picture.");
  if (!(await store.user(userId))) return fail(res, 404, "User not found.");
  const file = (((req as unknown as { files?: UploadedFile[] }).files) ?? [])[0];
  if (!file) return fail(res, 400, "A profile picture is required.");
  const saved = await saveMedia(file, userId, "profile", 0, "PUT");
  const updated = await store.updateUser(userId, { profile_picture: { media_id: saved.media_id, media_url: mediaUrl(saved.path), mime_type: saved.mime_type } });
  if (updated) {
    sendEvent({
      content_id: userId,
      content_type: "user",
      action: "post",
      target_id: null,
      timestamp: new Date().toISOString(),
    });
  }
  return updated ? ok(res, updated, "Profile picture uploaded successfully.", 201) : fail(res, 500, "Unable to store profile picture metadata.");
}
export async function deleteUser(req: Request, res: Response) {
  const userId = sessionUserId(req);
  if (id(req) !== userId) return fail(res, 403, "Only the account owner may delete it.");
  if (!(await store.deleteUser(userId)))
    return fail(res, 404, "User not found.");
  sendEvent({
    content_id: userId,
    content_type: "user",
    action: "delete",
    target_id: null,
    timestamp: new Date().toISOString(),
  });
  return ok(res, null, "User deleted successfully.");
}
export async function searchUsers(req: Request, res: Response) {
  const users = await store.searchUsers(String(req.query.q ?? ""));
  console.log(`[http] user search: ${users.length ? `found ${users.length}` : "not found"}`);
  return ok(res, users);
}
export async function listUserPosts(req: Request, res: Response) {
  if (!(await store.user(id(req)))) return fail(res, 404, "User not found.");
  try {
    const page = await store.postsByUserId(
      id(req),
      typeof req.query.cursor === "string" ? req.query.cursor : undefined,
    );
    return ok(res, page.items, "Operation completed successfully.", 200, page.nextCursor);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Malformed cursor.";
    return fail(res, 400, message);
  }
}
export async function listUserComments(req: Request, res: Response) {
  if (!(await store.user(id(req)))) return fail(res, 404, "User not found.");
  try {
    const page = await store.commentsByUserId(
      id(req),
      typeof req.query.cursor === "string" ? req.query.cursor : undefined,
    );
    return ok(res, page.items, "Operation completed successfully.", 200, page.nextCursor);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Malformed cursor.";
    return fail(res, 400, message);
  }
}
export async function listUserSavedPosts(req: Request, res: Response) {
  const userId = id(req);
  if (userId !== sessionUserId(req)) return fail(res, 403, "Only the owner may view saved posts.");
  if (!(await store.user(userId))) return fail(res, 404, "User not found.");
  try {
    const filters = { user_id: userId, type: "saved" };
    const page = decodeCursor(typeof req.query.cursor === "string" ? req.query.cursor : undefined, filters);
    const lastPostId = page.values?.id as string | undefined;
    const postIds = await neo4jRelations.savedPostIds(userId, lastPostId, 11);
    const posts = await store.postsByIds(postIds.slice(0, 10));
    const byId = new Map(posts.map((p) => [p.id, p]));
    const ordered = postIds.slice(0, 10).flatMap((pid) => byId.has(pid) ? [byId.get(pid)!] : []);
    const lastItem = postIds.length > 10 && ordered.length > 0 ? ordered[ordered.length - 1] : null;
    return ok(res, ordered, "Operation completed successfully.", 200, createNextCursor(lastItem as Record<string, unknown> | null, "id", filters));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Malformed cursor.";
    return fail(res, 400, message);
  }
}
export async function recommendations(req: Request, res: Response) {
  if (!(await store.user(id(req)))) return fail(res, 404, "User not found.");
  const groups = await neo4jRelations.userRecommendationsGrouped(id(req));
  const ids = [...new Set(groups.flat())].slice(0, 4);
  return ok(res, await store.usersByIds(ids));
}
export async function listRelatedUsers(req: Request, res: Response) {
  const user = await store.user(id(req));
  if (!user) return fail(res, 404, "User not found.");
  const direction = (req.params.relation ?? (req.path.endsWith("/followers") ? "followers" : "following")) as "followers" | "following";
  try {
    const filters = { user_id: id(req), relation: direction };
    const page = decodeCursor(typeof req.query.cursor === "string" ? req.query.cursor : undefined, filters);
    const lastUserId = page.values?.id as string | undefined;
    const userIds = await neo4jRelations.relatedUserIds(id(req), direction, lastUserId, 11);
    const users = await store.usersByIds(userIds.slice(0, 10));
    const lastItem = userIds.length > 10 && users.length > 0 ? users[users.length - 1] : null;
    return ok(res, users, "Operation completed successfully.", 200, createNextCursor(lastItem as Record<string, unknown> | null, "id", filters));
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
  if (enabled && changed) {
    await store.createNotification({
      target_id: body.followed_id!,
      event_type: "user_follow",
      event_id: followerId,
    });
  }
  if (!enabled && !changed)
    return fail(res, 409, "The follower was not following this user.");
  return ok(res, { active: enabled, changed: Boolean(changed) });
}
export async function followStatus(req: Request, res: Response) {
  const userId = sessionUserId(req);
  if (!(await store.user(id(req)))) return fail(res, 404, "User not found.");
  return ok(res, { active: await neo4jRelations.isFollowing(userId, id(req)) });
}

const router = Router();
router.get("/search", searchUsers);
router.get("/:id/posts", listUserPosts);
router.get("/:id/comments", listUserComments);
router.get("/:id/saves", requireSession, listUserSavedPosts);
router.get("/:id/saved-posts", requireSession, listUserSavedPosts);
router.get("/:id/recommendations", recommendations);
router.get("/:id/followers", listRelatedUsers);
router.get("/:id/following", listRelatedUsers);
router.get("/:id/follows/status", requireSession, followStatus);
router.get("/:id", getUser);
router.put("/:id", requireSession, updateUser);
router.delete("/:id", requireSession, deleteUser);
router.post("/follows", requireSession, follow);
router.delete("/follows", requireSession, follow);
export default router;
