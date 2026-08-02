import type { Request, Response } from "express";
import { fail, id, ok } from "../../http.ts";
import { store } from "../../store.ts";
function mutate(type: "follow", req: Request, res: Response, enabled: boolean) {
  const target = id(req);
  const user = String(req.body.user_id ?? req.body.follower_id ?? "");
  if (!store.users.has(user) || !store.users.has(target))
    return fail(res, 404, "User not found.");
  if (user === target) return fail(res, 400, "Users cannot follow themselves.");
  const before = store.has(type, user, target);
  store.toggle(type, user, target, enabled);
  if (!before && enabled) {
    store.users.get(user)!.following_count++;
    store.users.get(target)!.follower_count++;
  }
  if (before && !enabled) {
    store.users.get(user)!.following_count--;
    store.users.get(target)!.follower_count--;
  }
  return ok(res, { active: enabled });
}
export const follow = (q: Request, r: Response) => mutate("follow", q, r, true);
export const unfollow = (q: Request, r: Response) =>
  mutate("follow", q, r, false);
export function member(req: Request, res: Response) {
  const c = id(req);
  const u = String(req.body.user_id ?? "");
  if (!store.users.has(u) || !store.communities.has(c))
    return fail(res, 404, "User or community not found.");
  store.toggle("member", u, c, true);
  return ok(res, { active: true });
}
export function unmember(req: Request, res: Response) {
  store.toggle("member", String(req.body.user_id ?? ""), id(req), false);
  return ok(res, { active: false });
}
export function favoriteComment(req: Request, res: Response) {
  const c = store.comments.get(String(req.params.comment_id));
  const u = String(req.body.user_id ?? "");
  if (!c) return fail(res, 404, "Comment not found.");
  if (!store.has("favorite", u, c.id)) {
    store.toggle("favorite", u, c.id, true);
    c.favorite_count++;
  }
  return ok(res, { favorited: true });
}
export function unfavoriteComment(req: Request, res: Response) {
  const c = store.comments.get(String(req.params.comment_id));
  const u = String(req.body.user_id ?? "");
  if (c && store.has("favorite", u, c.id)) {
    store.toggle("favorite", u, c.id, false);
    c.favorite_count--;
  }
  return ok(res, { favorited: false });
}
