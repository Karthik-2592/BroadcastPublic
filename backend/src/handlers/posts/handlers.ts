import type { Request, Response } from "express";
import { fail, id, ok, required } from "../../http.ts";
import { store } from "../../store.ts";
import { neo4jRelations } from "../../relations/neo4j.ts";
import type { Post } from "../../types.ts";
interface PostBody {
  user_id: string;
  community_id?: string | null;
  title: string;
  content: string;
  user_summary: unknown;
  tags?: string[];
  media?: unknown[];
}
export async function createPost(req: Request, res: Response) {
  const body = req.body as Partial<PostBody>;
  const missing = required(body, ["user_id", "title", "content"]);
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
  if (!(await store.user(String(body.user_id))))
    return fail(res, 404, "User not found.");
  const post = await store.createPost({
    user_id: String(body.user_id),
    community_id: body.community_id
      ? String(body.community_id)
      : null,
    title: String(body.title),
    content: String(body.content),
    user_summary: body.user_summary,
    tags: body.tags ?? [],
    media: body.media ?? [],
    popularity_score: 0,
  });
  await neo4jRelations.createPostNode(post.id);
  return ok(res, post, "Post created successfully.", 201);
}
export async function getPost(req: Request, res: Response) {
  const post = await store.post(id(req));
  return post ? ok(res, post) : fail(res, 404, "Post not found.");
}
export async function updatePost(req: Request, res: Response) {
  const post = await store.post(id(req));
  if (!post) return fail(res, 404, "Post not found.");
  if (req.body.user_id && req.body.user_id !== post.user_id)
    return fail(res, 403, "Only the post owner may edit it.");
  const updated = await store.updatePost(id(req), req.body as Partial<Post>);
  return updated ? ok(res, updated) : fail(res, 404, "Post not found.");
}
export async function deletePost(req: Request, res: Response) {
  const post = await store.post(id(req));
  if (!post) return fail(res, 404, "Post not found.");
  const requestingUserId = String(req.body.user_id ?? "");
  if (!requestingUserId)
    return fail(res, 400, "Requesting user_id is required.");
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
  return ok(res, await store.feed());
}
