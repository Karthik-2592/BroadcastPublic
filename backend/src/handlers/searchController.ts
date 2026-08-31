import type { Request, Response } from "express";
import { fail, ok } from "../http.ts";
import { store } from "../mongodb.ts";

export async function search(req: Request, res: Response) {
  const query = String(req.query.q ?? req.query.query ?? "").trim();
  if (!query) return fail(res, 400, "A search query is required.");
  return ok(res, await store.search(query));
}
