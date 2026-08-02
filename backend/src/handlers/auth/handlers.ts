import type { Request, Response } from "express";
import { fail, ok, required } from "../../http.ts";
import { store } from "../../store.ts";
import type { LoginRequest, RegisterRequest } from "../../types.ts";
export async function register(req: Request, res: Response): Promise<Response> {
  const body = req.body as Partial<RegisterRequest>;
  const missing = required(body, ["username", "password", "email"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  const user = await store.register(body as RegisterRequest);
  if (!user) return fail(res, 409, "Username or email is already in use.");
  return ok(res, user, "User registered successfully.", 201);
}
export async function login(req: Request, res: Response): Promise<Response> {
  const body = req.body as LoginRequest;
  const identity = body.username ?? body.email ?? "";
  const user = await store.authenticate(identity, body.password);
  if (!user) return fail(res, 401, "Invalid credentials.");
  return ok(
    res,
    { token: `session-${user.id}`, user_id: user.id },
    "Authenticated successfully.",
  );
}
export function logout(_req: Request, res: Response): Response {
  return ok(res, null, "Logged out successfully.");
}
