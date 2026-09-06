import neo4j, { type Driver, type Integer, type Session } from "neo4j-driver";
import { env } from "./config/env.ts";

const uri = env.neo4jUri;
const username = env.neo4jUsername;
const password = env.neo4jPassword;
const database = env.neo4jDatabase;

export const numberValue = (
  value: Integer | number | boolean | null | undefined,
) =>
  typeof value === "object" && value !== null && "toNumber" in value
    ? value.toNumber()
    : Number(value ?? 0);

export class Neo4jRelations {
  private readonly driver: Driver = neo4j.driver(
    uri,
    neo4j.auth.basic(username, password),
  );
  private session(): Session {
    return this.driver.session({ database });
  }
  private neo4jInteger(value: number) {
    return neo4j.int(value);
  }

  private readonly queries = {
    userByInterests: `MATCH (me:USER {user_id: $userId})-[:INTERESTED_IN]->(:INTEREST)<-[:INTERESTED_IN]-(candidate:USER) WHERE candidate.user_id <> $userId AND NOT (me)-[:FOLLOWS]->(candidate) RETURN DISTINCT candidate.user_id AS userId ORDER BY userId LIMIT $limit`,
    userByCommunities: `MATCH (me:USER {user_id: $userId})-[:PARTICIPATES]->(:COMMUNITY)<-[:PARTICIPATES]-(candidate:USER) WHERE candidate.user_id <> $userId AND NOT (me)-[:FOLLOWS]->(candidate) RETURN DISTINCT candidate.user_id AS userId ORDER BY userId LIMIT $limit`,
    userByFollowNetwork: `MATCH (me:USER {user_id: $userId})-[:FOLLOWS]->(:USER)-[:FOLLOWS]->(candidate:USER) WHERE candidate.user_id <> $userId AND NOT (me)-[:FOLLOWS]->(candidate) RETURN DISTINCT candidate.user_id AS userId ORDER BY userId LIMIT $limit`,
    communityByInterests: `MATCH (me:USER {user_id: $userId})-[:INTERESTED_IN]->(:INTEREST)<-[:ASSOCIATED_WITH]-(community:COMMUNITY) WHERE NOT (me)-[:PARTICIPATES]->(community) RETURN DISTINCT community.community_id AS communityId ORDER BY communityId LIMIT $limit`,
    communityByFollowNetwork: `MATCH (me:USER {user_id: $userId})-[:FOLLOWS]->(:USER)-[:PARTICIPATES]->(community:COMMUNITY) WHERE NOT (me)-[:PARTICIPATES]->(community) RETURN DISTINCT community.community_id AS communityId ORDER BY communityId LIMIT $limit`,
    postByFollowedLikes: `MATCH (me:USER {user_id: $userId})-[:FOLLOWS]->(:USER)-[:LIKES]->(post:POST) WHERE NOT (me)-[:LIKES]->(post) RETURN DISTINCT post.post_id AS postId ORDER BY postId LIMIT $limit`,
    postByJoinedCommunities: `MATCH (me:USER {user_id: $userId})-[:PARTICIPATES]->(:COMMUNITY)<-[:BELONGS_TO]-(post:POST) RETURN DISTINCT post.post_id AS postId ORDER BY postId LIMIT $limit`,
  };

  async userRecommendationsGrouped(userId: string, limit = 4): Promise<[string[], string[], string[]]> {
    const session = this.session();
    try {
      return await session.executeRead(async (transaction) => {
        const params = { userId, limit: this.neo4jInteger(limit) };
        const resInterests = await transaction.run(this.queries.userByInterests, params);
        const resCommunities = await transaction.run(this.queries.userByCommunities, params);
        const resNetwork = await transaction.run(this.queries.userByFollowNetwork, params);
        return [
          resInterests.records.map((r) => String(r.get("userId"))),
          resCommunities.records.map((r) => String(r.get("userId"))),
          resNetwork.records.map((r) => String(r.get("userId"))),
        ];
      });
    } finally {
      await session.close();
    }
  }

