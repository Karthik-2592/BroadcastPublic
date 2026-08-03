import type { Request, Response } from "express";
import { fail, id, ok, required } from "../../http.ts";
import { store } from "../../store.ts";
import { neo4jRelations } from "../../relations/neo4j.ts";
import type { Community } from "../../types.ts";
export async function create(req: Request, res: Response) {
  const missing = required(req.body, [
    "user_id",
    "community_name",
    "community_desc",
  ]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (!(await store.user(String(req.body.user_id))))
    return fail(res, 404, "User not found.");
  const community = await store.createCommunity({
    community_name: String(req.body.community_name),
    community_desc: String(req.body.community_desc),
    admin_id: String(req.body.user_id),
    tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    community_banner: req.body.community_banner,
  });
  await neo4jRelations.createCommunityNode(community.id);
  return ok(res, community, "Community created successfully.", 201);
}
export async function get(req: Request, res: Response) {
  const community = await store.community(id(req));
  return community
    ? ok(res, community)
    : fail(res, 404, "Community not found.");
}
export async function update(req: Request, res: Response) {
  const community = await store.community(id(req));
  if (!community) return fail(res, 404, "Community not found.");
  if (req.body.admin_id !== community.admin_id)
    return fail(res, 403, "Only the community admin may edit it.");
  const updated = await store.updateCommunity(
    id(req),
    req.body as Partial<Community>,
  );
  return updated ? ok(res, updated) : fail(res, 404, "Community not found.");
}
export async function remove(req: Request, res: Response) {
  const community = await store.community(id(req));
  if (!community) return fail(res, 404, "Community not found.");
  if (req.body.admin_id !== community.admin_id)
    return fail(res, 403, "Only the community admin may delete it.");
  await store.deleteCommunity(id(req));
  return ok(res, null, "Community deleted successfully.");
}
export async function recommendations(_req: Request, res: Response) {
  return ok(res, await store.communityRecommendations());
}
