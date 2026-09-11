import type { Request, Response } from "express";
import { fail, id, ok, required } from "../http.ts";
import { store } from "../mongodb.ts";
import { neo4jRelations, numberValue } from "../neo4j.ts";
import type { Community, MembershipRelationRequest, ModeratorRelationRequest } from "../types.ts";
import { sendEvent } from "../services/events.ts";
import { Router } from "express";
import { requireSession, sessionUserId } from "../session.ts";
import { mediaUrl, saveMedia, type UploadedFile } from "../media.ts";
import type { SessionRequest } from "../session.ts";

async function withMembership(req: Request, community: Community): Promise<Community> {
  const userId = (req as SessionRequest).session?.userId;
  return { ...community, isMember: userId ? await neo4jRelations.isMember(userId, community.id) : false };
}

async function withMemberships(req: Request, communities: Community[]): Promise<Community[]> {
  return Promise.all(communities.map((community) => withMembership(req, community)));
}

export async function create(req: Request, res: Response) {
  const userId = sessionUserId(req);
  const missing = required(req.body, [
    "community_name",
    "community_desc",
    "community_guidelines",
  ]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  if (
    typeof req.body.community_guidelines !== "string" ||
    req.body.community_guidelines.length > 300
  )
    return fail(res, 400, "community_guidelines must be a string of at most 300 characters.");
  if (!(await store.user(userId)))
    return fail(res, 404, "User not found.");
  let community: Community;
  try {
    community = await store.createCommunity({
      community_name: String(req.body.community_name),
      community_desc: String(req.body.community_desc),
      community_guidelines: String(req.body.community_guidelines),
      admin_id: userId,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      community_banner: req.body.community_banner,
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000)
      return fail(res, 409, "A community with this name already exists.");
    throw error;
  }
  await neo4jRelations.createCommunityNode(community.id);
  await neo4jRelations.membership(userId, community.id, true);
  await neo4jRelations.moderate(
    {
      adminId: userId,
      userId,
      communityId: community.id,
      authorization: "admin",
    },
    true,
  );
  await neo4jRelations.associatedWith(community.id, community.tags);
  return ok(res, { ...community, isMember: true }, "Community created successfully.", 201);
}
export async function get(req: Request, res: Response) {
  const community = await store.community(id(req));
  return community
    ? ok(res, await withMembership(req, community))
    : fail(res, 404, "Community not found.");
}
export async function uploadBanner(req: Request, res: Response) {
  const communityId = id(req);
  const community = await store.community(communityId);
  if (!community) return fail(res, 404, "Community not found.");
  if (community.admin_id !== sessionUserId(req)) return fail(res, 403, "Only the community admin may upload a banner.");
  const file = (((req as unknown as { files?: UploadedFile[] }).files) ?? [])[0];
  if (!file) return fail(res, 400, "A community banner is required.");
  const saved = await saveMedia(file, communityId, "community", 0, "PUT");
  const updated = await store.updateCommunity(communityId, { community_banner: { media_id: saved.media_id, media_url: mediaUrl(saved.path), mime_type: saved.mime_type } });
  return updated ? ok(res, updated, "Community banner uploaded successfully.", 201) : fail(res, 500, "Unable to store community banner metadata.");
}
export async function posts(req: Request, res: Response) {
  const sort = req.query.sort === "top" ? "top" : "new";
  try {
    const page = await store.postsForCommunity(id(req), typeof req.query.cursor === "string" ? req.query.cursor : undefined, sort);
    return ok(res, page.items, "Operation completed successfully.", 200, page.nextCursor);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Malformed cursor.";
    return fail(res, 400, message);
  }
}
export async function update(req: Request, res: Response) {
  const community = await store.community(id(req));
  if (!community) return fail(res, 404, "Community not found.");
  if (sessionUserId(req) !== community.admin_id)
    return fail(res, 403, "Only the community admin may edit it.");
  const updated = await store.updateCommunity(
    id(req),
    req.body as Partial<Community>,
  );
  if (updated && Array.isArray(req.body.tags)) await neo4jRelations.associatedWith(updated.id, updated.tags);
  return updated ? ok(res, await withMembership(req, updated)) : fail(res, 404, "Community not found.");
}
export async function remove(req: Request, res: Response) {
  const community = await store.community(id(req));
  if (!community) return fail(res, 404, "Community not found.");
  if (sessionUserId(req) !== community.admin_id)
    return fail(res, 403, "Only the community admin may delete it.");
  const deleted = await store.deleteCommunity(id(req));
  if (deleted) {
    await neo4jRelations.deleteCommunityNode(id(req));
    sendEvent({
      content_id: id(req),
      content_type: "community",
      action: "delete",
      target_id: null,
      timestamp: new Date().toISOString(),
    });
  }
  return ok(res, null, "Community deleted successfully.");
}
export async function recommendations(_req: Request, res: Response) {
  try {
    const page = await store.communityRecommendations(typeof _req.query.cursor === "string" ? _req.query.cursor : undefined);
    return ok(res, await withMemberships(_req, page.items), "Operation completed successfully.", 200, page.nextCursor);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Malformed cursor.";
    return fail(res, 400, message);
  }
}
export async function personalizedRecommendations(req: Request, res: Response) {
  const userId = String(req.params.userId);
  if (!(await store.user(userId))) return fail(res, 404, "User not found.");
  const groups = await neo4jRelations.communityRecommendationsGrouped(userId);
  const ids = [...new Set(groups.flat())].slice(0, 8);
  return ok(res, await withMemberships(req, await store.communitiesByIds(ids)));
}
export async function moderate(req: Request, res: Response): Promise<Response> {
  const body = req.body as Partial<ModeratorRelationRequest>;
  const adminId = sessionUserId(req);
  const missing = required(body, ["user_id", "community_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  const community = await store.community(body.community_id!);
  if (
    !(await store.user(adminId)) ||
    !(await store.user(body.user_id!)) ||
    !community
  )
    return fail(res, 404, "User or community not found. 6");
  if (community.admin_id !== adminId)
    return fail(res, 403, "Only the community admin may manage moderators.");
  const enabled = req.method === "POST";
  const authorization = body.authorization ?? "MODERATOR";
  const changed = numberValue(
    await neo4jRelations.moderate(
      {
        adminId,
        userId: body.user_id!,
        communityId: body.community_id!,
        authorization,
      },
      enabled,
    ),
  );
  return ok(res, { active: enabled, authorization, changed: Boolean(changed) });
}
export async function membership(
  req: Request,
  res: Response,
): Promise<Response> {
  const body = req.body as Partial<MembershipRelationRequest>;
  const userId = sessionUserId(req);
  const missing = required(body, ["community_id"]);
  if (missing.length)
    return fail(res, 400, `Missing required fields: ${missing.join(", ")}`);
  console.log("delete", req.method, body.community_id, userId)
  if (
    !(await store.user(userId)) ||
    !(await store.community(body.community_id!))
  )
    return fail(res, 404, "User or community not found. 7");
  const enabled = req.method === "POST";
  const changed = numberValue(
    await neo4jRelations.membership(userId, body.community_id!, enabled),
  );
  if (changed)
    await store.incrementCommunityPopulation(
      body.community_id!,
      enabled ? 1 : -1,
    );
  return ok(res, { active: enabled, changed: Boolean(changed) });
}
export async function memberships(req: Request, res: Response) {
  const userId = sessionUserId(req);
  if (!(await store.user(userId))) return fail(res, 404, "User not found.");
  const communityIds = await neo4jRelations.memberCommunityIds(userId);
  return ok(res, await withMemberships(req, await store.communitiesByIds(communityIds)));
}

const r = Router();
r.get("/recommendations", recommendations);
r.get("/recommendations/:userId", personalizedRecommendations);
r.get("/memberships", requireSession, memberships);
r.post("/", requireSession, create);
r.get("/:id/posts", posts);
r.get("/:id", get);
r.put("/:id", requireSession, update);
r.post("/moderators", requireSession, moderate);
r.delete("/moderators", requireSession, moderate);
r.post("/memberships", requireSession, membership);
r.delete("/memberships", requireSession, membership);
r.delete("/:id", requireSession, remove);

export default r;
