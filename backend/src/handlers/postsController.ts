import type { Request, Response } from "express";
import { fail, id, ok, required } from "../http.ts";
import { store } from "../mongodb.ts";
import { neo4jRelations, numberValue } from "../neo4j.ts";
import { queueFavoriteEvent } from "../services/favorites.ts";
import type { Post, PostLikeRelationRequest, SaveRelationRequest } from "../types.ts";
import { Router } from "express";
import commentRouter from "./commentsController.ts";
import { requireSession, sessionUserId } from "../session.ts";
import { env } from "../config/env.ts";
import { mediaUrl, saveMedia, type UploadedFile } from "../media.ts";

interface PostBody {
  user_id: string;
  community_id?: string | null;
  community_name?: string | null;
  title: string;
  content: string;
  user_summary: unknown;
  tags?: string[];
  media?: [];
}
export async function createPost(req: Request, res: Response) {
  const body = req.body as Partial<PostBody>;
  const userId = sessionUserId(req);
  const missing = required(body, ["title", "content"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (typeof body.title !== "string" || body.title.length > 75)
    return fail(res, 400, "title must be a string of at most 75 characters.");
  if (typeof body.content !== "string" || body.content.length > 200)
    return fail(res, 400, "content must be a string of at most 200 characters.");
  if (
    body.tags !== undefined &&
    (!Array.isArray(body.tags) ||
      !body.tags.every((tag) => typeof tag === "string"))
  )
    return fail(res, 400, "tags must be an array of strings.");
  if (body.media !== undefined && !Array.isArray(body.media))
    return fail(res, 400, "media must be an array.");
  if (body.user_summary !== undefined) {
    const summary = body.user_summary as Record<string, unknown> | null;
    if (!summary || typeof summary.username !== "string")
      return fail(res, 400, "user_summary must contain username.");
  }
  if (body.user_summary === undefined)
    return fail(res, 400, "user_summary is required.");
  if (!(await store.user(userId)))
    return fail(res, 404, "User not found.");
  const communityName = body.community_name ?? body.community_id;
  let communityId = env.publicCommunityId;
  if (communityName && communityName !== "Global") {
    const community = await store.communityByName(String(communityName));
    if (!community) return fail(res, 404, "Community not found.");
    communityId = community.id;
  }
  const post = await store.createPost({
    user_id: userId,
    community_id: communityId,
    title: String(body.title),
    content: String(body.content),
    user_summary: body.user_summary,
    tags: body.tags ?? [],
    media: body.media ?? [],
    popularity_score: 0,
  });
  await neo4jRelations.createPostNode(post.id, post.community_id);
  return ok(res, post, "Post created successfully.", 201);
}
export async function getPost(req: Request, res: Response) {
  const post = await store.post(id(req));
  return post ? ok(res, post) : fail(res, 404, "Post not found.");
}
export async function uploadPostMedia(req: Request, res: Response) {
  const postId = id(req);
  const post = await store.post(postId);
  if (!post) return fail(res, 404, "Post not found.");
  if (post.user_id !== sessionUserId(req)) return fail(res, 403, "Only the post owner may upload media.");
  const files = (((req as unknown as { files?: UploadedFile[] }).files) ?? []);
  if (!files.length) return fail(res, 400, "At least one image is required.");
  const saved = await Promise.all(files.map((file, index) => saveMedia(file, postId, "post", index + 1)));
  const media = saved.map((item) => ({ media_id: item.media_id, media_url: mediaUrl(req, item.path), mime_type: item.mime_type }));
  const updated = await store.updatePost(postId, { media: [...(post.media ?? []), ...media] });
  return updated ? ok(res, updated, "Media uploaded successfully.", 201) : fail(res, 500, "Unable to store media metadata.");
}
export async function updatePost(req: Request, res: Response) {
  const post = await store.post(id(req));
  if (!post) return fail(res, 404, "Post not found.");
  if (post.user_id !== sessionUserId(req))
    return fail(res, 403, "Only the post owner may edit it.");
  const updated = await store.updatePost(id(req), req.body as Partial<Post>);
  if (updated) await neo4jRelations.setPostCommunity(updated.id, updated.community_id ?? null);
  return updated ? ok(res, updated) : fail(res, 404, "Post not found.");
}
export async function deletePost(req: Request, res: Response) {
  const post = await store.post(id(req));
  if (!post) return fail(res, 404, "Post not found.");
  const requestingUserId = sessionUserId(req);
  const community = post.community_id
    ? await store.community(post.community_id)
    : null;
  const isOwner = post.user_id === requestingUserId;
  const isCommunityAdmin = community?.admin_id === requestingUserId;
  if (!isOwner && !isCommunityAdmin)
    return fail(res, 403, "Only the post owner or community admin may delete it.");
  const deleted = await store.deletePost(id(req));
  if (deleted) await neo4jRelations.deletePostNode(id(req));
  return ok(res, null, "Post deleted successfully.");
}
export async function feed(_req: Request, res: Response) {
  try {
    const page = await store.feed(typeof _req.query.cursor === "string" ? _req.query.cursor : undefined);
    return ok(res, page.items, "Operation completed successfully.", 200, page.nextCursor);
  } catch {
    return fail(res, 400, "Malformed cursor.");
  }
}
export async function postLike(req: Request, res: Response): Promise<Response> {
  const body = req.body as Partial<PostLikeRelationRequest>;
  const userId = sessionUserId(req);
  const missing = required(body, ["post_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (!(await store.user(userId)) || !(await store.post(body.post_id!)))
    return fail(res, 404, "User or post not found.");
  const enabled = req.method === "POST";
  queueFavoriteEvent({
    target: "post",
    targetId: body.post_id!,
    userId,
    favorited: enabled,
  });
  return ok(res, { favorited: enabled, queued: true });
}
export async function postLikeStatus(req: Request, res: Response) {
  const userId = sessionUserId(req);
  if (!(await store.post(id(req)))) return fail(res, 404, "Post not found.");
  return ok(res, { active: await neo4jRelations.isPostLiked(userId, id(req)) });
}
export async function postSaveStatus(req: Request, res: Response) {
  const userId = sessionUserId(req);
  if (!(await store.post(id(req)))) return fail(res, 404, "Post not found.");
  return ok(res, { active: await neo4jRelations.isPostSaved(userId, id(req)) });
}
export async function save(req: Request, res: Response): Promise<Response> {
  const body = req.body as Partial<SaveRelationRequest>;
  const userId = sessionUserId(req);
  const missing = required(body, ["post_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (!(await store.user(userId)) || !(await store.post(body.post_id!)))
    return fail(res, 404, "User or post not found.");
  const enabled = req.method === "POST";
  const changed = numberValue(
    await neo4jRelations.save(userId, body.post_id!, enabled),
  );
  return ok(res, { saved: enabled, changed: Boolean(changed) });
}

const router = Router();
router.get("/feed", feed);
router.post("/", requireSession, createPost);
router.get("/:id", getPost);
router.get("/:id/likes/status", requireSession, postLikeStatus);
router.get("/:id/saves/status", requireSession, postSaveStatus);
router.put("/:id", requireSession, updatePost);
router.delete("/:id", requireSession, deletePost);
router.use("/:id/comments", commentRouter);
router.post("/likes", requireSession, postLike);
router.delete("/likes", requireSession, postLike);
router.post("/saves", requireSession, save);
router.delete("/saves", requireSession, save);
export default router;
