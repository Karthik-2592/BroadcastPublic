import type { Request, Response } from "express";
import { fail, id, ok, required } from "../../http.ts";
import { store } from "../../store.ts";
import type { Comment } from "../../types.ts";
export async function list(req: Request, res: Response) {
  return ok(res, await store.commentsForPost(id(req)));
}
export async function create(req: Request, res: Response) {
  const missing = required(req.body, ["user_id", "content"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (!(await store.post(id(req)))) return fail(res, 404, "Post not found.");
  if (!(await store.user(String(req.body.user_id))))
    return fail(res, 404, "User not found.");
  const comment = await store.createComment({
    post_id: id(req),
    user_id: String(req.body.user_id),
    root: req.body.root ?? null,
    content: String(req.body.content),
    user_summary: req.body.user_summary,
  });
  return ok(res, comment, "Comment created successfully.", 201);
}
export async function update(req: Request, res: Response) {
  const comment = await store.comment(id(req));
  if (!comment) return fail(res, 404, "Comment not found.");
  if (req.body.user_id && req.body.user_id !== comment.user_id)
    return fail(res, 403, "Only the comment owner may edit it.");
  if (req.body.content === undefined)
    return fail(res, 400, "Content is required.");
  const updated = await store.updateComment(
    id(req),
    String(req.body.content),
    req.body.user_summary,
  );
  return updated ? ok(res, updated) : fail(res, 404, "Comment not found.");
}
export async function remove(req: Request, res: Response) {
  const comment = await store.comment(id(req));
  if (!comment) return fail(res, 404, "Comment not found.");
  const requestingUserId = String(req.body.user_id ?? "");
  if (!requestingUserId)
    return fail(res, 400, "Requesting user_id is required.");
  const post = await store.post(comment.post_id);
  const community = post?.community_id
    ? await store.community(post.community_id)
    : null;
  const isOwner = comment.user_id === requestingUserId;
  const isCommunityAdmin = community?.admin_id === requestingUserId;
  if (!isOwner && !isCommunityAdmin)
    return fail(
      res,
      403,
      "Only the comment owner or community admin may delete it.",
    );
  await store.deleteComment(id(req));
  return ok(res, null, "Comment deleted successfully.");
}
