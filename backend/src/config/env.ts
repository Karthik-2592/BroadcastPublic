import dotenv from "dotenv";

dotenv.config();

export const env = {
  sessionSecret: process.env.SESSION_SECRET ?? "development-only-session-secret",
  port: Number(process.env.PORT ?? 3001),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
  mongoDatabase: process.env.MONGODB_DATABASE ?? "broadcast",
  mongoServerSelectionTimeoutMs: Number(
    process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ?? 5000,
  ),
  publicCommunityId:
    process.env.PUBLIC_COMMUNITY_ID ?? "000000000000000000000001",
  neo4jUri: process.env.NEO4J_URI ?? "bolt://127.0.0.1:7687",
  neo4jUsername: process.env.NEO4J_USERNAME ?? "neo4j",
  neo4jPassword: process.env.NEO4J_PASSWORD ?? "change-me",
  neo4jDatabase: process.env.NEO4J_DATABASE ?? "neo4j",
  favoriteEventProcessIntervalMs: Number(
    process.env.FAVORITE_EVENT_PROCESS_INTERVAL_MS ?? 3 * 60 * 1000,
  ),
  favoriteEventQueueThreshold: Number(
    process.env.FAVORITE_EVENT_QUEUE_THRESHOLD ?? 100,
  ),
  sampleUserCount: Number(process.env.SAMPLE_USER_COUNT ?? 12),
  sampleCommunityCount: Number(process.env.SAMPLE_COMMUNITY_COUNT ?? 4),
  samplePostCount: Number(process.env.SAMPLE_POST_COUNT ?? 12),
  sampleCommentCount: Number(process.env.SAMPLE_COMMENT_COUNT ?? 24),
};
