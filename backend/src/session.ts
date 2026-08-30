import type { NextFunction, Request, RequestHandler, Response } from "express";
import session from "express-session";
import { fail } from "./http.ts";
import { store } from "./mongodb.ts";
import { env } from "./config/env.ts";

type Session = { id?: string; destroy(callback: (error?: unknown) => void): void };
export type SessionRequest = Request & { session: Session };

export const sessionMiddleware: RequestHandler = session({
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true },
});

export async function requireSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionRequest = req as SessionRequest;
  const userId = sessionRequest.session?.id;
  const user = userId ? await store.user(userId) : null;
  if (!user || user.id !== userId) {
    fail(res, 401, "Authentication required.");
    return;
  }
  next();
}

export function sessionUserId(req: Request): string {
  const userId = (req as SessionRequest).session.id;
  if (!userId) throw new Error("Authenticated session is missing an id.");
  return userId;
}