  async communityRecommendationsGrouped(userId: string, limit = 8): Promise<[string[], string[], string[]]> {
    const session = this.session();
    try {
      return await session.executeRead(async (transaction) => {
        const params = { userId, limit: this.neo4jInteger(limit) };
        const resInterests = await transaction.run(this.queries.communityByInterests, params);
        const resNetwork = await transaction.run(this.queries.communityByFollowNetwork, params);
        return [
          resInterests.records.map((r) => String(r.get("communityId"))),
          resNetwork.records.map((r) => String(r.get("communityId"))),
          [] as string[],
        ];
      });
    } finally {
      await session.close();
    }
  }

  async postRecommendationsGrouped(userId: string, limit = 50): Promise<[string[], string[]]> {
    const session = this.session();
    try {
      return await session.executeRead(async (transaction) => {
        const params = { userId, limit: this.neo4jInteger(limit) };
        const resFollowedLikes = await transaction.run(this.queries.postByFollowedLikes, params);
        const resJoinedCommunities = await transaction.run(this.queries.postByJoinedCommunities, params);
        return [
          resFollowedLikes.records.map((r) => String(r.get("postId"))),
          resJoinedCommunities.records.map((r) => String(r.get("postId"))),
        ];
      });
    } finally {
      await session.close();
    }
  }

