import { MongoClient, ObjectId } from "mongodb";
import neo4j, { type Driver, type Session } from "neo4j-driver";
import { env } from "../src/config/env.ts";


const mongoUri = env.mongoUri;
const databaseName = env.mongoDatabase;
const mongoTimeout = env.mongoServerSelectionTimeoutMs;
const neo4jUri = env.neo4jUri;
const neo4jUsername = env.neo4jUsername;
const neo4jPassword = env.neo4jPassword;
const neo4jDatabase = env.neo4jDatabase;

type MongoEntity = { _id: ObjectId; community_id?: ObjectId | null };
type MongoCommunity = MongoEntity & { admin_id: ObjectId };
type RelationPair = { userId: string; targetId: string };
type ModeratorRelation = {
  adminId: string;
  userId: string;
  communityId: string;
};

function randomChoice<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function randomPairs(
  users: string[],
  targets: string[],
  count: number,
  allowSelf = false,
): RelationPair[] {
  const pairs: RelationPair[] = [];
  const keys = new Set<string>();
  const maximum = users.length * targets.length;
  const requested = Math.min(count, maximum);
  let attempts = 0;
  while (pairs.length < requested && attempts < requested * 20 + 20) {
    attempts += 1;
    const userId = randomChoice(users);
    const targetId = randomChoice(targets);
    if (!allowSelf && userId === targetId) continue;
    const key = `${userId}:${targetId}`;
    if (keys.has(key)) continue;
    keys.add(key);
    pairs.push({ userId, targetId });
  }
  return pairs;
}

async function write(
  session: Session,
  operation: string,
  query: string,
  parameters: Record<string, unknown>,
) {
  await session.executeWrite((transaction) =>
    transaction.run(query, parameters),
  );
  console.log(`[neo4j:seed] ${operation}: success`);
}

