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
  private async rankedUsers(operation: string, query: string, userId: string, limit: number) {
    const session = this.session();
    try {
      const result = await session.executeRead((transaction) => transaction.run(query, { userId, limit }));
      return result.records.map((record) => ({ id: String(record.get("userId")), score: numberValue(record.get("score")) }));
    } finally { await session.close(); }
  }
  private async rankedCommunities(operation: string, query: string, userId: string, limit: number) {
    const session = this.session();
    try {
      const result = await session.executeRead((transaction) => transaction.run(query, { userId, limit }));
      return result.records.map((record) => ({ id: String(record.get("communityId")), score: numberValue(record.get("score")) }));
    } finally { await session.close(); }
  }

  userRecommendationsByInterests(userId: string, limit = 4) {
    return this.rankedUsers("recommend.users.interests", `MATCH (me:USER {user_id: $userId})-[:INTERESTED_IN]->(interest:INTEREST)<-[:INTERESTED_IN]-(candidate:USER) WHERE candidate.user_id <> $userId AND NOT (me)-[:FOLLOWS]->(candidate) RETURN candidate.user_id AS userId, count(DISTINCT interest) AS score ORDER BY score DESC, userId LIMIT $limit`, userId, limit);
  }
  userRecommendationsByCommunities(userId: string, limit = 4) {
    return this.rankedUsers("recommend.users.communities", `MATCH (me:USER {user_id: $userId})-[:PARTICIPATES]->(community:COMMUNITY)<-[:PARTICIPATES]-(candidate:USER) WHERE candidate.user_id <> $userId AND NOT (me)-[:FOLLOWS]->(candidate) RETURN candidate.user_id AS userId, count(DISTINCT community) AS score ORDER BY score DESC, userId LIMIT $limit`, userId, limit);
  }
  userRecommendationsByFollowNetwork(userId: string, limit = 4) {
    return this.rankedUsers("recommend.users.network", `MATCH (me:USER {user_id: $userId})-[:FOLLOWS]->(followed:USER)-[:FOLLOWS]->(candidate:USER) WHERE candidate.user_id <> $userId AND NOT (me)-[:FOLLOWS]->(candidate) RETURN candidate.user_id AS userId, count(DISTINCT followed) AS score ORDER BY score DESC, userId LIMIT $limit`, userId, limit);
  }
  communityRecommendationsByInterests(userId: string, limit = 8) {
    return this.rankedCommunities("recommend.communities.interests", `MATCH (me:USER {user_id: $userId})-[:INTERESTED_IN]->(interest:INTEREST)<-[:ASSOCIATED_WITH]-(community:COMMUNITY) WHERE NOT (me)-[:PARTICIPATES]->(community) RETURN community.community_id AS communityId, count(DISTINCT interest) AS score ORDER BY score DESC, communityId LIMIT $limit`, userId, limit);
  }
  communityRecommendationsByFollowNetwork(userId: string, limit = 8) {
    return this.rankedCommunities("recommend.communities.network", `MATCH (me:USER {user_id: $userId})-[:FOLLOWS]->(followed:USER)-[:PARTICIPATES]->(community:COMMUNITY) WHERE NOT (me)-[:PARTICIPATES]->(community) RETURN community.community_id AS communityId, count(DISTINCT followed) AS score ORDER BY score DESC, communityId LIMIT $limit`, userId, limit);
  }
  communityRecommendationsByLikedPosts(_userId: string, _limit = 8) {
    // Post-to-community graph edges are not yet part of the persisted model.
    // Keep this strategy as a scaffold until that relationship is introduced.
    return Promise.resolve([] as { id: string; score: number }[]);
  }
  postRecommendations(_userId: string, _limit = 10) {
    // Ranking and recommendation reasons will be defined in a later task.
    return Promise.resolve([] as { id: string; score: number; reason?: string }[]);
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
  async relatedUserIds(userId: string, direction: "followers" | "following", offset = 0, limit = 11) {
    const session = this.session();
    try {
      const query = direction === "followers"
        ? "MATCH (user:USER {user_id: $userId})<-[:FOLLOWS]-(related:USER) RETURN related.user_id AS userId"
        : "MATCH (user:USER {user_id: $userId})-[:FOLLOWS]->(related:USER) RETURN related.user_id AS userId";
      const result = await session.executeRead((transaction) =>
        transaction.run(`${query} SKIP $offset LIMIT $limit`, { userId, offset, limit }),
      );
      return result.records.map((record) => String(record.get("userId")));
    } finally {
      await session.close();
    }
  }
  async close() {
    await this.driver.close();
  }
}
export const neo4jRelations = new Neo4jRelations();