  async feedRecommendationsGrouped(
    userId: string,
    options: { postLimit?: number; userLimit?: number; communityLimit?: number } = {},
  ): Promise<{
    posts: [string[], string[]];
    users: [string[], string[], string[]];
    communities: [string[], string[], string[]];
  }> {
    const postLimit = this.neo4jInteger(options.postLimit ?? 50);
    const userLimit = this.neo4jInteger(options.userLimit ?? 4);
    const communityLimit = this.neo4jInteger(options.communityLimit ?? 8);

    const session = this.session();
    try {
      return await session.executeRead(async (transaction) => {
        const postParams = { userId, limit: postLimit };
        const userParams = { userId, limit: userLimit };
        const communityParams = { userId, limit: communityLimit };

        const resFollowedLikes = await transaction.run(this.queries.postByFollowedLikes, postParams);
        const resJoinedCommunities = await transaction.run(this.queries.postByJoinedCommunities, postParams);

        const resUserInterests = await transaction.run(this.queries.userByInterests, userParams);
        const resUserCommunities = await transaction.run(this.queries.userByCommunities, userParams);
        const resUserNetwork = await transaction.run(this.queries.userByFollowNetwork, userParams);

        const resCommInterests = await transaction.run(this.queries.communityByInterests, communityParams);
        const resCommNetwork = await transaction.run(this.queries.communityByFollowNetwork, communityParams);

        return {
          posts: [
            resFollowedLikes.records.map((r) => String(r.get("postId"))),
            resJoinedCommunities.records.map((r) => String(r.get("postId"))),
          ],
          users: [
            resUserInterests.records.map((r) => String(r.get("userId"))),
            resUserCommunities.records.map((r) => String(r.get("userId"))),
            resUserNetwork.records.map((r) => String(r.get("userId"))),
          ],
          communities: [
            resCommInterests.records.map((r) => String(r.get("communityId"))),
            resCommNetwork.records.map((r) => String(r.get("communityId"))),
            [] as string[],
          ],
        };
      });
    } finally {
      await session.close();
    }
  }
  private async write<T>(
    operation: string,
    query: string,
    parameters: Record<string, unknown>,
  ): Promise<T> {
    const session = this.session();
    try {
      const result = await session.executeWrite((transaction) =>
        transaction.run(query, parameters),
      );
      console.log(`[neo4j] ${operation}: success`);
      return result.records[0]?.get("value") as T;
    } catch (error) {
      console.log(`[neo4j] ${operation}: failed`, error);
      throw error;
    } finally {
      await session.close();
    }
  }
  async createUserNode(userId: string) {
    return this.write<number>(
      "USER.create",
      "MERGE (:USER {user_id: $userId}) RETURN 1 AS value",
      { userId },
    );
  }
  async interestIn(userId: string, interests: string[]) {
    return this.write<number>("USER.interests.sync", `MATCH (user:USER {user_id: $userId}) OPTIONAL MATCH (user)-[old:INTERESTED_IN]->(:INTEREST) DELETE old WITH user UNWIND $interests AS interest MERGE (tag:INTEREST {interest: interest}) MERGE (user)-[:INTERESTED_IN]->(tag) RETURN count(*) AS value`, { userId, interests });
  }
  async associatedWith(communityId: string, interests: string[]) {
    return this.write<number>("COMMUNITY.interests.sync", `MATCH (community:COMMUNITY {community_id: $communityId}) OPTIONAL MATCH (community)-[old:ASSOCIATED_WITH]->(:INTEREST) DELETE old WITH community UNWIND $interests AS interest MERGE (tag:INTEREST {interest: interest}) MERGE (community)-[:ASSOCIATED_WITH]->(tag) RETURN count(*) AS value`, { communityId, interests });
  }
  async deleteUserNode(userId: string) { return this.write<number>("USER.delete", "MATCH (user:USER {user_id: $userId}) DETACH DELETE user RETURN 1 AS value", { userId }); }
  async createPostNode(postId: string, communityId?: string | null) {
    return this.write<number>(
      "POST.create",
      "MERGE (post:POST {post_id: $postId}) WITH post OPTIONAL MATCH (post)-[old:BELONGS_TO]->() DELETE old WITH post FOREACH (_ IN CASE WHEN $communityId IS NULL THEN [] ELSE [1] END | MERGE (community:COMMUNITY {community_id: $communityId}) MERGE (post)-[:BELONGS_TO]->(community)) RETURN 1 AS value",
      { postId, communityId: communityId ?? null },
    );
  }
  async setPostCommunity(postId: string, communityId: string | null) {
    return this.createPostNode(postId, communityId);
  }
  async deletePostNode(postId: string) {
    return this.write<number>(
      "POST.delete",
      "MATCH (post:POST {post_id: $postId}) DETACH DELETE post RETURN 1 AS value",
      { postId },
    );
  }
  async createCommunityNode(communityId: string) {
    return this.write<number>(
      "COMMUNITY.create",
      "MERGE (:COMMUNITY {community_id: $communityId}) RETURN 1 AS value",
      { communityId },
    );
  }
  async deleteCommunityNode(communityId: string) { return this.write<number>("COMMUNITY.delete", "MATCH (community:COMMUNITY {community_id: $communityId}) DETACH DELETE community RETURN 1 AS value", { communityId }); }
  async follow(followerId: string, followedId: string, enabled: boolean) {
    return this.write<number>(
      enabled ? "FOLLOWS.merge" : "FOLLOWS.delete",
      enabled
        ? `MATCH (follower:USER {user_id: $followerId}), (followed:USER {user_id: $followedId}) MERGE (follower)-[r:FOLLOWS]->(followed) ON CREATE SET r.created_at = datetime(), r.created_now = true ON MATCH SET r.created_now = false WITH r, r.created_now AS created REMOVE r.created_now RETURN CASE WHEN created THEN 1 ELSE 0 END AS value`
        : `MATCH (follower:USER {user_id: $followerId})-[r:FOLLOWS]->(followed:USER {user_id: $followedId}) DELETE r RETURN count(r) AS value`,
      { followerId, followedId },
    );
  }
  async likePost(userId: string, postId: string, enabled: boolean) {
    return this.like("POST", userId, postId, enabled);
  }
  private async like(
    label: "POST",
    userId: string,
    entityId: string,
    enabled: boolean,
  ) {
    const property = "post_id";
    return this.write<number>(
      `LIKES.${label}.${enabled ? "merge" : "delete"}`,
      enabled
        ? `MATCH (user:USER {user_id: $userId}), (entity:${label} {${property}: $entityId}) MERGE (user)-[r:LIKES]->(entity) ON CREATE SET r.created_now = true ON MATCH SET r.created_now = false WITH r, r.created_now AS created REMOVE r.created_now RETURN CASE WHEN created THEN 1 ELSE 0 END AS value`
        : `MATCH (user:USER {user_id: $userId})-[r:LIKES]->(entity:${label} {${property}: $entityId}) DELETE r RETURN count(r) AS value`,
      { userId, entityId },
    );
  }
  async save(userId: string, postId: string, enabled: boolean) {
    return this.write<number>(
      enabled ? "SAVES.merge" : "SAVES.delete",
      enabled
        ? `MATCH (user:USER {user_id: $userId}), (post:POST {post_id: $postId}) MERGE (user)-[r:SAVES]->(post) ON CREATE SET r.created_at = datetime(), r.created_now = true ON MATCH SET r.created_now = false WITH r, r.created_now AS created REMOVE r.created_now RETURN CASE WHEN created THEN 1 ELSE 0 END AS value`
        : `MATCH (user:USER {user_id: $userId})-[r:SAVES]->(post:POST {post_id: $postId}) DELETE r RETURN count(r) AS value`,
      { userId, postId },
    );
  }
  async moderate(
    request: {
      adminId: string;
      userId: string;
      communityId: string;
      authorization: string;
    },
    enabled: boolean,
  ) {
    return this.write<number>(
      enabled ? "MODERATES.merge" : "MODERATES.delete",
      enabled
        ? `MATCH (admin:USER {user_id: $adminId}), (user:USER {user_id: $userId}), (community:COMMUNITY {community_id: $communityId}) MERGE (user)-[r:MODERATES]->(community) ON CREATE SET r.created_at = datetime() SET r.authorization = $authorization RETURN 1 AS value`
        : `MATCH (user:USER {user_id: $userId})-[r:MODERATES]->(community:COMMUNITY {community_id: $communityId}) DELETE r RETURN count(r) AS value`,
      request,
    );
  }
  async membership(userId: string, communityId: string, enabled: boolean) {
    return this.write<number>(
      enabled ? "PARTICIPATES.merge" : "PARTICIPATES.delete",
      enabled
        ? `MATCH (user:USER {user_id: $userId}), (community:COMMUNITY {community_id: $communityId}) MERGE (user)-[r:PARTICIPATES]->(community) ON CREATE SET r.joined_at = datetime(), r.created_now = true ON MATCH SET r.created_now = false WITH r, r.created_now AS created REMOVE r.created_now RETURN CASE WHEN created THEN 1 ELSE 0 END AS value`
        : `MATCH (user:USER {user_id: $userId})-[r:PARTICIPATES]->(community:COMMUNITY {community_id: $communityId}) DELETE r RETURN count(r) AS value`,
      { userId, communityId },
    );
  }
  async memberCommunityIds(userId: string) {
    const session = this.session();
    try {
      const result = await session.executeRead((transaction) =>
        transaction.run(
          "MATCH (user:USER {user_id: $userId})-[:PARTICIPATES]->(community:COMMUNITY) RETURN community.community_id AS communityId ORDER BY communityId DESC",
          { userId },
        ),
      );
      return result.records.map((record) => String(record.get("communityId")));
    } finally { await session.close(); }
  }
  async isFollowing(followerId: string, followedId: string) {
    const session = this.session();
    try {
      const result = await session.executeRead((transaction) => transaction.run("MATCH (follower:USER {user_id: $followerId})-[rel:FOLLOWS]->(followed:USER {user_id: $followedId}) RETURN count(rel) > 0 AS active", { followerId, followedId }));
      return Boolean(result.records[0]?.get("active"));
    } finally { await session.close(); }
  }
  async savedPostIds(userId: string, lastPostId?: string, limit?: number) {
    const session = this.session();
    try {
      const whereClause = lastPostId ? "WHERE post.post_id < $lastPostId" : "";
      const limitClause = limit ? "LIMIT $limit" : "";
      const query = `MATCH (user:USER {user_id: $userId})-[:SAVES]->(post:POST) ${whereClause} RETURN DISTINCT post.post_id AS postId ORDER BY postId DESC ${limitClause}`;
      const result = await session.executeRead((transaction) =>
        transaction.run(query, {
          userId,
          lastPostId: lastPostId ?? null,
          limit: limit ? this.neo4jInteger(limit) : null,
        }),
      );
      return result.records.map((record) => String(record.get("postId")));
    } finally { await session.close(); }
  }
  async isMember(userId: string, communityId: string) {
    const session = this.session();
    try {
      const result = await session.executeRead((transaction) => transaction.run("MATCH (user:USER {user_id: $userId})-[rel:PARTICIPATES]->(community:COMMUNITY {community_id: $communityId}) RETURN count(rel) > 0 AS active", { userId, communityId }));
      return Boolean(result.records[0]?.get("active"));
    } finally { await session.close(); }
  }
  async isPostLiked(userId: string, postId: string) { return this.isRelation("LIKES", "user_id", userId, "post_id", postId); }
  async postLikeStatusBatch(userId: string, postIds: string[]) {
    const session = this.session();
    try {
      const result = await session.executeRead((transaction) =>
        transaction.run(
          `MATCH (user:USER {user_id: $userId})-[rel:LIKES]->(post:POST) WHERE post.post_id IN $postIds RETURN post.post_id AS postId`,
          { userId, postIds },
        ),
      );
      const likedSet = new Set(result.records.map((r) => String(r.get("postId"))));
      const map: Record<string, boolean> = {};
      for (const id of postIds) {
        map[id] = likedSet.has(id);
      }
      return map;
    } finally {
      await session.close();
    }
  }
  async isPostSaved(userId: string, postId: string) { return this.isRelation("SAVES", "user_id", userId, "post_id", postId); }
  private async isRelation(relation: "LIKES" | "SAVES", userProperty: string, userId: string, entityProperty: string, entityId: string) {
    const session = this.session();
    try {
      const result = await session.executeRead((transaction) => transaction.run(`MATCH (user:USER {${userProperty}: $userId})-[rel:${relation}]->(entity:POST {${entityProperty}: $entityId}) RETURN count(rel) > 0 AS active`, { userId, entityId }));
      return Boolean(result.records[0]?.get("active"));
    } finally { await session.close(); }
  }
  async relatedUserIds(userId: string, direction: "followers" | "following", lastUserId?: string, limit = 11) {
    const session = this.session();
    try {
      const matchClause = direction === "followers"
        ? "MATCH (user:USER {user_id: $userId})<-[:FOLLOWS]-(related:USER)"
        : "MATCH (user:USER {user_id: $userId})-[:FOLLOWS]->(related:USER)";
      const whereClause = lastUserId ? "WHERE related.user_id < $lastUserId" : "";
      const query = `${matchClause} ${whereClause} RETURN related.user_id AS userId ORDER BY related.user_id DESC LIMIT $limit`;
      const result = await session.executeRead((transaction) =>
        transaction.run(query, {
          userId,
          lastUserId: lastUserId ?? null,
          limit: this.neo4jInteger(limit),
        }),
      );
      return result.records.map((record) => String(record.get("userId")));
    } finally {
      await session.close();
    }
  }
  async allRelatedUserIds(userId: string, direction: "followers" | "following"): Promise<string[]> {
    const session = this.session();
    try {
      const matchClause = direction === "followers"
        ? "MATCH (user:USER {user_id: $userId})<-[:FOLLOWS]-(related:USER)"
        : "MATCH (user:USER {user_id: $userId})-[:FOLLOWS]->(related:USER)";
      const query = `${matchClause} RETURN DISTINCT related.user_id AS userId`;
      const result = await session.executeRead((transaction) =>
        transaction.run(query, { userId }),
      );
      return result.records.map((record) => String(record.get("userId")));
    } finally {
      await session.close();
    }
  }
  async likedPostIds(userId: string): Promise<string[]> {
    const session = this.session();
    try {
      const result = await session.executeRead((transaction) =>
        transaction.run(
          "MATCH (user:USER {user_id: $userId})-[:LIKES]->(post:POST) RETURN DISTINCT post.post_id AS postId",
          { userId },
        ),
      );
      return result.records.map((record) => String(record.get("postId")));
    } finally {
      await session.close();
    }
  }
  async close() {
    await this.driver.close();
  }
}
export const neo4jRelations = new Neo4jRelations();
