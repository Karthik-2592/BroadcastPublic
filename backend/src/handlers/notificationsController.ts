import type { Request, Response } from "express";
import { fail, id, ok } from "../http.ts";
import { store } from "../mongodb.ts";
import { Router } from "express";

export async function list(req: Request, res: Response) {
  return ok(
    res,
    await store.notifications(
      req.query.user_id ? String(req.query.user_id) : undefined,
    ),
  );
}
export async function read(req: Request, res: Response) {
  const notification = await store.notification(id(req), true);
  return notification
    ? ok(res, notification)
    : fail(res, 404, "Notification not found.");
}
export async function remove(req: Request, res: Response) {
  if (!(await store.deleteNotification(id(req))))
    return fail(res, 404, "Notification not found.");
  return ok(res, null, "Notification deleted successfully.");
}

const r = Router();
r.get("/", list);
r.patch("/:id", read);
r.delete("/:id", remove);
export default r;
