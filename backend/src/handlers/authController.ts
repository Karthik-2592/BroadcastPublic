import type { Request, Response } from "express";
import { fail, ok, required } from "../http.ts";
import { store } from "../mongodb.ts";
import { neo4jRelations } from "../neo4j.ts";
import type { LoginRequest, RegisterRequest } from "../types.ts";
import { Router } from "express";
import { requireSession } from "../session.ts";


export async function register(req: Request, res: Response): Promise<Response> {
  const body = req.body as Partial<RegisterRequest>;
  const missing = required(body, ["username", "password", "email"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  const user = await store.register(body as RegisterRequest);
  if (!user) return fail(res, 409, "Username or email is already in use.");
  await neo4jRelations.createUserNode(user.id);
  return ok(res, user, "User registered successfully.", 201);
}
export async function login(req: Request, res: Response): Promise<Response> {


  const body = req.body as LoginRequest;
  const identity = body.username ?? body.email ?? "";
  const user = await store.authenticate(identity, body.password);
  if (!user) return fail(res, 401, "Invalid credentials.");
  (req as Request & { session: { id: string } }).session.id = user.id;
  return ok(
    res,
    { token: `session-${user.id}`, user_id: user.id },
    "Authenticated successfully.",
  );
}
export function logout(req: Request, res: Response): Response {
  (req as Request & { session: { destroy: (callback: () => void) => void } }).session.destroy(() => undefined);
  return ok(res, null, "Logged out successfully.");
}

const router = Router();
router.post("/users", register);
router.post("/sessions", login);
router.delete("/sessions/current", requireSession, logout);
export default router;
