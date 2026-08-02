import type { Request, Response } from "express";
import { fail, id, ok, required } from "../../http.ts";
import { store } from "../../store.ts";
export function create(req: Request, res: Response) {
  const m = required(req.body, ["user_id", "community_name", "community_desc"]);
  if (m.length)
    return fail(res, 400, `Missing required fields: ${m.join(", ")}`);
  if (!store.users.has(req.body.user_id))
    return fail(res, 404, "User not found.");
  const c = {
    id: store.id(),
    community_name: String(req.body.community_name),
    community_desc: String(req.body.community_desc),
    admin_id: String(req.body.user_id),
    tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    community_banner: req.body.community_banner,
    population: 1,
    post_count: 0,
    timestamp: new Date().toISOString(),
  };
  store.communities.set(c.id, c);
  store.toggle("member", c.admin_id, c.id, true);
  return ok(res, c, "Community created successfully.", 201);
}
export function get(req: Request, res: Response) {
  const c = store.communities.get(id(req));
  return c ? ok(res, c) : fail(res, 404, "Community not found.");
}
export function update(req: Request, res: Response) {
  const c = store.communities.get(id(req));
  if (!c) return fail(res, 404, "Community not found.");
  if (req.body.admin_id !== c.admin_id)
    return fail(res, 403, "Only the community admin may edit it.");
  if (req.body.community_desc !== undefined)
    c.community_desc = String(req.body.community_desc);
  if (req.body.community_banner !== undefined)
    c.community_banner = req.body.community_banner;
  return ok(res, c);
}
export function remove(req: Request, res: Response) {
  const c = store.communities.get(id(req));
  if (!c) return fail(res, 404, "Community not found.");
  if (req.body.admin_id !== c.admin_id)
    return fail(res, 403, "Only the community admin may delete it.");
  store.communities.delete(c.id);
  for (const p of store.posts.values())
    if (p.visibility === c.id) p.visibility = null;
  return ok(res, null, "Community deleted successfully.");
}
export function join(req: Request, res: Response) {
  const c = store.communities.get(id(req));
  const u = String(req.body.user_id ?? "");
  if (!c) return fail(res, 404, "Community not found.");
  if (!store.users.has(u)) return fail(res, 404, "User not found.");
  if (!store.has("member", u, c.id)) {
    store.toggle("member", u, c.id, true);
    c.population++;
  }
  return ok(res, { joined: true });
}
export function leave(req: Request, res: Response) {
  const c = store.communities.get(id(req));
  const u = String(req.body.user_id ?? "");
  if (c && store.has("member", u, c.id)) {
    store.toggle("member", u, c.id, false);
    c.population = Math.max(0, c.population - 1);
  }
  return ok(res, { joined: false });
}
export function recommendations(_req: Request, res: Response) {
  return ok(
    res,
    [...store.communities.values()].sort((a, b) => b.population - a.population),
  );
}
