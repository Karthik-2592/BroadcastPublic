import type { Request, Response } from "express";
import { fail, id, ok, required } from "../../http.ts";
import { store } from "../../store.ts";
export function list(req: Request, res: Response) {
  return ok(
    res,
    [...store.comments.values()].filter((c) => c.post_id === id(req)),
  );
}
export function create(req: Request, res: Response) {
  const missing = required(req.body, ["user_id", "content"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  const post = store.posts.get(id(req));
  if (!post) return fail(res, 404, "Post not found.");
  const root = req.body.root ?? null;
  const comment = {
    id: store.id(),
    post_id: post.id,
    user_id: req.body.user_id,
    type: Boolean(req.body.type ?? false),
    root,
    content: String(req.body.content),
    user_summary: req.body.user_summary,
    favorite_count: 0,
    reply_count: 0,
    timestamp: new Date().toISOString(),
  };
  store.comments.set(comment.id, comment);
  post.comment_count++;
  if (root && store.comments.has(root)) store.comments.get(root)!.reply_count++;
  return ok(res, comment, "Comment created successfully.", 201);
}
export function update(req: Request, res: Response) {
  const c = store.comments.get(id(req));
  if (!c) return fail(res, 404, "Comment not found.");
  if (req.body.user_id && req.body.user_id !== c.user_id)
    return fail(res, 403, "Only the comment owner may edit it.");
  if (req.body.content === undefined)
    return fail(res, 400, "Content is required.");
  c.content = String(req.body.content);
  if (req.body.user_summary !== undefined)
    c.user_summary = req.body.user_summary;
  return ok(res, c);
}
export function remove(req: Request, res: Response) {
  const c = store.comments.get(id(req));
  if (!c) return fail(res, 404, "Comment not found.");
  if (req.body.user_id && req.body.user_id !== c.user_id)
    return fail(res, 403, "Only the comment owner may delete it.");
  for (const [key, x] of store.comments)
    if (x.id === c.id || (!c.root && x.root === c.id))
      store.comments.delete(key);
  const post = store.posts.get(c.post_id);
  if (post) post.comment_count = Math.max(0, post.comment_count - 1);
  return ok(res, null, "Comment deleted successfully.");
}
