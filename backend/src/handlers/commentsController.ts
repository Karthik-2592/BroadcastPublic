import type { Request, Response } from "express";
import { fail, id, ok, required } from "../http.ts";
import { store } from "../mongodb.ts";
import { queueFavoriteEvent } from "../services/favorites.ts";
import type { Comment, CommentLikeRelationRequest } from "../types.ts";
import { Router } from "express";
import { requireSession, sessionUserId } from "../session.ts";

export async function list(req: Request, res: Response) {
  try {
    const page = await store.commentsForPost(id(req), null, typeof req.query.cursor === "string" ? req.query.cursor : undefined);
    return ok(res, page.items, "Operation completed successfully.", 200, page.nextCursor);
  } catch {
    return fail(res, 400, "Malformed cursor.");
  }
}
export async function replies(req: Request, res: Response) {
  try {
    const page = await store.repliesForComment(id(req), typeof req.query.cursor === "string" ? req.query.cursor : undefined);
    return ok(res, page.items, "Operation completed successfully.", 200, page.nextCursor);
  } catch {
    return fail(res, 400, "Malformed cursor.");
  }
}
export async function create(req: Request, res: Response) {
  console.log(`[http] POST /posts/${id(req)}/comments received`);
  const userId = sessionUserId(req);
  const missing = required(req.body, ["content", "user_summary"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (!(await store.post(id(req)))) return fail(res, 404, "Post not found.");
  if (!(await store.user(userId)))
    return fail(res, 404, "User not found.");
  const comment = await store.createComment({
    post_id: id(req),
    user_id: userId,
    root: req.body.root ?? null,
    content: String(req.body.content),
    user_summary: req.body.user_summary,
  });
  return ok(res, comment, "Comment created successfully.", 201);
}
export async function update(req: Request, res: Response) {
  const comment = await store.comment(id(req));
  if (!comment) return fail(res, 404, "Comment not found.");
  if (comment.user_id !== sessionUserId(req))
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
  const requestingUserId = sessionUserId(req);
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
export async function commentLike(
  req: Request,
  res: Response,
): Promise<Response> {
  const body = req.body as Partial<CommentLikeRelationRequest>;
  const userId = sessionUserId(req);
  const missing = required(body, ["post_id", "comment_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  const comment = await store.comment(body.comment_id!);
  if (
    !(await store.user(userId)) ||
    !(await store.post(body.post_id!)) ||
    !comment ||
    comment.post_id !== body.post_id
  )
    return fail(res, 404, "User, post, or comment not found.");
  const enabled = req.method === "POST";
  queueFavoriteEvent({
    target: "comment",
    targetId: body.comment_id!,
    userId,
    favorited: enabled,
  });
  return ok(res, { favorited: enabled, queued: true });
}
export async function commentLikeStatus(req: Request, res: Response) {
  const userId = sessionUserId(req);
  if (!(await store.comment(id(req)))) return fail(res, 404, "Comment not found.");
  return ok(res, { active: await store.isCommentFavorited(id(req), userId) });
}

const router = Router({ mergeParams: true });
router.get("/", list);
router.get("/:id/likes/status", requireSession, commentLikeStatus);
router.post("/", requireSession, create);
router.post("/likes", requireSession, commentLike);
router.delete("/likes", requireSession, commentLike);
export default router;
export const standalone = Router();
standalone.get("/:id/replies", replies);
standalone.put("/:id", requireSession, update);
standalone.delete("/:id", requireSession, remove);
