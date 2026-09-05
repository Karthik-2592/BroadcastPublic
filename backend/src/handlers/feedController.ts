import type { Request, Response } from "express";
import { fail, ok } from "../http.ts";
import { feedService } from "../services/feed.ts";
import { store } from "../mongodb.ts";
import { requireSession, sessionUserId } from "../session.ts";
import { Router } from "express";

export async function getFeed(req: Request, res: Response) {
  try {
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
    const page = await feedService.getFeed(sessionUserId(req), typeof req.query.cursor === "string" ? req.query.cursor : undefined, limit);
    return ok(res, page.posts, "Operation completed successfully.", 200, page.cursor);
  } catch {
    return fail(res, 400, "Malformed request.");
  }
}

export async function getTrending(req: Request, res: Response) {
  try {
    const page = await store.trending(typeof req.query.cursor === "string" ? req.query.cursor : undefined);
    return ok(res, page.items, "Operation completed successfully.", 200, page.nextCursor);
  } catch {
    return fail(res, 400, "Malformed cursor.");
  }
}

const router = Router();
router.get("/trending", getTrending);
router.get("/", requireSession, getFeed);
export default router;
