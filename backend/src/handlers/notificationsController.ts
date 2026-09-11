import type { Request, Response } from "express";
import { ok } from "../http.ts";
import { store } from "../mongodb.ts";
import { Router } from "express";
import { requireSession, sessionUserId } from "../session.ts";
import { sendEvent } from "../services/events.ts";

export async function list(req: Request, res: Response) {
  const result = await store.notifications(sessionUserId(req), typeof req.query.cursor === "string" ? req.query.cursor : undefined);
  for (const notification of result.items) {
    sendEvent({
      content_id: notification.id,
      content_type: "notification",
      action: "delete",
      target_id: notification.target_id,
      timestamp: new Date().toISOString(),
    });
  }
  return ok(res, result.items, "Operation completed successfully.", 200, result.nextCursor);
}
export async function hasNotifications(req: Request, res: Response) {
  return ok(res, { hasNotifications: await store.hasNotifications(sessionUserId(req)) });
}

const r = Router();
r.get("/", requireSession, list);
r.get("/status", requireSession, hasNotifications);
export default r;
