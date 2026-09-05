import type { Request, Response } from "express";
import { fail, ok, required } from "../http.ts";
import { store } from "../mongodb.ts";
import { neo4jRelations } from "../neo4j.ts";
import type { LoginRequest, RegisterRequest } from "../types.ts";
import { Router } from "express";
import { requireSession, type SessionRequest } from "../session.ts";
import { feedService } from "../services/feed.ts";


export async function register(req: Request, res: Response): Promise<Response> {
  const body = req.body as Partial<RegisterRequest>;
  const missing = required(body, ["username", "password", "email"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  const user = await store.register(body as RegisterRequest);
  if (!user) return fail(res, 409, "Username or email is already in use.");
  await neo4jRelations.createUserNode(user.id);
  await neo4jRelations.interestIn(user.id, user.interests);
  (req as SessionRequest).session.userId = user.id;
  return ok(res, user, "User registered successfully.", 201);
}
export async function login(req: Request, res: Response): Promise<Response> {
  const body = req.body as LoginRequest;
  const identity = body.username ?? body.email ?? "";
  const user = await store.authenticate(identity, body.password);
  if (!user) return fail(res, 401, "Invalid credentials.");

  const session = (req as SessionRequest).session;
  session.userId = user.id;
  await feedService.initializeSession(user.id);
  return ok(
    res,
    { token: `session-${user.id}`, user_id: user.id },
    "Authenticated successfully.",
  );
}
export function logout(req: Request, res: Response): Response {
  const session = req as SessionRequest;
  const userId = session.session.userId;
  if (userId) feedService.destroy(userId);
  session.session.destroy(() => undefined);
  return ok(res, null, "Logged out successfully.");
}
export async function currentSession(req: Request, res: Response): Promise<Response> {
  const session = (req as SessionRequest).session;
  const userId = session?.userId;
  if (!userId) return fail(res, 401, "No active session.");
  const user = await store.user(userId);
  if (!user) return fail(res, 401, "Session user not found.");
  return ok(res, user, "Session is valid.");
}

const router = Router();
router.post("/users", register);
router.post("/sessions", login);
router.get("/sessions/current", currentSession);
router.delete("/sessions/current", requireSession, logout);
export default router;
