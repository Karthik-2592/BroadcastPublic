import { store } from "../../store.ts";
import { fail, ok, required } from "../../http.ts";
import type { Request, Response } from "express";

export function register(req: Request, res: Response) {
  const missing = required(req.body, ["username", "password", "email"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (
    [...store.users.values()].some(
      (u) => u.username === req.body.username || u.email === req.body.email,
    )
  )
    return fail(res, 409, "Username or email is already in use.");
  const user = {
    id: store.id(),
    username: String(req.body.username),
    email: String(req.body.email),
    password: String(req.body.password),
    interests: Array.isArray(req.body.interests) ? req.body.interests : [],
    profile_name: req.body.profile_name,
    profile_picture: req.body.profile_picture,
    profile_description: req.body.profile_description,
    pinned_posts: [],
    follower_count: 0,
    following_count: 0,
  };
  store.users.set(user.id, user);
  const { password: _password, ...safe } = user;
  return ok(res, safe, "User registered successfully.", 201);
}
export function login(req: Request, res: Response) {
  const user = [...store.users.values()].find(
    (u) =>
      (u.username === req.body.username || u.email === req.body.email) &&
      u.password === req.body.password,
  );
  if (!user) return fail(res, 401, "Invalid credentials.");
  return ok(
    res,
    { token: `in-memory-${user.id}`, user_id: user.id },
    "Authenticated successfully.",
  );
}
export function logout(_req: Request, res: Response) {
  return ok(res, null, "Logged out successfully.");
}
