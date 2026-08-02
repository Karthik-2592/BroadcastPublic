import neo4j, { type Driver, type Integer, type Session } from "neo4j-driver";

const uri = process.env.NEO4J_URI ?? "bolt://127.0.0.1:7687";
const username = process.env.NEO4J_USERNAME ?? "neo4j";
const password = process.env.NEO4J_PASSWORD ?? "change-me";
const database = process.env.NEO4J_DATABASE ?? "neo4j";

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
  async likeComment(userId: string, commentId: string, enabled: boolean) {
    return this.like("COMMENT", userId, commentId, enabled);
  }
  private async like(
    label: "POST" | "COMMENT",
    userId: string,
    entityId: string,
    enabled: boolean,
  ) {
    const property = label === "POST" ? "post_id" : "comment_id";
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
