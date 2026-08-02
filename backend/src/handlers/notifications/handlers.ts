import type { Request, Response } from "express";
import { fail, id, ok } from "../../http.ts";
import { store } from "../../store.ts";
export function list(req: Request, res: Response) {
  const u = String(req.query.user_id ?? "");
  return ok(
    res,
    [...store.notifications.values()].filter((n) => !u || n.user_id === u),
  );
}
export function read(req: Request, res: Response) {
  const n = store.notifications.get(id(req));
  if (!n) return fail(res, 404, "Notification not found.");
  n.read = true;
  return ok(res, n);
}
export function remove(req: Request, res: Response) {
  if (!store.notifications.delete(id(req)))
    return fail(res, 404, "Notification not found.");
  return ok(res, null, "Notification deleted successfully.");
}
