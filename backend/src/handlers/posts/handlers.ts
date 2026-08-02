import type { Request, Response } from "express";
import { fail, id, ok, required } from "../../http.ts";
import { store } from "../../store.ts";
export function createPost(req: Request, res: Response) {
  const missing = required(req.body, ["user_id", "content", "user_summary"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (!store.users.has(req.body.user_id))
    return fail(res, 404, "User not found.");
  const post = {
    id: store.id(),
    user_id: String(req.body.user_id),
    content: String(req.body.content),
    user_summary: req.body.user_summary,
    tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    media: Array.isArray(req.body.media) ? req.body.media : [],
    visibility: req.body.visibility ?? "public",
    favorite_count: 0,
    comment_count: 0,
    created_at: new Date().toISOString(),
  };
  store.posts.set(post.id, post);
  return ok(res, post, "Post created successfully.", 201);
}
export function getPost(req: Request, res: Response) {
  const post = store.posts.get(id(req));
  return post ? ok(res, post) : fail(res, 404, "Post not found.");
}
export function updatePost(req: Request, res: Response) {
  const post = store.posts.get(id(req));
  if (!post) return fail(res, 404, "Post not found.");
  if (req.body.user_id && req.body.user_id !== post.user_id)
    return fail(res, 403, "Only the post owner may edit it.");
  for (const f of ["content", "user_summary", "tags", "visibility"])
    if (req.body[f] !== undefined) (post as any)[f] = req.body[f];
  return ok(res, post);
}
export function deletePost(req: Request, res: Response) {
  const post = store.posts.get(id(req));
  if (!post) return fail(res, 404, "Post not found.");
  if (req.body.user_id && req.body.user_id !== post.user_id)
    return fail(res, 403, "Only the post owner may delete it.");
  store.posts.delete(post.id);
  for (const [key, c] of store.comments)
    if (c.post_id === post.id) store.comments.delete(key);
  return ok(res, null, "Post deleted successfully.");
}
export function feed(_req: Request, res: Response) {
  return ok(
    res,
    [...store.posts.values()].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    ),
  );
}
export function save(req: Request, res: Response) {
  const post = store.posts.get(id(req));
  const userId = String(req.body.user_id ?? req.query.user_id ?? "");
  if (!post) return fail(res, 404, "Post not found.");
  if (!store.users.has(userId)) return fail(res, 404, "User not found.");
  store.toggle("save", userId, post.id, true);
  return ok(res, { saved: true });
}
export function unsave(req: Request, res: Response) {
  store.toggle(
    "save",
    String(req.body.user_id ?? req.query.user_id ?? ""),
    id(req),
    false,
  );
  return ok(res, { saved: false });
}
export function savedPosts(req: Request, res: Response) {
  const userId = id(req);
  if (!store.users.has(userId)) return fail(res, 404, "User not found.");
  return ok(
    res,
    store
      .related("save", userId)
      .map((postId) => store.posts.get(postId))
      .filter(Boolean),
  );
}
export function favorite(req: Request, res: Response) {
  const post = store.posts.get(id(req));
  const userId = String(req.body.user_id ?? "");
  if (!post) return fail(res, 404, "Post not found.");
  if (!store.users.has(userId)) return fail(res, 404, "User not found.");
  if (!store.has("favorite", userId, post.id)) {
    store.toggle("favorite", userId, post.id, true);
    post.favorite_count++;
  }
  return ok(res, { favorited: true });
}
export function unfavorite(req: Request, res: Response) {
  const post = store.posts.get(id(req));
  if (post && store.has("favorite", String(req.body.user_id ?? ""), post.id)) {
    store.toggle("favorite", String(req.body.user_id), post.id, false);
    post.favorite_count--;
  }
  return ok(res, { favorited: false });
}
