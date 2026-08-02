import type { Request, Response } from "express";
import { fail, id, ok, required } from "../../http.ts";
import { store } from "../../store.ts";
import type { Post } from "../../types.ts";
interface PostBody {
  user_id: string;
  content: string;
  user_summary: unknown;
  tags?: string[];
  media?: unknown[];
  visibility?: string | null;
}
export async function createPost(req: Request, res: Response) {
  const body = req.body as Partial<PostBody>;
  const missing = required(body, ["user_id", "content", "user_summary"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (!(await store.user(String(body.user_id))))
    return fail(res, 404, "User not found.");
  const post = await store.createPost({
    user_id: String(body.user_id),
    content: String(body.content),
    user_summary: body.user_summary,
    tags: body.tags ?? [],
    media: body.media ?? [],
    visibility: body.visibility ?? "public",
    popularity_score: 0,
  });
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
  if (req.body.user_id && req.body.user_id !== post.user_id)
    return fail(res, 403, "Only the post owner may delete it.");
  await store.deletePost(id(req));
  return ok(res, null, "Post deleted successfully.");
}
export async function feed(_req: Request, res: Response) {
  return ok(res, await store.feed());
}
