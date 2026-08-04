import type { Request, Response } from "express";
import { fail, id, ok } from "../../http.ts";
import { store } from "../../store.ts";
import type { User } from "../../types.ts";
export async function getUser(req: Request, res: Response) {
  const user = await store.user(id(req));
  return user ? ok(res, user) : fail(res, 404, "User not found.");
}
export async function updateUser(req: Request, res: Response) {
  const user = await store.user(id(req));
  if (!user) return fail(res, 404, "User not found.");
  if (req.body.pinned_posts && req.body.pinned_posts.length > 4)
    return fail(res, 400, "A user may pin at most four posts.");
  const updated = await store.updateUser(id(req), req.body as Partial<User>);
  return updated ? ok(res, updated) : fail(res, 404, "User not found.");
}
export async function deleteUser(req: Request, res: Response) {
  if (!(await store.deleteUser(id(req))))
    return fail(res, 404, "User not found.");
  return ok(res, null, "User deleted successfully.");
}
export async function searchUsers(req: Request, res: Response) {
  const users = await store.searchUsers(String(req.query.q ?? ""));
  console.log(`[http] user search: ${users.length ? `found ${users.length}` : "not found"}`);
  return ok(res, users);
}
export async function recommendations(req: Request, res: Response) {
  const users = await store.recommendations(id(req));
  return users ? ok(res, users) : fail(res, 404, "User not found.");
}