async function seed() {
  const mongo = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: mongoTimeout,
  });
  const driver: Driver = neo4j.driver(
    neo4jUri,
    neo4j.auth.basic(neo4jUsername, neo4jPassword),
  );
  try {
    await mongo.connect();
    const database = mongo.db(databaseName);
    const [users, posts, communities] = await Promise.all([
      database.collection<MongoEntity>("users").find({}, { projection: { _id: 1 } }).toArray(),
      database.collection<MongoEntity>("posts").find({}, { projection: { _id: 1, community_id: 1 } }).toArray(),
      database
        .collection<MongoCommunity>("communities")
        .find({}, { projection: { _id: 1, admin_id: 1 } })
        .toArray(),
    ]);
    const userIds = users.map((user) => user._id.toHexString());
    const postIds = posts.map((post) => post._id.toHexString());
    const communityIds = communities.map((community) =>
      community._id.toHexString(),
    );
    if (!userIds.length || !postIds.length || !communityIds.length)
      throw new Error("MongoDB must contain users, posts, and communities first");

    const session = driver.session({ database: neo4jDatabase });
    try {
      // Fetch existing interests from Neo4j
      const interestsResult = await session.run("MATCH (i:INTEREST) RETURN i.interest AS interest");
      const interests = interestsResult.records.map((record) => record.get("interest") as string);
      console.log(`[neo4j:seed] found ${interests.length} interests`);

      await write(
        session,
        "entity nodes",
        `UNWIND $userIds AS id MERGE (:USER {user_id: id})
         WITH 1 AS ignored
         UNWIND $postIds AS postId MERGE (:POST {post_id: postId})
         WITH 1 AS ignored
         UNWIND $communityIds AS communityId MERGE (:COMMUNITY {community_id: communityId})`,
        { userIds, postIds, communityIds },
      );

      const follows = randomPairs(userIds, userIds, 10);
      const postLikes = randomPairs(userIds, postIds, 10, true);
      const saves = randomPairs(userIds, postIds, 8, true);
      const memberships = randomPairs(userIds, communityIds, 8, true);
      const moderators: ModeratorRelation[] = communities.map((community) => ({
        adminId: community.admin_id.toHexString(),
        userId: randomChoice(userIds),
        communityId: community._id.toHexString(),
      }));

      // Create community-interest (ASSOCIATED_WITH) relations
      const communityInterests: { communityId: string; interest: string }[] = [];
      for (const community of communities) {
        const numInterests = Math.floor(Math.random() * 3) + 1; // 1-3 interests per community
        const shuffledInterests = [...interests].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(numInterests, shuffledInterests.length); i++) {
          communityInterests.push({
            communityId: community._id.toHexString(),
            interest: shuffledInterests[i],
          });
        }
      }

      // Create user-interest (INTERESTED_IN) relations
      const userInterests: { userId: string; interest: string }[] = [];
      for (const user of users) {
        const numInterests = Math.floor(Math.random() * 4) + 1; // 1-4 interests per user
        const shuffledInterests = [...interests].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(numInterests, shuffledInterests.length); i++) {
          userInterests.push({
            userId: user._id.toHexString(),
            interest: shuffledInterests[i],
          });
        }
      }

      await write(
        session,
        "BELONGS_TO relations",
        `UNWIND $relations AS relation
         MATCH (post:POST {post_id: relation.postId}),
               (community:COMMUNITY {community_id: relation.communityId})
         MERGE (post)-[:BELONGS_TO]->(community)`,
        { relations: posts.flatMap((post) => post.community_id ? [{ postId: post._id.toHexString(), communityId: post.community_id.toHexString() }] : []) },
      );

      await write(
        session,
        "FOLLOWS relations",
        `UNWIND $relations AS relation
         MATCH (follower:USER {user_id: relation.userId}),
               (followed:USER {user_id: relation.targetId})
         MERGE (follower)-[:FOLLOWS]->(followed)`,
        { relations: follows },
      );
      await write(
        session,
        "LIKES post relations",
        `UNWIND $relations AS relation
         MATCH (user:USER {user_id: relation.userId}),
               (post:POST {post_id: relation.targetId})
         MERGE (user)-[:LIKES]->(post)`,
        { relations: postLikes },
      );
      await write(
        session,
        "SAVES relations",
        `UNWIND $relations AS relation
         MATCH (user:USER {user_id: relation.userId}),
               (post:POST {post_id: relation.targetId})
         MERGE (user)-[:SAVES]->(post)`,
        { relations: saves },
      );
      await write(
        session,
        "PARTICIPATES relations",
        `UNWIND $relations AS relation
         MATCH (user:USER {user_id: relation.userId}),
               (community:COMMUNITY {community_id: relation.targetId})
         MERGE (user)-[:PARTICIPATES]->(community)`,
        { relations: memberships },
      );
      await write(
        session,
        "MODERATES relations",
        `UNWIND $relations AS relation
         MATCH (admin:USER {user_id: relation.adminId}),
               (user:USER {user_id: relation.userId}),
               (community:COMMUNITY {community_id: relation.communityId})
         MERGE (user)-[relationEdge:MODERATES]->(community)
         SET relationEdge.authorization = "MODERATOR"`,
        { relations: moderators },
      );

      await write(
        session,
        "ASSOCIATED_WITH relations",
        `UNWIND $relations AS relation
         MATCH (community:COMMUNITY {community_id: relation.communityId}),
               (interest:INTEREST {interest: relation.interest})
         MERGE (community)-[:ASSOCIATED_WITH]->(interest)`,
        { relations: communityInterests },
      );

      await write(
        session,
        "INTERESTED_IN relations",
        `UNWIND $relations AS relation
         MATCH (user:USER {user_id: relation.userId}),
               (interest:INTEREST {interest: relation.interest})
         MERGE (user)-[:INTERESTED_IN]->(interest)`,
        { relations: userInterests },
      );

      console.log(
        `[neo4j:seed] complete: users=${userIds.length} posts=${postIds.length} communities=${communityIds.length} communityInterests=${communityInterests.length} userInterests=${userInterests.length}`,
      );
    } finally {
      await session.close();
    }
  } finally {
    await mongo.close();
    await driver.close();
  }
}

seed().catch((error) => {
  console.error("[neo4j:seed] failed", error);
  process.exitCode = 1;
});
