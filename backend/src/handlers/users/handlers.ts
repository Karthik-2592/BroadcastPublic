import type { Request, Response } from "express";
import { fail, id, ok, required } from "../../http.ts";
import { store } from "../../store.ts";

const safe = (u: any) => {
  if (!u) return u;
  const { password: _password, ...value } = u;
  return value;
};

export function getUser(req: Request, res: Response) {
  const user = store.users.get(id(req));
  return user ? ok(res, safe(user)) : fail(res, 404, "User not found.");
}
export function updateUser(req: Request, res: Response) {
  const user = store.users.get(id(req));
  if (!user) return fail(res, 404, "User not found.");
  const allowed = [
    "interests",
    "profile_name",
    "profile_picture",
    "profile_description",
    "pinned_posts",
    "email",
  ];
  for (const field of allowed)
    if (req.body[field] !== undefined) (user as any)[field] = req.body[field];
  if (user.pinned_posts.length > 4)
    return fail(res, 400, "A user may pin at most four posts.");
  return ok(res, safe(user));
}
export function deleteUser(req: Request, res: Response) {
  const userId = id(req);
  if (!store.users.delete(userId)) return fail(res, 404, "User not found.");
  for (const post of store.posts.values())
    if (post.user_id === userId) post.user_id = null as any;
  for (const comment of store.comments.values())
    if (comment.user_id === userId) comment.user_id = null;
  return ok(res, null, "User deleted successfully.");
}
export function searchUsers(req: Request, res: Response) {
  const q = String(req.query.q ?? "").toLowerCase();
  return ok(
    res,
    [...store.users.values()]
      .filter((u) => u.username.toLowerCase().includes(q))
      .map(safe),
  );
}
export function recommendations(req: Request, res: Response) {
  const user = store.users.get(id(req));
  if (!user) return fail(res, 404, "User not found.");
  return ok(
    res,
    [...store.users.values()]
      .filter(
        (u) =>
          u.id !== user.id &&
          u.interests.some((i) => user.interests.includes(i)),
      )
      .map(safe),
  );
}
export function listRelations(req: Request, res: Response, reverse: boolean) {
  const userId = id(req);
  if (!store.users.has(userId)) return fail(res, 404, "User not found.");
  return ok(
    res,
    store
      .related("follow", userId, reverse)
      .map((x) => safe(store.users.get(x))),
  );
}
