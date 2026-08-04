import neo4j, { type Driver, type Integer, type Session } from "neo4j-driver";
import { env } from "../config/env.ts";

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
  async createPostNode(postId: string) {
    return this.write<number>(
      "POST.create",
      "MERGE (:POST {post_id: $postId}) RETURN 1 AS value",
      { postId },
    );
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
  async close() {
    await this.driver.close();
  }
}
export const neo4jRelations = new Neo4jRelations();
